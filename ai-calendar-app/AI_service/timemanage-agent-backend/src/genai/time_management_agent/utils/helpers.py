from langchain_core.messages import AIMessage, HumanMessage
import re

def parsing_messages_to_history(messages):
    if isinstance(messages, str) and messages == '':
        return ''    

    history = []
    for message in messages:
        current_time = message.additional_kwargs.get('current_time', 'N/A') if hasattr(message, 'additional_kwargs') and message.additional_kwargs else 'N/A'
        if isinstance(message, HumanMessage):
            history.append(f"UserMessage: {message.content} | Time: {current_time}\n")
        elif isinstance(message, AIMessage):
            history.append(f"AIMessage: {message.content} | Time: {current_time}\n\n")    
    
    return "".join(history)

def remove_think_tag(content):
  pattern = r"<think>(.|\s)*?<\/think>"
  return re.sub(pattern, "", content).strip()