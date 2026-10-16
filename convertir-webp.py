"""Convertit toutes les images JPG/PNG du dossier assets en WebP.

Usage : python convertir-webp.py
Les originaux sont supprimés une fois convertis.
"""
from pathlib import Path
from PIL import Image

ASSETS = Path(__file__).parent / "assets"
MAX_SIZE = 2200  # largeur/hauteur max en px, largement suffisant pour le web

for src in sorted(ASSETS.iterdir()):
    if src.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        continue
    im = Image.open(src)
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    im.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
    dst = src.with_suffix(".webp")
    im.save(dst, "WEBP", quality=82, method=6)
    print(f"{src.name} ({src.stat().st_size // 1024} Ko) -> {dst.name} ({dst.stat().st_size // 1024} Ko)")
    src.unlink()
