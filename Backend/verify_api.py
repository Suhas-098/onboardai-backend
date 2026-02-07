import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:5000/api/risks") as response:
        if response.status == 200:
            print("API Response:")
            print(json.dumps(json.loads(response.read().decode()), indent=2))
        else:
            print(f"Failed with status code: {response.status}")
except Exception as e:
    print(f"Error: {e}")
