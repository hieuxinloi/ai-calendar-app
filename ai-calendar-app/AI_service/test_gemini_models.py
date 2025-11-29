#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test script to check which Gemini models are available"""
import os
import sys
from dotenv import load_dotenv, find_dotenv
from litellm import completion

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Try to load .env from multiple locations
env_paths = [
    "timemanage-agent-backend/src/.env",
    ".env",
    find_dotenv()
]
for path in env_paths:
    if os.path.exists(path):
        load_dotenv(path)
        print(f"[INFO] Loaded .env from: {path}")
        break
else:
    load_dotenv(find_dotenv())

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("[ERROR] GEMINI_API_KEY not found in .env")
    exit(1)

print(f"[OK] Using API Key: {GEMINI_API_KEY[:10]}...")
print("\n[TEST] Testing Gemini models...\n")

# List of models to test - try different formats
models_to_test = [
    "google/gemini-pro",
    "google/gemini-1.5-pro", 
    "google/gemini-1.5-flash",
    "gemini/gemini-pro",
    "gemini/gemini-1.5-pro",
    "gemini/gemini-1.5-flash",
]

for model in models_to_test:
    try:
        print(f"Testing: {model}...", end=" ")
        # Try with explicit api_base for Google AI Studio
        response = completion(
            api_key=GEMINI_API_KEY,
            model=model,
            messages=[{"role": "user", "content": "Say hello"}],
            max_tokens=10,
            api_base="https://generativelanguage.googleapis.com/v1beta"
        )
        print(f"[SUCCESS]")
        print(f"   Response: {response.choices[0].message.content[:50]}...")
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg or "not found" in error_msg.lower():
            print(f"[NOT FOUND]")
        elif "401" in error_msg or "unauthorized" in error_msg.lower():
            print(f"[UNAUTHORIZED] (check API key)")
        else:
            print(f"[ERROR] {error_msg[:100]}")
    print()

print("\n[OK] Test completed!")

