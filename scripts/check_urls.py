#!/usr/bin/env python3
"""
Script to check if job posting URLs are still active and remove dead links.
"""

import csv
import requests
import sys
import time
from urllib.parse import urlparse
from typing import List, Dict, Any
import argparse

def check_url_and_get_final(url: str, timeout: int = 10) -> tuple[bool, str]:
    """
    Check if a URL is accessible and get the final URL after redirects.
    
    Args:
        url: The URL to check
        timeout: Request timeout in seconds
        
    Returns:
        Tuple of (is_active, final_url)
    """
    if not url or not url.strip():
        return False, url
        
    try:
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        final_url = response.url
        
        # Only consider it active if status code is good
        is_active = response.status_code < 400
        
        return is_active, final_url
    except (requests.RequestException, requests.Timeout, requests.ConnectionError):
        return False, url

def clean_job_data(input_file: str, output_file: str, dry_run: bool = False) -> Dict[str, int]:
    """
    Clean job data by removing rows with inactive URLs and updating redirects.
    
    Args:
        input_file: Path to input CSV file
        output_file: Path to output CSV file
        dry_run: If True, only report what would be removed without writing
        
    Returns:
        Dictionary with statistics about the cleaning process
    """
    stats = {
        'total_rows': 0,
        'active_urls': 0,
        'inactive_urls': 0,
        'empty_urls': 0,
        'redirects_updated': 0
    }
    
    cleaned_rows = []
    
    try:
        with open(input_file, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            fieldnames = reader.fieldnames
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 since header is row 1
                stats['total_rows'] += 1
                url = row.get('What\'s the link to the job posting?', '').strip()
                
                if not url:
                    stats['empty_urls'] += 1
                    if not dry_run:
                        cleaned_rows.append(row)
                    continue
                
                # Skip rows that look like they contain malformed data
                if len(url) > 500 or ' ' in url[:10]:  # URLs shouldn't have spaces in the first 10 chars
                    print(f"Row {row_num}: Skipping malformed URL: {url[:100]}...")
                    stats['inactive_urls'] += 1
                    continue
                
                print(f"Checking: {url}")
                
                is_active, final_url = check_url_and_get_final(url)
                
                if is_active:
                    stats['active_urls'] += 1
                    
                    # Check if URL was redirected
                    if final_url != url:
                        stats['redirects_updated'] += 1
                        print(f"  ✓ Active (redirected to: {final_url})")
                        # Update the URL in the row
                        row['What\'s the link to the job posting?'] = final_url
                    else:
                        print(f"  ✓ Active")
                    
                    if not dry_run:
                        cleaned_rows.append(row)
                else:
                    stats['inactive_urls'] += 1
                    print(f"  ✗ Inactive/Dead link")
                
                # Be respectful to servers
                time.sleep(0.5)
    
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading input file: {e}")
        sys.exit(1)
    
    if not dry_run and cleaned_rows:
        try:
            with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(cleaned_rows)
            print(f"\nCleaned data written to: {output_file}")
        except Exception as e:
            print(f"Error writing output file: {e}")
            sys.exit(1)
    
    return stats

def main():
    parser = argparse.ArgumentParser(description='Check and clean job posting URLs')
    parser.add_argument('input_file', help='Input CSV file path')
    parser.add_argument('-o', '--output', help='Output CSV file path (default: overwrites input)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be removed without making changes')
    parser.add_argument('--timeout', type=int, default=10, help='Request timeout in seconds (default: 10)')
    
    args = parser.parse_args()
    
    output_file = args.output if args.output else args.input_file
    
    print(f"Checking job posting URLs in: {args.input_file}")
    if args.dry_run:
        print("DRY RUN MODE - No changes will be made")
    else:
        print(f"Output will be written to: {output_file}")
    
    print("-" * 50)
    
    stats = clean_job_data(args.input_file, output_file, args.dry_run)
    
    print("-" * 50)
    print("SUMMARY:")
    print(f"Total rows processed: {stats['total_rows']}")
    print(f"Active URLs: {stats['active_urls']}")
    print(f"Inactive URLs: {stats['inactive_urls']}")
    print(f"Empty URLs: {stats['empty_urls']}")
    print(f"URLs updated due to redirects: {stats['redirects_updated']}")
    
    if args.dry_run:
        print(f"\nWould remove {stats['inactive_urls']} rows with inactive URLs")
        print(f"Would update {stats['redirects_updated']} URLs due to redirects")
    else:
        print(f"\nRemoved {stats['inactive_urls']} rows with inactive URLs")
        print(f"Updated {stats['redirects_updated']} URLs due to redirects")

if __name__ == '__main__':
    main()
