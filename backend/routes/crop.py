from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from image_utils import open_image, to_jpeg_bytes

router = APIRouter()


@router.post("/api/crop")
async def crop_image(
    file: UploadFile = File(...),
    x:    int        = Form(...),
    y:    int        = Form(...),
    cw:   int        = Form(...),
    ch:   int        = Form(...),
    w:    int        = Form(...),
    h:    int        = Form(...),
):
    """
    Crop a region (x, y, cw, ch) from an uploaded image, then resize it
    to the target preset dimensions (w × h) using Lanczos resampling.
    Returns a JPEG blob.
    """
    if cw <= 0 or ch <= 0 or w <= 0 or h <= 0:
        raise HTTPException(status_code=400, detail="Invalid dimensions.")
    if w > 4000 or h > 4000:
        raise HTTPException(status_code=400, detail="Output dimensions too large.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        img = open_image(data)

        # Clamp crop box to actual image bounds
        x  = max(0, x)
        y  = max(0, y)
        cw = min(cw, img.width  - x)
        ch = min(ch, img.height - y)

        if cw <= 0 or ch <= 0:
            raise ValueError("Crop region is outside the image bounds.")

        cropped = img.crop((x, y, x + cw, y + ch))
        resized = cropped.resize((w, h), resample=2)  # 2 = Image.LANCZOS
        jpeg    = to_jpeg_bytes(resized)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Image processing failed: {e}")

    filename = f"cropped-{w}x{h}.jpg"
    return Response(
        content=jpeg,
        media_type="image/jpeg",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
