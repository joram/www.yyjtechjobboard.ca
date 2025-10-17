#!/usr/bin/env python3
"""
Script to convert job_data.csv to JSON format with Unix timestamps
"""

import csv
import json
import sys
import os
from datetime import datetime

def parse_timestamp_to_unix(timestamp_str):
    """Parse timestamp string to Unix timestamp"""
    if not timestamp_str or timestamp_str.strip() == '':
        return 0
    
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
                dt = datetime.strptime(timestamp_str.strip(), fmt)
                return int(dt.timestamp())
            except ValueError:
                continue
        
        # If no format matches, return 0
        return 0
    except:
        return 0

def csv_to_json(input_file, output_file):
    """Convert CSV file to JSON format"""
    
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
    
    jobs = []
    for row in reader:
        if len(row) > 0 and row[0].strip():  # Skip empty rows
            # Skip header-like rows
            if (row[0] == 'Timestamp' or 
                'What\'s the link' in row[0] or
                'Please share' in row[0] or
                'Starting November' in row[0]):
                continue
            
            # Skip rows without job title or link
            if not row[6] or not row[1]:
                continue
            
            # Convert timestamp to Unix timestamp
            unix_timestamp = parse_timestamp_to_unix(row[0])
            if unix_timestamp == 0:
                continue
            
            job = {
                "timestamp": unix_timestamp,
                "jobLink": row[1] or "",
                "additionalInfo": row[2] or "",
                "includeSalaryRange": row[3] or "",
                "salaryRange": row[4] or "",
                "employerName": row[5] or "",
                "jobTitle": row[6] or "",
                "workingStyle": row[7] or "",
                "compensationInfo": row[9] or "",
                "compliancePlan": row[10] or "",
                "contactSlack": row[11] or "",
                "roleType": row[12] or "",
                "visaSponsorship": row[13] or "",
                "hiringProcess": row[14] or "",
                "compLow": row[15] or "",
                "compHigh": row[16] or ""
            }
            
            jobs.append(job)
    
    # Sort by timestamp (most recent first)
    jobs.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Write JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)
    
    print(f"Converted {len(jobs)} job entries to JSON format")
    print(f"Output written to: {output_file}")

if __name__ == "__main__":
    input_file = "public/job_data.csv"
    output_file = "public/job_data.json"
    
    if not os.path.exists(input_file):
        print(f"Error: Input file {input_file} not found")
        sys.exit(1)
    
    try:
        csv_to_json(input_file, output_file)
        print("CSV to JSON conversion completed successfully!")
    except Exception as e:
        print(f"Error converting CSV to JSON: {e}")
        sys.exit(1)
