import os
import time
from datetime import datetime, date, timedelta
from dotenv import load_dotenv, find_dotenv
from langchain_core.messages import AIMessage
from litellm import completion
from litellm.exceptions import RateLimitError
from logger import logger
from supabase import create_client
from ...states.time_management_agent_state import TimanaAgentState
from ...utils.helpers import parsing_messages_to_history, remove_think_tag
from ...utils.const_prompts import (
    CONST_AGENT_NAME,
    CONST_AGENT_TONE,
    CONST_FORM_ADDRESS_IN_VN
)
from config import LLM_MODELS

load_dotenv(find_dotenv())

def completion_with_retry(max_retries=3, initial_delay=2, **kwargs):
    """Call completion with retry logic for rate limit errors"""
    for attempt in range(max_retries):
        try:
            return completion(**kwargs)
        except RateLimitError as e:
            if attempt < max_retries - 1:
                # Exponential backoff: 2s, 4s, 8s
                delay = initial_delay * (2 ** attempt)
                logger.warning(f"⚠️ Rate limit hit, retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(delay)
            else:
                logger.error(f"❌ Rate limit error after {max_retries} attempts: {e}")
                raise
        except Exception as e:
            # For other errors, don't retry
            raise

# --- SUPABASE INIT ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_tasks_node(state: TimanaAgentState):
    """
    Node này dùng để:
      - Lấy danh sách công việc từ Supabase.
      - Hiểu ngữ cảnh người dùng (VD: 'hôm nay', 'ngày mai', 'tuần này', 'tất cả').
      - Trả về danh sách công việc bằng giọng thân thiện, dễ hiểu.
    """
    logger.info("🧩 get_tasks_node called.")
    user_input = state["messages"][-1].content
    chat_history = parsing_messages_to_history(state.get("messages", ""))

    # --- Step 1: Phân tích người dùng hỏi ngày nào ---
    # Dùng LLM để xác định phạm vi thời gian (today, tomorrow, week, all)
    # Lấy ngày hiện tại để làm context
    today = date.today()
    today_str_vi = today.strftime("%d-%m-%Y")
    tomorrow = today + timedelta(days=1)
    tomorrow_str_vi = tomorrow.strftime("%d-%m-%Y")
    
    # Check if user_input contains a specific date (e.g., "ngày 2-12-2025", "2/12/2025")
    import re
    date_patterns = [
        r'ngày\s+(\d{1,2}[-/]\d{1,2}[-/]\d{4})',  # "ngày 2-12-2025"
        r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})',  # "2-12-2025" or "2/12/2025"
        r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})',  # "2025-12-02"
    ]
    
    specific_date = None
    for pattern in date_patterns:
        match = re.search(pattern, user_input, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            # Parse date from different formats
            try:
                # Try multiple date formats
                date_formats = [
                    "%d-%m-%Y",  # 2-12-2025
                    "%d/%m/%Y",  # 2/12/2025
                    "%Y-%m-%d",  # 2025-12-02
                    "%Y/%m/%d",  # 2025/12/02
                ]
                parsed_date = None
                for fmt in date_formats:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt).date()
                        break
                    except ValueError:
                        continue
                
                if parsed_date:
                    specific_date = parsed_date.isoformat()  # YYYY-MM-DD
                    logger.info(f"🔍 Detected specific date in user input: {date_str} -> {specific_date}")
                    break
                else:
                    logger.warning(f"⚠️ Could not parse date '{date_str}' with any format")
            except Exception as e:
                logger.warning(f"⚠️ Could not parse date '{date_str}': {e}")
    
    detect_time_prompt = f"""
    Bạn là trợ lý thông minh tên {CONST_AGENT_NAME}.
    Hãy đọc câu của người dùng và xác định họ muốn xem công việc trong khoảng thời gian nào.

    THÔNG TIN NGÀY HIỆN TẠI:
    - Hôm nay: {today_str_vi} ({today.isoformat()})
    - Ngày mai: {tomorrow_str_vi} ({tomorrow.isoformat()})

    Output JSON dạng:
    {{
      "scope": "today" | "tomorrow" | "week" | "all" | "specific_date",
      "date": "YYYY-MM-DD" (chỉ có khi scope là "specific_date")
    }}

    ⚠️ QUAN TRỌNG: Phân biệt RÕ RÀNG các scope:
    - "today", "hôm nay", "hôm nay có gì", "hôm nay tôi có việc gì" => "today"
    - "tomorrow", "ngày mai", "mai", "ngày mai có gì" => "tomorrow"
    - "week", "tuần này", "trong tuần này", "tuần này có gì" => "week"
    - "all", "tất cả", "liệt kê tất cả" => "all"
    - Nếu có ngày cụ thể (ví dụ: "ngày 2-12-2025", "02/12/2025", "2025-12-02") => "specific_date" + date

    Ví dụ cụ thể (PHẢI phân biệt chính xác):
    - "Công việc hôm nay" => {{"scope": "today"}}
    - "Hôm nay tôi có gì không" => {{"scope": "today"}}
    - "Ngày mai phải làm gì" => {{"scope": "tomorrow"}}
    - "Ngày mai tôi có việc gì không" => {{"scope": "tomorrow"}}
    - "ngày 2-12-2025 tôi có việc gì" => {{"scope": "specific_date", "date": "2025-12-02"}}
    - "ngày 02/12/2025 có gì không" => {{"scope": "specific_date", "date": "2025-12-02"}}
    - "Tuần này có gì không?" => {{"scope": "week"}}
    - "Liệt kê tất cả công việc" => {{"scope": "all"}}

    Câu người dùng: "{user_input}"
    
    ⚠️ LƯU Ý QUAN TRỌNG:
    - Nếu câu hỏi có từ "ngày mai" hoặc "mai" → PHẢI trả về "tomorrow", KHÔNG được trả về "today"
    - Nếu câu hỏi có ngày cụ thể (ví dụ: "ngày 2-12-2025") → PHẢI trả về "specific_date" với date đúng format YYYY-MM-DD
    - Nếu câu hỏi có cả "ngày mai" và ngày cụ thể → ưu tiên ngày cụ thể
    
    Chỉ trả lời JSON, không giải thích thêm.
    """

    response = completion_with_retry(
        api_key=os.getenv("GROQ_API_KEY"),
        model=LLM_MODELS["task_subgraph"]["add_task_node"],
        messages=[{"role": "user", "content": detect_time_prompt}],
        temperature=0.2,
        tools=None,
        tool_choice="none"
    )

    import json
    try:
        raw_response = response.choices[0].message.content
        logger.info(f"🔍 Raw scope detection response: {raw_response}")
        parsed = json.loads(remove_think_tag(raw_response))
        scope = parsed.get("scope", "today")
        detected_date = parsed.get("date")  # For specific_date scope
        
        # If we detected a specific date from regex, use it
        if specific_date:
            scope = "specific_date"
            detected_date = specific_date
            logger.info(f"🔍 Overriding scope to 'specific_date' based on regex detection: {detected_date}")
        
        # Validate scope
        valid_scopes = ["today", "tomorrow", "week", "all", "specific_date"]
        if scope not in valid_scopes:
            logger.warning(f"⚠️ Invalid scope detected: {scope}, defaulting to 'today'")
            scope = "today"
        
        # Validate specific_date
        if scope == "specific_date":
            if not detected_date:
                # Try to extract from user_input again
                if specific_date:
                    detected_date = specific_date
                else:
                    logger.warning(f"⚠️ scope is 'specific_date' but no date provided, defaulting to 'today'")
                    scope = "today"
            else:
                # Validate date format
                try:
                    date.fromisoformat(detected_date)
                    logger.info(f"🔍 Validated specific date: {detected_date}")
                except ValueError:
                    logger.warning(f"⚠️ Invalid date format: {detected_date}, defaulting to 'today'")
                    scope = "today"
            
        # Double-check: nếu user_input có "ngày mai" hoặc "mai" nhưng scope là "today" → fix
        user_input_lower = user_input.lower()
        if scope != "specific_date" and ("ngày mai" in user_input_lower or " mai " in user_input_lower or user_input_lower.startswith("mai")) and scope == "today":
            logger.warning(f"⚠️ Scope mismatch detected! User asked about 'ngày mai' but got scope='today'. Fixing to 'tomorrow'")
            scope = "tomorrow"
            
    except Exception as e:
        logger.error(f"⚠️ JSON parsing error in get_tasks_node: {e}")
        logger.error(f"⚠️ Raw response was: {response.choices[0].message.content if response else 'N/A'}")
        # Fallback: check user_input directly
        if specific_date:
            scope = "specific_date"
            detected_date = specific_date
            logger.info(f"🔍 Fallback: using regex-detected date: {detected_date}")
        else:
            user_input_lower = user_input.lower()
            if "ngày mai" in user_input_lower or " mai " in user_input_lower or user_input_lower.startswith("mai"):
                scope = "tomorrow"
                logger.info(f"🔍 Fallback: detected 'tomorrow' from user_input")
            else:
                scope = "today"
                logger.info(f"🔍 Fallback: defaulting to 'today'")
            detected_date = None

    logger.info(f"🔎 Final detected time scope: {scope} (user_input: '{user_input}', date: {detected_date if scope == 'specific_date' else 'N/A'})")

    # --- Step 2: Lọc task theo phạm vi ---
    # today đã được tính ở trên, chỉ cần format lại
    today_str = today.isoformat()  # Format: YYYY-MM-DD (đúng với database)
    
    # Get user_id from state (if available)
    user_id = state.get("user_id")
    logger.info(f"🔍 get_tasks_node - state keys: {list(state.keys())}")
    logger.info(f"🔍 get_tasks_node - user_id from state: {user_id} (type: {type(user_id)})")
    
    # Query theo column 'date' (không phải 'due_date') và format YYYY-MM-DD
    if scope == "today":
        query_date = today_str
        logger.info(f"🔍 Querying tasks for today: {query_date} (scope: {scope})")
        query = supabase.table("tasks").select("*").eq("date", query_date)
    elif scope == "tomorrow":
        tomorrow_str = tomorrow.isoformat()
        query_date = tomorrow_str
        logger.info(f"🔍 Querying tasks for tomorrow: {query_date} (scope: {scope})")
        query = supabase.table("tasks").select("*").eq("date", query_date)
    elif scope == "specific_date":
        query_date = detected_date  # Already in YYYY-MM-DD format
        logger.info(f"🔍 Querying tasks for specific date: {query_date} (scope: {scope})")
        query = supabase.table("tasks").select("*").eq("date", query_date)
    elif scope == "week":
        # Lấy tasks từ hôm nay đến 7 ngày sau
        week_end = today + timedelta(days=7)
        week_end_str = week_end.isoformat()
        query_date = f"{today_str} to {week_end_str}"
        logger.info(f"🔍 Querying tasks from {today_str} to {week_end_str} (scope: {scope})")
        query = supabase.table("tasks").select("*").gte("date", today_str).lte("date", week_end_str)
    else:  # scope == "all"
        query_date = "all dates"
        logger.info(f"🔍 Querying all tasks (scope: {scope})")
        query = supabase.table("tasks").select("*")
    
    # Filter by user_id if provided
    if user_id:
        query = query.eq("user_id", user_id)
        logger.info(f"🔍 Filtering by user_id: {user_id}")
    else:
        logger.warning("⚠️ No user_id provided - querying all tasks (may return wrong user's tasks)")

    try:
        # Order by date, then by created_at
        result = query.order("date", desc=False).order("created_at", desc=False).execute()
        tasks = result.data or []
        logger.info(f"✅ Found {len(tasks)} tasks for scope: {scope} (date: {today_str}, user_id: {user_id})")
        
        # Debug: Log chi tiết tasks để kiểm tra
        if len(tasks) > 0:
            logger.info(f"📋 Tasks found:")
            for i, t in enumerate(tasks[:5], 1):
                logger.info(f"   {i}. {t.get('title', 'N/A')} | date: {t.get('date', 'N/A')} | time: {t.get('time', 'N/A')} | completed: {t.get('completed', False)}")
        else:
            # Debug: Thử query tất cả tasks để xem có gì không
            logger.warning(f"⚠️ No tasks found for {scope} (date: {today_str}). Checking all tasks in database...")
            all_tasks_query = supabase.table("tasks").select("*").limit(10)
            if user_id:
                all_tasks_query = all_tasks_query.eq("user_id", user_id)
                logger.info(f"🔍 Querying all tasks for user_id: {user_id}")
            else:
                logger.warning(f"🔍 Querying all tasks without user_id filter")
            all_tasks = all_tasks_query.execute()
            logger.info(f"🔍 Debug: Found {len(all_tasks.data or [])} total tasks in database (user_id: {user_id})")
            if all_tasks.data:
                logger.info(f"📋 All tasks for user {user_id}:")
                for t in all_tasks.data[:10]:
                    task_date = t.get('date', 'N/A')
                    task_user_id = t.get('user_id', 'N/A')
                    logger.info(f"   - Task: {t.get('title', 'N/A')} | date: {task_date} (type: {type(task_date)}) | user_id: {task_user_id} | matches today? {task_date == today_str}")
                    # Kiểm tra xem date có khớp không
                    if task_date and task_date != today_str:
                        logger.info(f"      ⚠️ Date mismatch: task date '{task_date}' != today '{today_str}'")
            else:
                logger.warning(f"⚠️ No tasks in database at all for user_id: {user_id}")
    except Exception as e:
        logger.error(f"❌ Supabase fetch error: {e}")
        import traceback
        logger.error(f"❌ Traceback: {traceback.format_exc()}")
        tasks = []

    # --- Step 3: Dùng LLM để tạo câu trả lời tự nhiên dựa trên dữ liệu thực tế ---
    # Format tasks info một cách rõ ràng và ĐẦY ĐỦ (bao gồm time, date, priority)
    tasks_info = ""
    tasks_detail = []  # Lưu chi tiết đầy đủ để AI có thể trả lời follow-up questions
    if tasks:
        task_list = []
        for i, t in enumerate(tasks, 1):
            title = t.get('title', 'N/A')
            time_str = t.get('time', '')
            priority = t.get('priority', 'medium')
            date_str = t.get('date', 'N/A')
            completed = t.get('completed', False)
            
            # Format priority
            priority_vi = {'high': 'cao', 'medium': 'trung bình', 'low': 'thấp'}.get(priority, priority)
            
            # Format đầy đủ thông tin cho AI
            task_detail = {
                'title': title,
                'time': time_str if time_str else 'chưa xác định',
                'date': date_str,
                'priority': priority_vi,
                'completed': completed
            }
            tasks_detail.append(task_detail)
            
            # Format cho danh sách hiển thị
            task_str = f"{i}. {title}"
            if time_str and time_str.strip():
                task_str += f" (lúc {time_str})"
            if date_str and date_str != 'N/A':
                # Format date từ YYYY-MM-DD sang DD-MM-YYYY
                try:
                    # datetime đã được import ở đầu file
                    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                    date_formatted = date_obj.strftime("%d-%m-%Y")
                    task_str += f" (ngày {date_formatted})"
                except:
                    task_str += f" (ngày {date_str})"
            if completed:
                task_str += " [Đã hoàn thành]"
            else:
                task_str += f" [Ưu tiên: {priority_vi}]"
            
            task_list.append(task_str)
        
        tasks_info = "\n".join(task_list)
    else:
        tasks_info = "KHÔNG CÓ CÔNG VIỆC NÀO"
    
    # Tạo prompt rõ ràng để LLM PHẢI dùng dữ liệu thực tế
    # Format ngày được hỏi để hiển thị cho AI
    asked_date_str = ""
    if scope == "specific_date" and detected_date:
        try:
            asked_date_obj = date.fromisoformat(detected_date)
            asked_date_str = asked_date_obj.strftime("%d-%m-%Y")
        except:
            asked_date_str = detected_date
    
    scope_vi = {
        "today": "hôm nay",
        "tomorrow": "ngày mai", 
        "week": "tuần này",
        "all": "tất cả",
        "specific_date": f"ngày {asked_date_str}" if asked_date_str else "ngày cụ thể"
    }.get(scope, scope)
    
    # Tạo thông tin chi tiết về tasks để AI có thể trả lời follow-up questions
    tasks_detail_str = ""
    if tasks_detail:
        for i, t in enumerate(tasks_detail, 1):
            tasks_detail_str += f"\nTask {i}:"
            tasks_detail_str += f"\n  - Tên: {t['title']}"
            tasks_detail_str += f"\n  - Thời gian: {t['time']}"
            tasks_detail_str += f"\n  - Ngày: {t['date']}"
            tasks_detail_str += f"\n  - Ưu tiên: {t['priority']}"
            tasks_detail_str += f"\n  - Trạng thái: {'Đã hoàn thành' if t['completed'] else 'Chưa hoàn thành'}"
    
    # Format ngày được hỏi để hiển thị cho AI
    asked_date_str = ""
    if scope == "specific_date" and detected_date:
        try:
            asked_date_obj = date.fromisoformat(detected_date)
            asked_date_str = asked_date_obj.strftime("%d-%m-%Y")
        except:
            asked_date_str = detected_date
    
    reply_prompt = f"""Bạn là {CONST_AGENT_NAME}, trợ lý AI quản lý thời gian.

⚠️ QUAN TRỌNG: Bạn PHẢI dùng dữ liệu thực tế từ database dưới đây. 
❌ KHÔNG được tạo tasks giả, không được bịa đặt công việc không có trong database.
❌ KHÔNG được tạo template rỗng hoặc danh mục chung chung.

Người dùng hỏi về công việc trong phạm vi: {scope_vi} ({scope}{f", ngày cụ thể: {asked_date_str}" if scope == "specific_date" else ""})
Bạn đã query database và tìm thấy {len(tasks)} công việc:

{tasks_info}

CHI TIẾT ĐẦY ĐỦ CÁC TASKS (để trả lời câu hỏi follow-up):
{tasks_detail_str if tasks_detail_str else "KHÔNG CÓ"}

YÊU CẦU NGHIÊM NGẶT:
1. Nếu có tasks ({len(tasks)} > 0): 
   - PHẢI liệt kê CHÍNH XÁC các công việc từ danh sách trên, không được bỏ sót
   - PHẢI dùng đúng từ "{scope_vi}" trong câu trả lời
   - Nếu scope là "specific_date" và ngày được hỏi là {asked_date_str} → PHẢI nói "ngày {asked_date_str}" trong câu trả lời, KHÔNG được nói "hôm nay" hoặc "ngày mai"
   - PHẢI bao gồm thông tin chi tiết: tên task, thời gian (nếu có), ngày, ưu tiên
   - Ví dụ cụ thể:
     * Nếu scope="tomorrow" và có 1 task: "Dạ, ngày mai Anh/Chị có 1 công việc: [tên task]"
     * Nếu scope="specific_date" và ngày {asked_date_str} và có 1 task: "Dạ, ngày {asked_date_str} Anh/Chị có 1 công việc: [tên task]"
     * Nếu scope="today" và có 2 tasks: "Dạ, hôm nay Anh/Chị có 2 công việc: [liệt kê đầy đủ với thời gian]"
   - CHỈ dùng tasks có trong danh sách trên, KHÔNG được thêm tasks khác
   - Nếu user hỏi follow-up như "đó là công việc gì", "vào lúc mấy giờ" → PHẢI trả lời chi tiết từ CHI TIẾT ĐẦY ĐỦ CÁC TASKS ở trên

2. Nếu không có tasks (0): 
   - PHẢI dùng đúng từ "{scope_vi}" trong câu trả lời
   - Nếu scope là "specific_date" và ngày được hỏi là {asked_date_str} → PHẢI nói "ngày {asked_date_str}", KHÔNG được nói "hôm nay"
   - Ví dụ cụ thể:
     * Nếu scope="tomorrow": "Dạ, ngày mai Anh/Chị chưa có công việc nào. Anh/Chị có muốn thêm công việc mới không ạ?"
     * Nếu scope="specific_date" và ngày {asked_date_str}: "Dạ, ngày {asked_date_str} Anh/Chị chưa có công việc nào. Anh/Chị có muốn thêm công việc mới không ạ?"
     * Nếu scope="today": "Dạ, hôm nay Anh/Chị chưa có công việc nào. Anh/Chị có muốn thêm công việc mới không ạ?"
   - KHÔNG được tạo tasks giả như "cuộc họp", "dự án deadline" nếu không có trong database

3. ⚠️ QUAN TRỌNG NHẤT - Scope phải đúng trong câu trả lời:
   - Nếu scope là "specific_date" và ngày {asked_date_str} → BẮT BUỘC phải nói "ngày {asked_date_str}" (KHÔNG được nói "hôm nay", "ngày mai", hoặc ngày khác)
   - Nếu scope là "tomorrow" → BẮT BUỘC phải nói "ngày mai" (KHÔNG được nói "hôm nay")
   - Nếu scope là "week" → BẮT BUỘC phải nói "tuần này" (KHÔNG được nói "hôm nay")
   - Nếu scope là "today" → BẮT BUỘC phải nói "hôm nay"
   - Nếu scope là "all" → có thể nói "tất cả" hoặc "toàn bộ"

4. Giọng điệu:
   - Xưng "em" và gọi user "Anh/Chị"
   - Ngắn gọn, tự nhiên (không quá 150 từ)
   - KHÔNG được tạo danh mục rỗng
   - Khi trả lời về task, PHẢI bao gồm thông tin đầy đủ: tên, thời gian, ngày, ưu tiên

Chỉ trả lời nội dung, không giải thích thêm."""
    
    try:
        reply_response = completion_with_retry(
            api_key=os.getenv("GROQ_API_KEY"),
            model=LLM_MODELS["task_subgraph"]["add_task_node"],
            messages=[{"role": "user", "content": reply_prompt}],
            temperature=0.3,  # Giảm temperature để follow prompt chính xác hơn
            tools=None,
            tool_choice="none"
        )
        ai_reply_text = remove_think_tag(reply_response.choices[0].message.content).strip()
        logger.info(f"✅ LLM generated reply based on {len(tasks)} tasks")
    except Exception as e:
        logger.error(f"⚠️ LLM reply generation error: {e}")
        import traceback
        logger.error(f"⚠️ Traceback: {traceback.format_exc()}")
        # Fallback to template message - dùng dữ liệu thực tế và ĐÚNG SCOPE
        if len(tasks) > 0:
            task_list = []
            for i, t in enumerate(tasks[:10], 1):  # Giới hạn 10 tasks để không quá dài
                title = t.get('title', 'N/A')
                time_str = t.get('time', '')
                if time_str:
                    task_list.append(f"{i}. {title} (lúc {time_str})")
                else:
                    task_list.append(f"{i}. {title}")
            
            tasks_str = "\n".join(task_list)
            if len(tasks) > 10:
                tasks_str += f"\n... và {len(tasks) - 10} công việc khác"
            
            # Dùng scope_vi thay vì hardcode "hôm nay"
            ai_reply_text = f"Dạ, {scope_vi} Anh/Chị có {len(tasks)} công việc:\n\n{tasks_str}\n\nEm có thể giúp Anh/Chị thêm hoặc cập nhật công việc nếu cần!"
        else:
            # Dùng scope_vi thay vì hardcode "hôm nay"
            ai_reply_text = f"Dạ, {scope_vi} Anh/Chị chưa có công việc nào. Anh/Chị có muốn thêm công việc mới không ạ?"

    ai_message = AIMessage(
        content=ai_reply_text.strip(),
        additional_kwargs={
            "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
    )

    return {
        "messages": [ai_message],
        "ai_reply": ai_message,
        "task_scope": scope,
        "tasks": tasks,
    }
