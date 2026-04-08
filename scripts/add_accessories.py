"""
add_accessories.py
Automatically adds all 6 accessory models to Wallcraft via the admin API.
Run from the project root:  python3 add_accessories.py
Requires: backend running on localhost:3001
"""

import urllib.request
import urllib.error
import json
import os
import sys

BASE = "http://localhost:3001"
STORE = "wallcraft"
EMAIL = "admin@wallcraft.am"
PASSWORD = "admin123"

# Model files — must be in frontend/public/uploads/models/
ACCESSORIES = [
    {
        "type_name": "socket",
        "name": "Розетка EU",
        "file": "socket.glb",
        "scale": 1.0,
    },
    {
        "type_name": "switch",
        "name": "Выключатель",
        "file": "switch.glb",
        "scale": 1.0,
    },
    {
        "type_name": "tv",
        "name": "Телевизор 55\"",
        "file": "tv.glb",
        "scale": 1.0,
    },
    {
        "type_name": "picture",
        "name": "Рамка для картины",
        "file": "picture_frame.glb",
        "scale": 1.0,
    },
    {
        "type_name": "lamp",
        "name": "Настенная лампа",
        "file": "wall_lamp.glb",
        "scale": 1.0,
    },
    {
        "type_name": "shelf",
        "name": "Настенная полка",
        "file": "shelf.glb",
        "scale": 1.0,
    },
]


def api(method, path, data=None, token=None):
    url = f"{BASE}{path}?store={STORE}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = json.loads(e.read())
        raise Exception(f"HTTP {e.code}: {err}")


def login():
    print("🔑 Logging in...")
    res = api("POST", "/admin/auth/login", {"email": EMAIL, "password": PASSWORD})
    token = res["data"]["accessToken"]
    print(f"   ✅ Got token")
    return token


def get_type_ids(token):
    print("📋 Fetching accessory types...")
    res = api("GET", "/api/accessory-types", token=token)
    types = {t["name"]: t["id"] for t in res["data"]}
    print(f"   Found: {list(types.keys())}")
    return types


def check_existing(token):
    res = api("GET", "/admin/accessories", token=token)
    return {a["name"] for a in res["data"]}


def add_accessory(acc, type_id, token):
    # The .glb files are served as static files from frontend/public/
    # In dev mode, Vite serves /uploads/models/... directly
    model_url = f"/uploads/models/{acc['file']}"
    # Use a simple placeholder thumbnail (white square data URI)
    thumb_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg=="

    payload = {
        "type_id": type_id,
        "name": acc["name"],
        "model_url": model_url,
        "thumb_url": thumb_url,
        "scale": acc["scale"],
        "active": True,
    }
    res = api("POST", "/admin/accessories", payload, token=token)
    return res["data"]["id"]


def main():
    print("=" * 50)
    print("WallCraft — Adding accessories")
    print("=" * 50)

    # Check backend is up
    try:
        api("GET", "/health")
    except Exception:
        print("❌ Backend not running on localhost:3001")
        print("   Run: cd backend && npm run dev")
        sys.exit(1)

    token = login()
    type_ids = get_type_ids(token)
    existing = check_existing(token)

    print(f"\n📦 Adding accessories...")
    added = 0
    skipped = 0

    for acc in ACCESSORIES:
        if acc["name"] in existing:
            print(f"   ⏭  {acc['name']} — already exists, skipping")
            skipped += 1
            continue

        type_id = type_ids.get(acc["type_name"])
        if not type_id:
            print(f"   ⚠️  Type '{acc['type_name']}' not found in DB, skipping")
            continue

        # Check model file exists
        glb_path = os.path.join("frontend", "public", "uploads", "models", acc["file"])
        if not os.path.exists(glb_path):
            print(f"   ⚠️  File not found: {glb_path}")
            print(f"      Copy {acc['file']} to frontend/public/uploads/models/")
            continue

        try:
            acc_id = add_accessory(acc, type_id, token)
            print(f"   ✅ {acc['name']} (id: {acc_id[:8]}...)")
            added += 1
        except Exception as e:
            print(f"   ❌ {acc['name']}: {e}")

    print(f"\n{'='*50}")
    print(f"Done: {added} added, {skipped} skipped")
    if added > 0:
        print(f"\n🎉 Open http://localhost:5173 and test accessories!")
        print(f"   Visualizer → Настроить → Аксессуары")


if __name__ == "__main__":
    main()
