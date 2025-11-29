# -*- coding: utf-8 -*-
"""
Test script để kiểm tra query tasks từ Supabase
Chạy script này để debug query
"""
import os
import sys
from datetime import date
from dotenv import load_dotenv, find_dotenv
from supabase import create_client

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load .env từ nhiều vị trí có thể
env_paths = [
    find_dotenv(),  # Tìm .env trong thư mục hiện tại và parent
    os.path.join(os.path.dirname(__file__), 'timemanage-agent-backend', 'src', '.env'),
    os.path.join(os.path.dirname(__file__), '.env'),
]
for env_path in env_paths:
    if env_path and os.path.exists(env_path):
        load_dotenv(env_path)
        print(f"[INFO] Loaded .env from: {env_path}")
        break
else:
    print("[WARN] No .env file found, trying to load from environment variables")

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Missing SUPABASE_URL or SUPABASE_KEY in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test data
USER_ID = "05b180d3-bc21-48a4-bd26-f09bbdb98da7"
TODAY = date.today()
TODAY_STR = TODAY.isoformat()  # Format: YYYY-MM-DD

print(f"[INFO] Testing query for:")
print(f"   - User ID: {USER_ID}")
print(f"   - Date: {TODAY_STR} (today)")
print(f"   - Date type: {type(TODAY_STR)}")
print()

# Test 1: Query tất cả tasks (không filter)
print("=" * 60)
print("TEST 1: Query ALL tasks (no filters)")
print("=" * 60)
try:
    all_tasks = supabase.table("tasks").select("*").limit(10).execute()
    print(f"[OK] Found {len(all_tasks.data or [])} total tasks")
    if all_tasks.data:
        for i, task in enumerate(all_tasks.data, 1):
            print(f"   {i}. {task.get('title', 'N/A')}")
            print(f"      - id: {task.get('id', 'N/A')}")
            print(f"      - user_id: {task.get('user_id', 'N/A')}")
            print(f"      - date: {task.get('date', 'N/A')} (type: {type(task.get('date'))})")
            print(f"      - time: {task.get('time', 'N/A')}")
            print(f"      - completed: {task.get('completed', False)}")
            print()
    else:
        print("   [WARN] No tasks found")
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()

print()

# Test 2: Query tasks theo user_id
print("=" * 60)
print(f"TEST 2: Query tasks for user_id: {USER_ID}")
print("=" * 60)
try:
    user_tasks = supabase.table("tasks").select("*").eq("user_id", USER_ID).execute()
    print(f"[OK] Found {len(user_tasks.data or [])} tasks for user {USER_ID}")
    if user_tasks.data:
        for i, task in enumerate(user_tasks.data, 1):
            print(f"   {i}. {task.get('title', 'N/A')}")
            print(f"      - id: {task.get('id', 'N/A')}")
            print(f"      - date: {task.get('date', 'N/A')} (type: {type(task.get('date'))})")
            print(f"      - time: {task.get('time', 'N/A')}")
            print(f"      - matches today ({TODAY_STR})? {task.get('date') == TODAY_STR}")
            print()
    else:
        print("   [WARN] No tasks found for this user")
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()

print()

# Test 3: Query tasks theo date (hôm nay)
print("=" * 60)
print(f"TEST 3: Query tasks for date: {TODAY_STR}")
print("=" * 60)
try:
    date_tasks = supabase.table("tasks").select("*").eq("date", TODAY_STR).execute()
    print(f"[OK] Found {len(date_tasks.data or [])} tasks for date {TODAY_STR}")
    if date_tasks.data:
        for i, task in enumerate(date_tasks.data, 1):
            print(f"   {i}. {task.get('title', 'N/A')}")
            print(f"      - id: {task.get('id', 'N/A')}")
            print(f"      - user_id: {task.get('user_id', 'N/A')}")
            print(f"      - date: {task.get('date', 'N/A')}")
            print(f"      - time: {task.get('time', 'N/A')}")
            print()
    else:
        print("   [WARN] No tasks found for this date")
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()

print()

# Test 4: Query tasks theo user_id VÀ date (giống như trong code thực tế)
print("=" * 60)
print(f"TEST 4: Query tasks for user_id={USER_ID} AND date={TODAY_STR}")
print("=" * 60)
try:
    query = supabase.table("tasks").select("*")
    query = query.eq("user_id", USER_ID)
    query = query.eq("date", TODAY_STR)
    result = query.order("date", desc=False).order("created_at", desc=False).execute()
    
    print(f"[OK] Found {len(result.data or [])} tasks")
    if result.data:
        for i, task in enumerate(result.data, 1):
            print(f"   {i}. {task.get('title', 'N/A')}")
            print(f"      - id: {task.get('id', 'N/A')}")
            print(f"      - date: {task.get('date', 'N/A')}")
            print(f"      - time: {task.get('time', 'N/A')}")
            print(f"      - completed: {task.get('completed', False)}")
            print()
    else:
        print("   [WARN] No tasks found")
        print()
        print("   [DEBUG] Debugging:")
        print(f"      - Checking if date format matches...")
        # Thử query với date khác format
        user_tasks = supabase.table("tasks").select("*").eq("user_id", USER_ID).execute()
        if user_tasks.data:
            print(f"      - Found {len(user_tasks.data)} tasks for this user:")
            for task in user_tasks.data:
                task_date = task.get('date', 'N/A')
                print(f"         * {task.get('title', 'N/A')}: date={task_date} (type={type(task_date)})")
                print(f"           Matches '{TODAY_STR}'? {task_date == TODAY_STR}")
                print(f"           task_date == TODAY_STR: {task_date == TODAY_STR}")
                if isinstance(task_date, str):
                    print(f"           String comparison: '{task_date}' == '{TODAY_STR}'? {task_date == TODAY_STR}")
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 60)
print("[OK] Test completed!")
print("=" * 60)

