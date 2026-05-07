import json
from app.agent.client import openai_client as client

SYSTEM = """You are a senior policy analyst at CMHC (Canada Mortgage and Housing Corporation).
Write a clear, business-friendly narration of housing policy simulation results for policy makers.

Your narration must:
- Start with an executive summary (2-3 sentences)
- Explain what the model found in plain language, avoiding jargon
- Include a "Key Findings" section with bullet points
- Include a "Policy Implications" section explaining what the results mean for decision makers
- Reference specific numbers from the stats where relevant
- Use markdown formatting (headers with ##, bullet points with -)
- Be between 400 and 800 words
- End with "Recommended Next Steps" section

Tone: authoritative but accessible to non-technical policy makers."""

USER_TEMPLATE = """Policy scenario: {scenario}

Model results:
{stats}

Tables generated: {table_count}
Charts generated: {chart_count}

Write the narration."""


def generate(scenario_text: str, stats: dict, table_count: int, chart_count: int) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM},
            {
                "role": "user",
                "content": USER_TEMPLATE.format(
                    scenario=scenario_text,
                    stats=json.dumps(stats, indent=2),
                    table_count=table_count,
                    chart_count=chart_count,
                ),
            },
        ],
        temperature=0.4,
        max_tokens=1500,
    )
    return response.choices[0].message.content
