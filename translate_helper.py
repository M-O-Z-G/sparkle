#!/usr/bin/env python3
"""
Helper script to extract Chinese text from components and generate translations
"""
import re
import json
import sys
from pathlib import Path

def extract_chinese_text(file_path):
    """Extract Chinese text from a TypeScript/TSX file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find Chinese text in strings
    chinese_pattern = re.compile(r'["\']([^"\']*[\u4e00-\u9fff]+[^"\']*)["\']')
    chinese_texts = []
    
    for match in chinese_pattern.finditer(content):
        text = match.group(1)
        # Filter out texts that are already translated (contain t() or t(""))
        if text and not text.startswith('t('):
            chinese_texts.append(text)
    
    return list(set(chinese_texts))

def main():
    if len(sys.argv) < 2:
        print("Usage: python translate_helper.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    chinese_texts = extract_chinese_text(file_path)
    
    print(f"\nFound {len(chinese_texts)} unique Chinese texts in {file_path}:\n")
    for i, text in enumerate(chinese_texts, 1):
        print(f"{i}. {text}")

if __name__ == "__main__":
    main()
