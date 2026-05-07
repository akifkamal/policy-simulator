import httpx
from openai import OpenAI
from app.config import settings

# Corporate networks often block TLS certificate revocation checks.
# Using a custom httpx client with verify=False allows the connection to proceed.
_http = httpx.Client(verify=False)

openai_client = OpenAI(api_key=settings.openai_api_key, http_client=_http)
