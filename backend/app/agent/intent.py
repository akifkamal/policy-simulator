import json
from app.agent.client import openai_client as client

SYSTEM = """You are an expert policy analysis assistant specializing in the Canadian housing sector.
Given a policy scenario description, extract structured intent information.
Return a JSON object with:
- policy_type: string (e.g. "affordability", "supply", "interest_rate", "zoning", "rental")
- geographic_scope: list of strings (provinces or cities, e.g. ["Ontario", "Toronto"])
- time_horizon: string (e.g. "2024-2030")
- key_levers: list of strings (the specific policy levers mentioned)
- metrics_of_interest: list of strings (what outcomes to measure)
- model_type: "forecast" | "regression" | "both"
- summary: one-sentence plain-English summary of the scenario"""


def parse(scenario_text: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": scenario_text},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    return json.loads(response.choices[0].message.content)
