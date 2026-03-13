from fastapi import FastAPI, Request
from src.appointment.routers.appointment_router import router as appointment_router
from src.client.routers.client_router import router as client_router
from src.provider.routers.provider_router import router as provider_router
from src.provider.routers.template_router import router as template_router
from src.auth.routers.user_router import router as user_router
from src.stripe.stripe_router import router as stripe_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uvicorn
import logging
import traceback

# Set up detailed logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

origins = [
    'https://yourdomain.com'
]

app = FastAPI(title="Appointment Scheduler", description="A simple appointment scheduler API", tags=['api'])

@app.get("/")
def read_root():
    return {"message": "Hello World"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    logger.error(f"Request body: {exc.body}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body}
    )

# Add global exception handler for all errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {str(exc)}")
    logger.error(f"Error type: {type(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": str(type(exc))}
    )

app.include_router(appointment_router, prefix="/api")
app.include_router(client_router, prefix="/api")
app.include_router(provider_router, prefix="/api")
app.include_router(template_router, prefix="/api")
app.include_router(user_router, prefix="/api/auth")
app.include_router(stripe_router, prefix="/api")

@app.get("/health")
def health():
    return {"status":"ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)