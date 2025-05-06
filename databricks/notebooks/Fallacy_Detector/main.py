from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
import tempfile
import shutil
import os

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

@app.post("/predict")
def predict_fallacy(data: TextInput):
    return {"prediction": "This is an ad hominem fallacy"}

# Load model once
model = whisper.load_model("base")  # You can use "tiny" for faster CPU results

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        result = model.transcribe(tmp_path)
        os.remove(tmp_path)
        return {"transcription": result["text"]}

    except Exception as e:
        return {"error": str(e)}
