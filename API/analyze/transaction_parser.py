from models import Transaction
import pandas as pd
import io
import tabula
from typing import List
import logging

logger = logging.getLogger(__name__)

def parse_transactions(content: bytes, is_file: bool = False, file_type: str = "xlsx") -> List[Transaction]:
    try:
        df = None
        required_columns = ['date', 'amount', 'category']
        column_mappings = {
            'date': ['date', 'transaction_date', 'date_of_transaction'],
            'amount': ['amount', 'cost', 'transaction_amount', 'value', 'debit', 'credit'],
            'category': ['category', 'type', 'category_name', 'description']
        }

        if is_file:
            if file_type == "xlsx":
                xl = pd.ExcelFile(io.BytesIO(content))
                logger.debug("Excel file sheets: %s", xl.sheet_names)
                for sheet_name in xl.sheet_names:
                    temp_df = pd.read_excel(io.BytesIO(content), sheet_name=sheet_name)
                    original_columns = list(temp_df.columns)
                    normalized_columns = [str(col).strip().lower() for col in original_columns]
                    logger.debug("Sheet '%s' columns (original): %s", sheet_name, original_columns)
                    found_columns = {}
                    for req_col in required_columns:
                        for alias in column_mappings[req_col]:
                            if alias.lower() in normalized_columns:
                                idx = normalized_columns.index(alias.lower())
                                found_columns[req_col] = original_columns[idx]
                                logger.debug("Matched '%s' to '%s' for '%s'", alias, found_columns[req_col], req_col)
                                break
                    if len(found_columns) == len(required_columns):
                        df = temp_df.rename(columns={v: k for k, v in found_columns.items()})
                        logger.debug("Using sheet '%s' with columns: %s", sheet_name, found_columns)
                        break
                if df is None:
                    raise ValueError(f"No sheet contains required columns or their variations: {required_columns}")

            elif file_type == "csv":
                df = pd.read_csv(io.BytesIO(content))
                original_columns = list(df.columns)
                normalized_columns = [str(col).strip().lower() for col in original_columns]
                found_columns = {}
                for req_col in required_columns:
                    for alias in column_mappings[req_col]:
                        if alias.lower() in normalized_columns:
                            idx = normalized_columns.index(alias.lower())
                            found_columns[req_col] = original_columns[idx]
                            break
                if len(found_columns) != len(required_columns):
                    raise ValueError(f"CSV file must contain columns or variations: {required_columns}")
                df = df.rename(columns={v: k for k, v in found_columns.items()})

            elif file_type == "pdf":
                dfs = tabula.read_pdf(io.BytesIO(content), pages="all")
                if not dfs:
                    raise ValueError("No tables found in PDF")
                df = dfs[0]  # Assume first table
                original_columns = list(df.columns)
                normalized_columns = [str(col).strip().lower() for col in original_columns]
                found_columns = {}
                for req_col in required_columns:
                    for alias in column_mappings[req_col]:
                        if alias.lower() in normalized_columns:
                            idx = normalized_columns.index(alias.lower())
                            found_columns[req_col] = original_columns[idx]
                            break
                if len(found_columns) != len(required_columns):
                    if 'description' in normalized_columns:
                        df['category'] = df['description'].apply(lambda x: 'Food' if 'restaurant' in str(x).lower() else 'Other')
                        found_columns['category'] = 'category'
                        for req_col in ['date', 'amount']:
                            for alias in column_mappings[req_col]:
                                if alias.lower() in normalized_columns:
                                    idx = normalized_columns.index(alias.lower())
                                    found_columns[req_col] = original_columns[idx]
                                    break
                if len(found_columns) != len(required_columns):
                    raise ValueError(f"PDF file must contain columns or variations: {required_columns}")
                df = df.rename(columns={v: k for k, v in found_columns.items()})

        else:
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            if not all(col in df.columns for col in required_columns):
                raise ValueError("CSV file must contain 'date', 'amount', 'category' columns")

        df['date'] = df['date'].astype(str)
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        df['category'] = df['category'].astype(str)
        if df['amount'].isna().any():
            raise ValueError("Invalid or missing amounts in file")
        if df.empty or len(df) < 1:
            raise ValueError("No valid transactions found in file")

        transactions = [
            Transaction(date=row['date'], amount=row['amount'], category=row['category'])
            for _, row in df.iterrows()
        ]
        logger.debug("Parsed %d transactions", len(transactions))
        return transactions
    except Exception as e:
        logger.error("Failed to parse transactions: %s", str(e), exc_info=True)
        raise ValueError(f"Failed to parse transactions: {str(e)}")