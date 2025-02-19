# This script handles data extraction from sources such as CSV files or APIs.

import pandas as pd

def extract_data(source):
    """
    Extract data from a specified source.
    
    Parameters:
    source (str): The path to the data source (e.g., CSV file or API endpoint).
    
    Returns:
    DataFrame: A pandas DataFrame containing the extracted data.
    """
    if source.endswith('.csv'):
        return pd.read_csv(source)
    else:
        raise ValueError("Unsupported data source format. Please provide a CSV file.")

# Example usage
if __name__ == "__main__":
    data_source = 'path/to/your/data.csv'  # Replace with your actual data source
    data = extract_data(data_source)
    print(data.head())