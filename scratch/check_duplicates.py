
import json
import collections

def find_duplicates(path):
    def error_on_duplicate(ordered_pairs):
        """Custom object_pairs_hook to find duplicates."""
        d = collections.defaultdict(int)
        for k, v in ordered_pairs:
            d[k] += 1
        for k, count in d.items():
            if count > 1:
                print(f"Duplicate key: {k}")
        return dict(ordered_pairs)

    with open(path, 'r', encoding='utf-8') as f:
        # This will only find top-level or immediate children duplicates if used recursively
        # Better way is to use a recursive function with object_pairs_hook
        pass

def find_duplicates_recursive(data, path=""):
    if isinstance(data, dict):
        keys = list(data.keys())
        # json.load already handled it by overwriting, so we can't see them here.
        # We need to parse manually or use a library.
        pass

# Let's use the line-by-line stack method but better.
def find_duplicates_final(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = [set()]
    for i, line in enumerate(lines):
        # Count braces to handle nesting
        open_braces = line.count('{')
        close_braces = line.count('}')
        
        # Check for key
        match = re.search(r'"([^"]+)"\s*:', line)
        if match:
            key = match.group(1)
            if key in stack[-1]:
                print(f"Line {i+1}: Duplicate key '{key}'")
            stack[-1].add(key)
            
        for _ in range(open_braces):
            stack.append(set())
        for _ in range(close_braces):
            if len(stack) > 1:
                stack.pop()

import re
find_duplicates_final('/home/omar-ayad/Desktop/donzone2/DenZone-front/messages/ar.json')
