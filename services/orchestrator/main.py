from fastapi import FastAPI

app = FastAPI(title="MCore Orchestrator (Placeholder)")

@app.get("/health")
def health():
    return {"status": "ok", "service": "orchestrator"}
