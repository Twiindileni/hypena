from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from image_utils import open_image, contain_resize, to_jpeg_bytes

router = APIRouter()


@router.post("/api/convert")
async def convert_image(
    file: UploadFile = File(...),
    w:    int        = Form(...),
    h:    int        = Form(...),
):
    """
    Resize an uploaded image to the exact preset dimensions using contain logic
    (Lanczos resampling, white letterbox fill). Returns a JPEG blob.
    """
    if w <= 0 or h <= 0 or w > 4000 or h > 4000:
        raise HTTPException(status_code=400, detail="Invalid dimensions.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        img    = open_image(data)
        result = contain_resize(img, w, h)
        jpeg   = to_jpeg_bytes(result)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Image processing failed: {e}")

    filename = f"converted-{w}x{h}.jpg"
    return Response(
        content=jpeg,
        media_type="image/jpeg",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
