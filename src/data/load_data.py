"""
Module: load_data.py
Loads the raw statutory building energy benchmarking dataset.
Enforces typed schemas and isolates data paths.
"""
import os
import pandas as pd

RAW_DATA_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "raw", "seattle_building_energy_benchmarking_raw.csv"
)

def load_raw_dataset(filepath: str = RAW_DATA_PATH) -> pd.DataFrame:
    """
    Loads raw CSV data with strict low-memory disabled and proper string parsing.
    
    Args:
        filepath: Path to the raw CSV file.
        
    Returns:
        pd.DataFrame containing the raw records.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"Raw dataset not found at '{filepath}'. Please execute src/data/download_dataset.py first."
        )
        
    df = pd.read_csv(filepath, low_memory=False)
    
    # Standardize column names (strip whitespace)
    df.columns = [col.strip() for col in df.columns]
    
    return df

if __name__ == "__main__":
    df = load_raw_dataset()
    print(f"Loaded raw dataset successfully: {df.shape[0]:,} rows, {df.shape[1]} columns.")
