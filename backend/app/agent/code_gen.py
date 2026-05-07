import json
from app.agent.client import openai_client as client

SYSTEM = """You are an expert Python data scientist specializing in housing policy analysis.
Generate a complete, self-contained Python script.

CRITICAL: Output ONLY raw Python code. Do NOT use markdown or backticks anywhere.

ALLOWED LIBRARIES ONLY (these are the only packages installed):
  matplotlib, numpy, pandas, scikit-learn (sklearn), prophet, requests, openpyxl, json, os, csv, pathlib, datetime

DO NOT USE plotly, fbprophet, seaborn, scipy, statsmodels, or anything not listed above.

EXACT IMPORT SPELLINGS (copy exactly):
  import matplotlib; matplotlib.use('Agg')
  import matplotlib.pyplot as plt
  import numpy as np
  import pandas as pd
  from sklearn.linear_model import LinearRegression
  from sklearn.preprocessing import PolynomialFeatures
  from sklearn.pipeline import make_pipeline

Use sklearn PolynomialFeatures + LinearRegression for both regression AND time-series forecasting.
PANDAS DATE RANGE: use freq='ME' for month-end (NOT freq='M' — deprecated and raises an error).

The script must:
1. Try to download the specified CMHC datasets using requests/pandas
2. Handle download failures gracefully with try/except and ALWAYS fall back to generating synthetic but realistic Canadian housing data using numpy
3. Run Prophet for time-series forecasting AND sklearn LinearRegression for regression
4. Save outputs to pathlib.Path(os.environ['ARTIFACTS_DIR'])

REQUIRED output files (must create ALL three):
  artifacts_dir / 'charts' / 'chart_0.png'   — matplotlib chart, saved with plt.savefig()
  artifacts_dir / 'tables' / 'table_0.csv'   — pandas DataFrame saved with df.to_csv()
  artifacts_dir / 'stats.json'               — json.dump({"key_findings": [...], "metrics": {...}})

CHART RULES:
  plt.tight_layout()
  plt.savefig(str(path), dpi=100, bbox_inches='tight')
  plt.close()
  # never plt.show()

Print a progress message before each major step."""

USER_TEMPLATE = """Policy intent:
{intent}

Available datasets:
{datasets}

Data strategy:
{strategy}

Generate the complete Python modelling script."""


def generate(intent: dict, data_info: dict) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM},
            {
                "role": "user",
                "content": USER_TEMPLATE.format(
                    intent=json.dumps(intent, indent=2),
                    datasets=json.dumps(data_info.get("datasets", []), indent=2),
                    strategy=data_info.get("data_strategy", ""),
                ),
            },
        ],
        temperature=0.2,
        max_tokens=4000,
    )
    content = response.choices[0].message.content
    return _strip_fences(content)


def _strip_fences(content: str) -> str:
    """Remove all markdown code fences from generated script."""
    import re
    # Remove outer ```python ... ``` or ``` ... ``` wrapper
    content = re.sub(r"^```(?:python)?\n", "", content)
    content = re.sub(r"\n```$", "", content.rstrip())
    # Remove any remaining standalone ``` lines (e.g. inside docstrings)
    content = re.sub(r"^```.*$", "", content, flags=re.MULTILINE)
    return content


def fix(script: str, error: str) -> str:
    """Ask GPT to fix a syntax/runtime error in the generated script."""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": f"Fix this Python script. Error:\n{error}\n\nScript:\n{script}"},
        ],
        temperature=0.1,
        max_tokens=4000,
    )
    return _strip_fences(response.choices[0].message.content)
