from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import convert, crop

app = FastAPI(title="Hype NA Image API", version="1.0.0")

# Allow the React frontend (Vite dev + Vercel prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "https://*.vercel.app",    # Vercel preview deployments
        # Add your production domain here, e.g. "https://hypena.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert.router)
app.include_router(crop.router)


@app.get("/")
def health():
    return {"status": "ok", "service": "Hype NA Image API"}
