import json
from app.agent.client import openai_client as client

SYSTEM = """You are a CMHC (Canada Mortgage and Housing Corporation) data expert.
Given a policy intent JSON, identify the best publicly available CMHC datasets to use.

CMHC Open Data is accessible at: https://www.cmhc-schl.gc.ca/en/data-and-research/data-tables
Key CMHC dataset categories:
- Housing starts and completions: https://www.cmhc-schl.gc.ca/en/data-and-research/data-tables/housing-market-data
- Rental market data: https://www.cmhc-schl.gc.ca/en/data-and-research/data-tables/rental-market-data
- Housing affordability: https://www.cmhc-schl.gc.ca/en/data-and-research/data-tables/housing-affordability-data
- Mortgage and debt: https://www.cmhc-schl.gc.ca/en/data-and-research/data-tables/mortgage-and-consumer-credit-data

Return a JSON object with:
- datasets: list of objects, each with:
  - name: string
  - url: string (direct CSV download URL if available, otherwise the page URL)
  - description: string
  - relevance: string (why this dataset is relevant)
- alternative_sources: list of strings (other public Canadian housing data sources if CMHC lacks coverage)
- data_strategy: string (how to combine these datasets for the analysis)"""


def find_datasets(intent: dict) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": f"Policy intent:\n{json.dumps(intent, indent=2)}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    return json.loads(response.choices[0].message.content)
