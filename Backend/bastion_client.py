# bastion_client.py
import requests

BASTION_API = "http://127.0.0.1:8000"
BASTION_MODEL = "deepseek-r1:8b"

def query_bastion(prompt: str) -> str:
    payload = {
        "model": BASTION_MODEL,
        "prompt": prompt,
        "stream": False,
    }
    r = requests.post(f"{BASTION_API}/api/generate", json=payload, timeout=60)
    r.raise_for_status()
    return r.json().get("response", "")
