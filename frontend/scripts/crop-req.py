"""Crop CLINVARA asset sheet req.png into site-ready images."""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageOps

SRC = Path(r"D:\User data\Downloads\req.png")
OUT = Path(r"D:\User data\Desktop\clinvara\public\images")

# Regions as (left, top, right, bottom) on 1254x1254 source — tuned to req.png layout
REGIONS = {
    # Category circles (5) — row under "Category Circles" label
    "categories/skin.jpg": (24, 52, 248, 276),
    "categories/hair.jpg": (262, 52, 486, 276),
    "categories/bath.jpg": (500, 52, 724, 276),
    "categories/lip.jpg": (738, 52, 962, 276),
    "categories/eye.jpg": (976, 52, 1200, 276),
    # Blog cards (3) — 16:9 crop from each card
    "blog/layering-guide.jpg": (20, 318, 418, 542),
    "blog/niacinamide-vs-vitc.jpg": (428, 318, 826, 542),
    "blog/skin-barrier.jpg": (836, 318, 1234, 542),
    # Extra products — front bottle from each pair (right column = angle, skip)
    "products/sunscreen.jpg": (30, 598, 200, 758),
    "products/sunscreen-alt.jpg": (210, 598, 380, 758),
    "products/vitamin-c-serum.jpg": (400, 598, 570, 758),
    "products/vitamin-c-serum-alt.jpg": (580, 598, 750, 758),
    "products/retinol-serum.jpg": (770, 598, 940, 758),
    "products/retinol-serum-alt.jpg": (950, 598, 1120, 758),
    "products/shampoo.jpg": (30, 778, 200, 938),
    "products/shampoo-alt.jpg": (210, 778, 380, 938),
    "products/hair-serum.jpg": (400, 778, 570, 938),
    "products/hair-serum-alt.jpg": (580, 778, 750, 938),
    # Hero strip
    "hero/lifestyle-banner.jpg": (20, 968, 1234, 1120),
    # Mega menu featured
    "hero/mega-featured-vitc.jpg": (20, 1128, 400, 1240),
    # Favicon source (square)
    "brand/favicon-512.png": (420, 1128, 620, 1240),
    # OG / social (wide crop from bottom-right card if present)
    "brand/og-share.jpg": (640, 1128, 1234, 1240),
}


def crop_circle(im: Image.Image, size: int = 400) -> Image.Image:
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    im = im.crop((left, top, left + side, top + side))
    im = ImageOps.fit(im, (size, size), method=Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    from PIL import ImageDraw

    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    out = Image.new("RGB", (size, size), (255, 255, 255))
    out.paste(im, (0, 0), mask)
    return out


def crop_16_9(im: Image.Image, width: int = 1200) -> Image.Image:
    w, h = im.size
    target_ratio = 16 / 9
    current = w / h
    if current > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        im = im.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        im = im.crop((0, top, w, top + new_h))
    height = int(width * 9 / 16)
    return ImageOps.fit(im, (width, height), method=Image.Resampling.LANCZOS)


def crop_product(im: Image.Image, size: int = 800) -> Image.Image:
    return ImageOps.fit(im, (size, size), method=Image.Resampling.LANCZOS)


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    print("Source size:", src.size)

    for rel, box in REGIONS.items():
        out_path = OUT / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)
        cropped = src.crop(box)

        if rel.startswith("categories/"):
            out = crop_circle(cropped, 400)
            out.save(out_path, quality=88, optimize=True)
        elif rel.startswith("blog/"):
            out = crop_16_9(cropped, 1200)
            out.save(out_path, quality=88, optimize=True)
        elif rel.startswith("products/"):
            out = crop_product(cropped, 800)
            out.save(out_path, quality=90, optimize=True)
        elif rel.endswith("favicon-512.png"):
            out = ImageOps.fit(cropped, (512, 512), method=Image.Resampling.LANCZOS)
            out.save(out_path, optimize=True)
        elif rel.startswith("hero/") or rel.startswith("brand/"):
            if "og-share" in rel:
                out = ImageOps.fit(cropped, (1200, 630), method=Image.Resampling.LANCZOS)
            else:
                out = ImageOps.fit(cropped, (1400, 520), method=Image.Resampling.LANCZOS)
            out.save(
                out_path.with_suffix(".jpg") if rel.endswith(".png") else out_path,
                quality=88,
                optimize=True,
            )
            if rel.endswith(".png") and out_path.suffix == ".png":
                pass
        else:
            cropped.save(out_path, quality=88)

        print("Wrote", out_path)


if __name__ == "__main__":
    main()
