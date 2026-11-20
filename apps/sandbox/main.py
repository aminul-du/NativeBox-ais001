from fastapi import FastAPI
app = FastAPI(title="MCore sandbox")
@app.get("/health")
def health(): return {"status": "ok", "service": "sandbox"}
