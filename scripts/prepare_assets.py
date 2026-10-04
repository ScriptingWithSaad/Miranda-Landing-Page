"""Cache the original portfolio artwork and create responsive WebP sources.

Requires Pillow. Source URLs are retained for attribution and reproducibility.
"""
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/images"
OUT.mkdir(parents=True, exist_ok=True)
BASE = "https://uploads-ssl.webflow.com/"
SOURCES = {
    "header": "5f2429f172d117fcee10e819/5f7f87c8b81a6e7a214312f0_header.svg",
    "arrow": "5f2429f172d117fcee10e819/61001a3509319b6ae39e156b_arrow-long.svg",
    "avroko": "5f9085a4041dd5427c5ac8ae/615d9672cc65f12c9ab25f21_thumbnail-small.jpeg",
    "roger": "5f9085a4041dd5427c5ac8ae/645b5439577bd35377de8c43_thumbnail-small.webp",
    "portrait-star": "5f2429f172d117fcee10e819/605c6ce3bc0c7d1cd4ca847e_avatar-star-p-800.jpeg",
    "portrait-main": "5f2429f172d117fcee10e819/605c62f4c78c4ba46a1268be_avatar-1-p-2000.jpeg",
    "stamp": "5f2429f172d117fcee10e819/60474834660f934090d42877_stamp.png",
    "unexpected": "5f9085a4041dd5427c5ac8ae/645b5c79f349770ebcc28ec4_thumbnail-small.webp",
    "portrait-wide": "5f2429f172d117fcee10e819/605c679f33f67d3dd00b04b4_avatar-3.jpeg",
    "portrait-hat": "5f2429f172d117fcee10e819/605c70e48081716925e9832a_avatar-hat.jpeg",
    "portrait-side": "5f2429f172d117fcee10e819/605c6da4f1f8304440ee2e8c_avatar-2-p-1080.jpeg",
    "trophy": "5f2429f172d117fcee10e819/605c6fd0f6276ef0c6bacfa4_trophy-p-800.jpeg",
    "wow": "5f9085a4041dd5427c5ac8ae/647dc0777b1a5df29f8e5a58_thumbnail-small.webp",
}
manifest = {}
for name, path in SOURCES.items():
    url = BASE + path
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=30) as response:
        data = response.read()
    if path.endswith(".svg"):
        (OUT / f"{name}.svg").write_bytes(data)
        manifest[name] = {"source": url, "file": f"assets/images/{name}.svg"}
        continue
    image = ImageOps.exif_transpose(Image.open(BytesIO(data)))
    image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    maximum = min(image.width, 1600 if name.startswith("portrait") else 960)
    widths = sorted({min(width, maximum) for width in [320, 640, 960, maximum]})
    files = []
    for width in widths:
        resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
        filename = f"{name}-{width}.webp"
        resized.save(OUT / filename, "WEBP", quality=87, method=6)
        files.append({"file": f"assets/images/{filename}", "width": width, "height": resized.height})
    manifest[name] = {"source": url, "width": image.width, "height": image.height, "files": files}
    print(f"{name}: {image.width}x{image.height}, {sum((ROOT / item['file']).stat().st_size for item in files):,} bytes")
(ROOT / "assets/image-sources.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
