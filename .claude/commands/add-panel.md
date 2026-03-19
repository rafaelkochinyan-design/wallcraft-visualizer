# /add-panel — Add Panel Command
# Usage: /add-panel
# Walks through adding a new panel to Wallcraft via admin API

You are helping add a new decorative panel to the WallCraft system.

## Step 1 — Gather info
Ask the user for:
1. Panel name (e.g. "Атлантик")
2. SKU (e.g. "ATL-01") — optional
3. Dimensions: width_mm × height_mm × depth_mm (default: 500×500×19)
4. Price in ₽ — optional
5. Texture file path (jpg/png) — the high-res panel photo
6. Thumbnail file path (jpg/png) — small preview, ~200×200px

## Step 2 — Prepare texture
If texture file is provided locally:
```bash
# Check image dimensions
python3 -c "from PIL import Image; img=Image.open('PATH'); print(img.size)"

# If not square — crop to square center
python3 -c "
from PIL import Image, ImageEnhance
img = Image.open('INPUT_PATH').convert('RGB')
w,h = img.size; s = min(w,h)
img = img.crop(((w-s)//2,(h-s)//2,(w+s)//2,(h+s)//2))
img = ImageEnhance.Contrast(img).enhance(1.1)
img = ImageEnhance.Sharpness(img).enhance(1.2)
img.resize((1024,1024)).save('consul_NAME.jpg', quality=92)
img.resize((256,256)).save('consul_NAME_thumb.jpg', quality=85)
print('Done')
"
```

Copy to frontend public:
```bash
cp consul_NAME.jpg frontend/public/textures/
cp consul_NAME_thumb.jpg frontend/public/textures/
```

## Step 3 — Add via API (backend must be running)
```bash
# Get auth token
TOKEN=$(curl -s -X POST "http://localhost:3001/admin/auth/login?store=wallcraft" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wallcraft.am","password":"admin123"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])")

# Create panel
curl -s -X POST "http://localhost:3001/admin/panels?store=wallcraft" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "PANEL_NAME",
    "sku": "PANEL_SKU",
    "texture_url": "/textures/TEXTURE_FILE.jpg",
    "thumb_url": "/textures/THUMB_FILE.jpg",
    "width_mm": 500,
    "height_mm": 500,
    "depth_mm": 19,
    "price": PRICE,
    "active": true
  }' | python3 -m json.tool
```

## Step 4 — Verify
```bash
curl -s "http://localhost:3001/api/panels?store=wallcraft" \
  | python3 -c "import sys,json; panels=json.load(sys.stdin)['data']; [print(p['name'], p['texture_url']) for p in panels]"
```

Open http://localhost:5173 → select panels step → verify new panel appears with correct thumbnail.

## Step 5 — For production
After verifying locally:
```bash
git add frontend/public/textures/
git commit -m "feat: add panel PANEL_NAME texture"
git push
```
Then add via admin panel at https://frontend-beige-six-43.vercel.app/admin
