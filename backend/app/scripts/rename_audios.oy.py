import os
import re

# Adjust this to your actual path
base_dir = "backend/static_audio"

def transform_filename(filename):
    # If the filename starts with '#', replace it with 'temp_'
    if filename.startswith("#") and filename.endswith(".wav"):
        return "temp_" + filename[1:]

    # Otherwise, apply your existing pattern transformation
    match = re.match(r"([A-Z])(\d+)([NS])-", filename)
    if not match:
        return None  # Doesn't match pattern

    letter, number, suffix = match.groups()

    if suffix == "N":
        prefix = "temp_"
    elif suffix == "S":
        prefix = "_"
    else:
        return None

    new_name = f"{prefix}{letter}{suffix}{number}.wav"
    return new_name

# Traverse folders and rename
for folder in os.listdir(base_dir):
    folder_path = os.path.join(base_dir, folder)
    if not os.path.isdir(folder_path):
        continue

    for file in os.listdir(folder_path):
        if file.endswith(".wav"):
            new_name = transform_filename(file)
            if new_name:
                src = os.path.join(folder_path, file)
                dst = os.path.join(folder_path, new_name)
                print(f"Renaming: {file} → {new_name}")
                os.rename(src, dst)
