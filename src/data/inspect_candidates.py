"""
Inspect candidate datasets from public data portals.
Queries metadata and records from Seattle Open Data, Canadian Vehicle Emissions, and UCI repositories.
"""
import urllib.request
import json
import ssl

def inspect_seattle():
    ctx = ssl.create_default_context()
    print("=== CANDIDATE 1: City of Seattle Building Energy Benchmarking Data ===")
    url_years = "https://data.seattle.gov/resource/teqw-tu6e.json?%24select=datayear,count(*)&%24group=datayear&%24order=datayear"
    req = urllib.request.Request(url_years, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        data = json.loads(resp.read().decode())
    for r in data:
        print(f"  Year {r.get('datayear')}: {r.get('count')} records")

def inspect_canada():
    print("\n=== CANDIDATE 2: Natural Resources Canada Vehicle CO2 Emissions ===")
    # Check open.canada.ca resource
    url = "https://open.canada.ca/data/api/action/package_show?id=98f1a129-f628-4ce4-b24d-6f16bf24dd64"
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            data = json.loads(resp.read().decode())
            res = data.get('result', {})
            print(f"Title: {res.get('title')}")
            print(f"Resources count: {len(res.get('resources', []))}")
            for r in res.get('resources', [])[:3]:
                print(f"  - {r.get('name')}: {r.get('url')} ({r.get('format')})")
    except Exception as e:
        print(f"Canada API check: {e}")

if __name__ == '__main__':
    inspect_seattle()
    inspect_canada()
