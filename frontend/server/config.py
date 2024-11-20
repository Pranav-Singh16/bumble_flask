import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    BUMBLE_EMAIL = os.getenv('BUMBLE_EMAIL')
    BUMBLE_PASSWORD = os.getenv('BUMBLE_PASSWORD')
    FACE_SIMILARITY_THRESHOLD = 0.6