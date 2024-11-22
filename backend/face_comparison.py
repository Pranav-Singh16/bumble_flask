import os
import requests
import numpy as np
import base64
from PIL import Image
import torch
import torch.nn.functional as F
from transformers import AutoModel, AutoFeatureExtractor
from insightface import app
import sys
import time
import io

class suppress_stdout_stderr:
    def __enter__(self):
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = sys.stdout

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr

def init_model():
    """
    Initialize the InsightFace face detection and embedding model.
    """
    try:
        with suppress_stdout_stderr():
            print("Initializing InsightFace model...")
            model = app.FaceAnalysis()
            model.prepare(ctx_id=0, det_size=(640, 640))
            print("InsightFace model initialized successfully.")
        return model
    except Exception as e:
        print(f"Error initializing InsightFace model: {e}")
        return None

def save_base64_image(base64_str, file_name):
    """
    Converts a base64 string to an image file and saves it.
    """
    try:
        print(f"Saving base64 image to {file_name}...")
        img_data = base64.b64decode(base64_str)
        with open(file_name, 'wb') as f:
            f.write(img_data)
        print(f"Image saved as {file_name}.")
        return file_name
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        return None

def load_image_from_base64(base64_str):
    """
    Convert a base64 string to a PIL Image.
    """
    try:
        print("Loading image from base64 string...")
        img_data = base64.b64decode(base64_str)
        image = Image.open(io.BytesIO(img_data))
        print("Image loaded successfully.")
        return np.array(image)
    except Exception as e:
        print(f"Error loading image from base64: {e}")
        return None

def load_jpg_image(image_path):
    """
    Load a JPG image file and convert it to a numpy array.
    """
    try:
        print(f"Loading JPG image from {image_path}...")
        image = Image.open(image_path)
        image = np.array(image)
        print("JPG image loaded successfully.")
        return image
    except Exception as e:
        print(f"Error loading JPG image: {e}")
        return None

def get_face_embedding_insightface(image, model):
    try:
        print("Getting face embedding using InsightFace...")
        faces = model.get(image)
        if len(faces) == 0:
            print(f"No faces detected in image.")
            return None
        largest_face = faces[0]
        print("Face embedding obtained successfully.")
        return largest_face.embedding
    except Exception as e:
        print(f"Error in get_face_embedding_insightface: {e}")
        return None

class FaceComparer:
    def __init__(self, method='insightface'):
        """
        Initialize the face comparison model (InsightFace or HuggingFace).
        """
        print(f"Initializing FaceComparer with method: {method}")  # Debugging print statement
        self.method = method
        if method == 'insightface':
            print("Initializing InsightFace model...")
            self.model = init_model()
        elif method == 'huggingface':
            print("Initializing HuggingFace model...")
            model_name = "microsoft/swin-base-patch4-window7-224-in22k"
            self.feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name)
            self.model.eval()
        else:
            raise ValueError("Method must be either 'insightface' or 'huggingface'")
        print("Model initialized successfully.")  # Debugging print statement

    def preprocess_image(self, image_base64):
        """
        Preprocess image from base64 string
        """
        try:
            print(f"Preprocessing image from base64...")  # Debugging print statement
            image = load_image_from_base64(image_base64)
            if image is None:
                print(f"Error loading image from base64.")  # Debugging print statement
            return image
        except (FileNotFoundError, Exception) as e:
            print(f"Error loading image: {e}")  # Debugging print statement
            return None

    def get_face_embedding(self, image_base64, is_jpg=False):
        """
        Get face embedding based on selected method (InsightFace or HuggingFace).
        """
        print(f"Getting face embedding for image using self.method...")  # Debugging print statement
        if is_jpg:
            print(f"Loading JPG image...")
            image = load_jpg_image(image_base64)
        else:
            print(f"Loading base64 image...")
            image = load_image_from_base64(image_base64)

        if image is None:
            return None

        if self.method == 'insightface':
            return get_face_embedding_insightface(image, self.model)
        elif self.method == 'huggingface':
            print(f"Extracting face embedding using HuggingFace model...")
            image = Image.open(io.BytesIO(base64.b64decode(image_base64)))
            inputs = self.feature_extractor(images=image, return_tensors="pt")
            with torch.no_grad():
                outputs = self.model(**inputs)
            print("Embedding retrieved from HuggingFace model.")  # Debugging print statement
            return outputs.pooler_output[0].numpy()

    def compare_faces(self, image1_base64, image2_base64, threshold=0.6, is_jpg=False):
        """
        Compare two face images and return the similarity score only.
        """
        print(f"Comparing faces: image1 vs image2...")  # Debugging print statement
        emb1 = self.get_face_embedding(image1_base64, is_jpg=is_jpg)
        emb2 = self.get_face_embedding(image2_base64, is_jpg=False)  # Assuming the second image is always base64
        
        if emb1 is None or emb2 is None:
            print("Error: One or both images failed to produce embeddings.")  # Debugging print statement
            return 0.0  # Return a default value (score 0) when no valid face embeddings are found

        if self.method == 'insightface':
            similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            return float(similarity)
            print(f"InsightFace similarity score: {similarity}")  # Debugging print statement
        elif self.method == 'huggingface':
            similarity = F.cosine_similarity(
                torch.tensor(emb1).unsqueeze(0),
                torch.tensor(emb2).unsqueeze(0)
            ).item()
            print(f"insightface : {similarity}") 
            time.sleep(2)
            
             # Debugging print statement

        return float(similarity)  # Directly return the similarity score
