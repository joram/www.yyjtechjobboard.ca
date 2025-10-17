#!/usr/bin/env python3
"""
Script to sort the job_data.csv file by timestamp (most recent first)
"""

import csv
import sys
from datetime import datetime
import os

def parse_timestamp(timestamp_str):
    """Parse timestamp string to datetime object"""
    if not timestamp_str or timestamp_str.strip() == '':
        return datetime.min
    
    try:
        # Try different timestamp formats
        formats = [
            '%m/%d/%Y %H:%M:%S',  # 5/2/2019 17:11:13
            '%Y-%m-%d %H:%M:%S',  # 2019-05-02 17:11:13
            '%m/%d/%Y',           # 5/2/2019
            '%Y-%m-%d',           # 2019-05-02
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(timestamp_str.strip(), fmt)
            except ValueError:
                continue
        
        # If no format matches, return min date
        return datetime.min
    except:
        return datetime.min

def sort_csv_by_timestamp(input_file, output_file):
    """Sort CSV file by timestamp column (most recent first)"""
    
    # Read the CSV file
    rows = []
    header_rows = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find the actual header row (contains "Timestamp" and "Employer name")
    header_index = 0
    for i, line in enumerate(lines):
        if 'Timestamp' in line and 'Employer name' in line:
            header_index = i
            break
    
    # Extract header rows (multi-line header)
    for i in range(header_index + 1):
        header_rows.append(lines[i].strip())
    
    # Parse data rows
    reader = csv.reader(lines[header_index:])
    headers = next(reader)  # Skip the header row
    
    for row in reader:
        if len(row) > 0 and row[0].strip():  # Skip empty rows
            rows.append(row)
    
    # Sort by timestamp (most recent first)
    rows.sort(key=lambda row: parse_timestamp(row[0]), reverse=True)
    
    # Write the sorted CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        # Write header rows
        for header_row in header_rows:
            f.write(header_row + '\n')
        
        # Write sorted data
        writer = csv.writer(f)
        writer.writerow(headers)  # Write the column headers
        writer.writerows(rows)
    
    print(f"Sorted {len(rows)} job entries by timestamp (most recent first)")
    print(f"Output written to: {output_file}")

if __name__ == "__main__":
    input_file = "public/job_data.csv"
    output_file = "public/job_data_sorted.csv"
    
    if not os.path.exists(input_file):
        print(f"Error: Input file {input_file} not found")
        sys.exit(1)
    
    try:
        sort_csv_by_timestamp(input_file, output_file)
        print("CSV sorting completed successfully!")
    except Exception as e:
        print(f"Error sorting CSV: {e}")
        sys.exit(1)
