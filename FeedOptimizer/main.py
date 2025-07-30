from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from optimizer.models import FormulaRequest, FormulaResponse
from optimizer.optimizer import generate_feed_formula

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("feed-optimizer")

app = FastAPI(
    title="PoultryPal Feed Formula Optimizer",
    description="API for generating optimized poultry feed formulas",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "feed-optimizer"}


@app.post("/optimize", response_model=FormulaResponse)
async def optimize_formula(request: FormulaRequest):
    """
    Generate an optimized feed formula based on nutritional requirements
    and available ingredients
    """
    try:
        logger.info(f"Received optimization request for {request.bird_type} at age {request.bird_age}")
        result = generate_feed_formula(request)
        logger.info(f"Optimization completed successfully")
        return result
    except Exception as e:
        logger.error(f"Optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)