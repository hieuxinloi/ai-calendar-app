import os
import json
import re
import time
from dotenv import load_dotenv, find_dotenv
from litellm import completion
from litellm.exceptions import RateLimitError
from ..schemas.topic import TopicSchema
from pydantic.tools import parse_obj_as
from ..states.time_management_agent_state import TimanaAgentState
from ..utils.helpers import parsing_messages_to_history, remove_think_tag
from logger import logger
from config import LLM_MODELS

load_dotenv(find_dotenv())

TOPIC = {
    "greeting": "greeting",
    "off_topic": "off_topic",
    "add_task":"add_task",
    "get_tasks":"get_tasks"

}

def router_node(state: TimanaAgentState):
    user_input = state['messages'][-1].content
    chat_history = parsing_messages_to_history(state.get('messages', ''))

    json_example = {
        "name": f"Một trong các giá trị sau: {', '.join(TOPIC.values())}",
        "confidence": "Score between 0 and 1",
        "context": "User's input"
    }

    prompt = f"""
    # Role
    - Assistant là một chuyên gia quản lý thời gian, lập kế hoạch và hỗ trợ người dùng theo dõi công việc.
    - Assistant có 10 năm kinh nghiệm trong việc huấn luyện cá nhân về productivity, time-blocking, và quản lý task hiệu quả.

    # Skills
    - Assistant có kỹ năng phân tích ngữ cảnh hội thoại để hiểu mục tiêu, thời hạn và ưu tiên của người dùng.
    - Assistant có khả năng tổ chức, lên lịch, và ghi chú tự động các công việc.
    - Assistant có khả năng truy xuất, thêm, sửa, xóa các task trong database Supabase.

    # Context
    ```
    Chat History:
    {chat_history}

    User's input:
    {user_input}

    ```
    
    # Tasks
    - Assistant MUST đọc kỹ Chat History và User's input trong phần Context để xác định **ý định của người dùng**.
    - Assistant MUST phân loại ý định của người dùng vào một trong các **Intent Topics** sau:

    1. **Greeting**  
    Nếu người dùng chỉ đang chào hỏi hoặc mở đầu cuộc hội thoại.  
    → Return `{TOPIC.get("greeting")}`  
    **Example:**  
    - Chào em  
    - Hello bot  
    - Chào buổi sáng  

    2. **Add Task (Thêm công việc)**  
    Nếu người dùng muốn THÊM, GHI CHÚ, TẠO, LƯU một công việc mới.  
    → Return `{TOPIC.get("add_task")}`  
    **Example:**  
    - Thêm việc "học tiếng Anh" vào tối mai  
    - Nhắc tôi đi họp lúc 9h sáng mai  
    - Ghi chú: nộp báo cáo trước thứ Sáu
    - Tôi muốn note việc cho ngày mai
    - Thêm giúp tôi
    - Lưu công việc này
    - Tạo task mới
    **QUAN TRỌNG**: Nếu user nói "muốn", "cần", "note", "thêm", "ghi" → Đây là ADD TASK, không phải GET TASKS!

    3. **Get Tasks (Xem danh sách công việc)**  
    Nếu người dùng muốn XEM, HỎI, LIỆT KÊ các công việc đã lưu (KHÔNG phải thêm mới).  
    → Return `{TOPIC.get("get_tasks")}`  
    **Example:**  
    - Hôm nay tôi có gì cần làm không?  
    - Cho tôi xem danh sách việc cần làm trong tuần này  
    - Hiển thị tất cả công việc còn lại
    - Công việc hôm nay là gì?
    **QUAN TRỌNG**: Chỉ dùng GET TASKS khi user HỎI về tasks hiện có, KHÔNG phải khi user muốn THÊM task mới!  


    4. **Off Topic (Ngoài phạm vi)**  
    Nếu người dùng nói chuyện ngoài chủ đề quản lý thời gian.  
    → Return `{TOPIC.get("off_topic")}`  
    **Example:**  
    - Kể chuyện cười đi  
    - Viết đoạn code Python giúp tôi  
    - Em tên gì?  





    # Ouput
    - Assistant MUST trả lời bằng JSON format với các field như sau:
    ```
    {json.dumps(json_example, ensure_ascii=False)}
    ```

    # Constraints
    - Assistant MUST reply by JSON format ONLY như trong mục Output. 
    - KHÔNG được trả về code, markdown, hoặc giải thích. CHỈ trả về JSON.
    - Assistant MUST return exactly one of the following topics: {', '.join(TOPIC.values())}.
    - Trong trường hợp Assistant không thể xác định được topic, Assistant DO NOT attempt to guess the topic, just return "{TOPIC.get("off_topic")}".
    
    ⚠️ QUAN TRỌNG: 
    - CHỈ trả về JSON, KHÔNG được trả về code Python, markdown, hoặc bất kỳ format nào khác
    - Ví dụ đúng: {{"name": "get_tasks", "confidence": 0.9, "context": "hôm nay tôi có việc gì không"}}
    - Ví dụ SAI: ```python ... ``` hoặc ```json ... ``` hoặc bất kỳ code nào khác
    """

    # Retry logic for rate limit
    max_retries = 3
    initial_delay = 2
    for attempt in range(max_retries):
        try:
            response = completion(
                api_key=os.getenv("GROQ_API_KEY"),
                model=LLM_MODELS['router']['router_node'],
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                tools=None,  # Disable function calling
                tool_choice="none"  # Explicitly disable tool use
            )
            break  # Success, exit retry loop
        except RateLimitError as e:
            if attempt < max_retries - 1:
                delay = initial_delay * (2 ** attempt)
                logger.warning(f"⚠️ Rate limit hit in router, retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(delay)
            else:
                logger.error(f"❌ Rate limit error in router after {max_retries} attempts: {e}")
                raise

    # Parse JSON from response
    raw_content = response.choices[0].message.content
    cleaned = remove_think_tag(raw_content).strip()
    
    # Extract JSON from response (might be wrapped in markdown or text)
    try:
        # Try to find JSON object in the response - improved regex
        # Look for { ... } that contains "name", "confidence", "context"
        json_match = re.search(r'\{[^{}]*(?:"name"[^{}]*"confidence"[^{}]*"context"|"name"[^{}]*"context"[^{}]*"confidence")[^{}]*\}', cleaned, re.DOTALL)
        if json_match:
            cleaned = json_match.group(0)
        else:
            # Try simpler: find first { ... } block
            json_match = re.search(r'\{.*?\}', cleaned, re.DOTALL)
            if json_match:
                cleaned = json_match.group(0)
        
        # Try to parse JSON
        new_topic = parse_obj_as(TopicSchema, json.loads(cleaned))
        logger.info(f"✅ Parsed topic: {new_topic.name} (confidence: {new_topic.confidence})")
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON decode error: {e}")
        logger.error(f"❌ Raw content: {raw_content[:500]}")
        # Fallback: try to infer from content - improved keyword matching
        content_lower = cleaned.lower()
        user_input_lower = user_input.lower()
        
        # Check for add_task keywords
        add_task_keywords = ["thêm", "note", "ghi", "tạo", "lưu", "muốn", "cần thêm", "thêm giúp", "thêm việc"]
        if any(keyword in user_input_lower for keyword in add_task_keywords):
            new_topic = TopicSchema(name=TOPIC.get('add_task'), confidence=0.7, context=user_input)
            logger.info(f"🔍 Fallback: detected add_task from keywords")
        # Check for get_tasks keywords - expanded list
        elif any(keyword in user_input_lower for keyword in [
            "có gì", "có việc gì", "có công việc gì", "có việc", "có công việc",
            "xem", "liệt kê", "hiển thị", "danh sách", "hôm nay", "ngày mai", 
            "tuần này", "công việc hôm nay", "công việc ngày mai", "việc hôm nay",
            "việc ngày mai", "tôi có gì", "tôi có việc gì", "tôi có công việc gì"
        ]):
            new_topic = TopicSchema(name=TOPIC.get('get_tasks'), confidence=0.7, context=user_input)
            logger.info(f"🔍 Fallback: detected get_tasks from keywords")
        # Check for greeting
        elif any(keyword in user_input_lower for keyword in ["hello", "hi", "chào", "xin chào", "hey"]):
            new_topic = TopicSchema(name=TOPIC.get('greeting'), confidence=0.7, context=user_input)
            logger.info(f"🔍 Fallback: detected greeting from keywords")
        else:
            new_topic = TopicSchema(
                name=TOPIC.get('off_topic'),
                confidence=0.5,
                context=user_input
            )
            logger.info(f"🔍 Fallback: defaulting to off_topic")
    except Exception as e:
        logger.error(f"❌ JSON parsing error: {e}, raw content: {raw_content[:200]}")
        # Fallback: create default topic based on keywords
        content_lower = cleaned.lower()
        if any(word in content_lower for word in ["thêm", "note", "ghi", "tạo", "lưu", "muốn"]):
            new_topic = TopicSchema(name=TOPIC.get('add_task'), confidence=0.7, context=user_input)
        elif any(word in content_lower for word in ["có gì", "xem", "liệt kê", "hiển thị"]):
            new_topic = TopicSchema(name=TOPIC.get('get_tasks'), confidence=0.7, context=user_input)
        else:
            new_topic = TopicSchema(
                name=TOPIC.get('off_topic'),
                confidence=0.5,
                context=user_input
            )
    new_topic.name = new_topic.name.lower()

    topic = state.get('topic', None)
    logger.info(f"Topic: {topic}")
    
    if topic is None:
        if new_topic.name != TOPIC.get('off_topic') and new_topic.confidence < 0.5:
            new_topic.name = TOPIC.get('off_topic')

        logger.info(f"New Topic: {new_topic}")
        return {
            "topic": new_topic,
            "human_input": user_input,
            "ai_reply": None
        }

    return {
        "human_input": user_input,
        "ai_reply": None
    }
    