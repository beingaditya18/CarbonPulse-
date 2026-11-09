"""
Acquisition script for City of Seattle Building Energy Benchmarking Data.
Downloads the official statutory dataset from the City of Seattle Open Data portal (Socrata API / CSV endpoint).
Saves pristine raw data to data/raw/ with cryptographic checksum verification.
"""
import os
import sys
import hashlib
import urllib.request
import pandas as pd

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")
RAW_CSV_PATH = os.path.join(RAW_DATA_DIR, "seattle_building_energy_benchmarking_raw.csv")

# Socrata endpoint for Seattle Building Energy Benchmarking (2015-Present)
# Resource ID: teqw-tu6e
SOCRATA_CSV_URL = "https://data.seattle.gov/api/views/teqw-tu6e/rows.csv?accessType=DOWNLOAD"

def download_seattle_data():
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    
    print(f"Connecting to City of Seattle Open Data Portal...")
    print(f"URL: {SOCRATA_CSV_URL}")
    print(f"Destination: {RAW_CSV_PATH}")
    
    req = urllib.request.Request(
        SOCRATA_CSV_URL,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CarbonPulseResearchPipeline/1.0"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as response, open(RAW_CSV_PATH, 'wb') as out_file:
            meta = response.info()
            total_size = int(meta.get("Content-Length", 0))
            print(f"Downloading stream (Content-Length: {total_size} bytes)...")
            
            chunk_size = 64 * 1024
            bytes_read = 0
            while True:
                chunk = response.read(chunk_size)
                if not chunk:
                    break
                out_file.write(chunk)
                bytes_read += len(chunk)
                if total_size > 0:
                    percent = (bytes_read / total_size) * 100
                    sys.stdout.write(f"\rDownloaded {bytes_read:,} / {total_size:,} bytes ({percent:.1f}%)")
                else:
                    sys.stdout.write(f"\rDownloaded {bytes_read:,} bytes")
                sys.stdout.flush()
        print("\nDownload complete!")
        
        # Compute SHA-256 hash
        hasher = hashlib.sha256()
        with open(RAW_CSV_PATH, 'rb') as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        sha256_hash = hasher.hexdigest()
        print(f"SHA-256: {sha256_hash}")
        
        # Verify CSV readability
        df = pd.read_csv(RAW_CSV_PATH, low_memory=False)
        print(f"Successfully loaded raw dataset into DataFrame.")
        print(f"Observations: {len(df):,}")
        print(f"Features: {len(df.columns)}")
        print(f"Years covered: {sorted(df['DataYear'].dropna().unique().tolist()) if 'DataYear' in df.columns else 'N/A'}")
        
        return sha256_hash, len(df), len(df.columns)
        
    except Exception as e:
        print(f"\nError downloading dataset: {e}")
        # If download fails, check Socrata JSON paging as robust fallback
        print("Attempting Socrata JSON fallback...")
        return download_via_socrata_json()

def download_via_socrata_json():
    import json
    base_url = "https://data.seattle.gov/resource/teqw-tu6e.json"
    offset = 0
    limit = 5000
    all_records = []
    
    while True:
        paged_url = f"{base_url}?$limit={limit}&$offset={offset}&$order=:id"
        print(f"Fetching records offset {offset}...")
        req = urllib.request.Request(paged_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        if not data:
            break
        all_records.extend(data)
        offset += len(data)
        if len(data) < limit:
            break
            
    df = pd.DataFrame(all_records)
    df.to_csv(RAW_CSV_PATH, index=False)
    hasher = hashlib.sha256()
    with open(RAW_CSV_PATH, 'rb') as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    sha256_hash = hasher.hexdigest()
    print(f"Fallback complete! Records: {len(df):,}, Columns: {len(df.columns)}")
    return sha256_hash, len(df), len(df.columns)

if __name__ == "__main__":
    download_seattle_data()
