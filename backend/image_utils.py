"""
Shared Pillow image helpers used by both the convert and crop routes.
"""
import io
from PIL import Image


def open_image(data: bytes) -> Image.Image:
    """Open image bytes, converting to RGB so JPEG output always works."""
    img = Image.open(io.BytesIO(data))
    if img.mode in ("RGBA", "P", "LA"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")
    return img


def contain_resize(img: Image.Image, w: int, h: int) -> Image.Image:
    """
    Resize `img` to fit exactly `w × h` using contain logic (no cropping).
    Empty space is filled with white. Uses Lanczos for high quality.
    """
    scale    = min(w / img.width, h / img.height)
    new_w    = max(1, round(img.width  * scale))
    new_h    = max(1, round(img.height * scale))
    resized  = img.resize((new_w, new_h), Image.LANCZOS)
    out      = Image.new("RGB", (w, h), (255, 255, 255))
    paste_x  = (w - new_w) // 2
    paste_y  = (h - new_h) // 2
    out.paste(resized, (paste_x, paste_y))
    return out


def to_jpeg_bytes(img: Image.Image, quality: int = 92) -> bytes:
    """Return image as JPEG bytes."""
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    buf.seek(0)
    return buf.read()
