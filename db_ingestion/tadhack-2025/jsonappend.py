import os
import json

directory = "./24"  # Replace with your directory path
output_file = "combined_output24.txt"

json_list = []

# Explore directory and collect JSON files
for filename in os.listdir(directory):
    if filename.endswith(".json"):
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            json_list.append(data)

# Write all JSON objects to a single .txt file, one per line
with open(output_file, "w", encoding="utf-8") as outfile:
    for item in json_list:
        outfile.write(json.dumps(item))
        outfile.write("\n")
