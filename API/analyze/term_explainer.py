import aiohttp
import asyncio

async def explain_term(term: str) -> str:
    url = "https://www.wikidata.org/w/api.php"
    params = {
        "action": "wbsearchentities",
        "language": "en",
        "format": "json",
        "search": term
    }
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as response:
            response_json = await response.json()
            if response_json.get("search"):
                return response_json["search"][0].get("description", "No description found.")
            return "Term not found in financial context."