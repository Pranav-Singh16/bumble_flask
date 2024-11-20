import os
import requests
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from transformers import AutoModel, AutoFeatureExtractor
from insightface import app
import sys
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
    with suppress_stdout_stderr():
        model = app.FaceAnalysis()
        model.prepare(ctx_id=0, det_size=(640, 640))
    return model

def load_image(image_path):
    """
    Load an image from a URL or local file path, convert it to a NumPy array.
    """
    if os.path.isfile(image_path):
        img = Image.open(image_path)
        img = np.array(img)
    elif image_path.startswith('http') or image_path.startswith('https'):
        response = requests.get(image_path)
        img = Image.open(io.BytesIO(response.content))
        img = np.array(img)
    else:
        print("Invalid image path")
        return None
    img = img[:, :, ::-1]  # Convert to RGB format
    return img

def get_face_embedding_insightface(image_path, model):
    try:
        image = load_image(image_path)
        if image is None:
            return None
        faces = model.get(image)
        if len(faces) == 0:
            print("No faces detected")
            return None
        largest_face = faces[0]
        return largest_face.embedding
    except Exception as e:
        print(f"Error in get_face_embedding_insightface: {e}")
        return None


class FaceComparer:
    def __init__(self, method='insightface'):
        """
        Initialize the face comparison model (InsightFace or HuggingFace).
        """
        self.method = method
        if method == 'insightface':
            self.model = init_model()
        elif method == 'huggingface':
            model_name = "microsoft/swin-base-patch4-window7-224-in22k"
            self.feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name)
            self.model.eval()
        else:
            raise ValueError("Method must be either 'insightface' or 'huggingface'")

    def preprocess_image(self, image_path):
        """
        Preprocess image
        """
        try:
            image = load_image(image_path)
            return image
        except (FileNotFoundError, Exception) as e:
            print(f"Error loading image: {e}")
            return None

    def get_face_embedding(self, image_path):
        """
        Get face embedding based on selected method (InsightFace or HuggingFace).
        """
        if self.method == 'insightface':
            return get_face_embedding_insightface(image_path, self.model)
        elif self.method == 'huggingface':
            image = Image.open(image_path)
            inputs = self.feature_extractor(images=image, return_tensors="pt")
            with torch.no_grad():
                outputs = self.model(**inputs)
            return outputs.pooler_output[0].numpy()

    def compare_faces(self, image1_path, image2_path, threshold=0.6):
        """
        Compare two face images and return similarity score.
        """
        emb1 = self.get_face_embedding(image1_path)
        emb2 = self.get_face_embedding(image2_path)
        if emb1 is None or emb2 is None:
            return {'match': False, 'score': 0.0, 'error': 'No face detected in one or both images'}

        if self.method == 'insightface':
            similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        elif self.method == 'huggingface':
            similarity = F.cosine_similarity(
                torch.tensor(emb1).unsqueeze(0), 
                torch.tensor(emb2).unsqueeze(0)
            ).item()

        if similarity > threshold:
            return {'match': True, 'score': float(similarity), 'error': None}
        else:
            return {'match': False, 'score': float(similarity), 'error': None}












# import os
# import time
# import sys
# import warnings
# import logging
# from playwright.sync_api import sync_playwright
# from bs4 import BeautifulSoup
# import requests
# from PIL import Image
# from io import BytesIO
# import numpy as np
# import io
# import torch
# import torch.nn.functional as F
# from transformers import AutoModel, AutoFeatureExtractor
# from insightface import app
# import matplotlib.pyplot as plt


# class suppress_stdout_stderr:
#     def __enter__(self):
#         self._original_stdout = sys.stdout
#         self._original_stderr = sys.stderr
#         sys.stdout = open(os.devnull, 'w')
#         sys.stderr = sys.stdout

#     def __exit__(self, exc_type, exc_val, exc_tb):
#         sys.stdout = self._original_stdout
#         sys.stderr = self._original_stderr


# def init_model():
#     """
#     Initialize the InsightFace face detection and embedding model.
#     """
#     with suppress_stdout_stderr():  # Suppress the model loading logs
#         model = app.FaceAnalysis()
#         model.prepare(ctx_id=0, det_size=(640, 640))  # ctx_id=0 for CPU, change to -1 for GPU
#     return model

# def load_image(image_path):
#     """
#     Load an image from a URL or a local file path, convert it to a NumPy array, and ensure it's in RGB format.
#     """
#     if os.path.isfile(image_path):
#         img = Image.open(image_path)
#         img = np.array(img)
#     elif image_path.startswith('http') or image_path.startswith('https'):
#         response = requests.get(image_path)
#         img = Image.open(io.BytesIO(response.content))
#         img = np.array(img)
#     else:
#         print("Invalid image path")
#         return None

#     img = img[:, :, ::-1]
    
#     return img



# def get_face_embedding_insightface(image_path, model):
#     try:
#         image = load_image(image_path)
        
#         if image is None:
#             return None

#         faces = model.get(image)
#         if len(faces) == 0:
#             print("No faces detected")
#             return None
#         if len(faces) > 1:
#             areas = [face.bbox[2] * face.bbox[3] for face in faces]  # Calculate face areas
#             largest_face = faces[np.argmax(areas)]  # Select the largest face
#         else:
#             largest_face = faces[0]
#         return largest_face.embedding
    
#     except Exception as e:
#         print(f"Error in get_face_embedding_insightface: {e}")
#         return None
    

# class FaceComparer:
#     def __init__(self, method='insightface'):
#         """
#         Initialize face comparison model
#         method: 'insightface' or 'huggingface'
#         """
#         self.method = method
        
#         if method == 'insightface':
#             # Initialize InsightFace
#             self.model = init_model()
#         elif method == 'huggingface':
#             # Initialize Hugging Face model
#             model_name = "microsoft/swin-base-patch4-window7-224-in22k"
#             self.feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
#             self.model = AutoModel.from_pretrained(model_name)
#             self.model.eval()
#         else:
#             raise ValueError("Method must be either 'insightface' or 'huggingface'")

#     def preprocess_image(self, image_path):
#         """
#         Load and preprocess image
#         """
#         try:
#             image = load_image(image_path)
#             return image
#         except (FileNotFoundError, Exception) as e:
#             print(f"Error loading image: {e}")
#             return None

#     def get_face_embedding(self, image_path):
#         """
#         Get face embedding based on the selected method (InsightFace or HuggingFace)
#         """
#         if self.method == 'insightface':
#             return get_face_embedding_insightface(image_path, self.model)
#         elif self.method == 'huggingface':
#             image = Image.open(image_path)
#             inputs = self.feature_extractor(images=image, return_tensors="pt")
#             with torch.no_grad():
#                 outputs = self.model(**inputs)
#             return outputs.pooler_output[0].numpy()

#     def compare_faces(self, image1_path, image2_path, threshold=0.6):
#         """
#         Compare two face images and return similarity score
#         """
#         # Preprocess images and get embeddings
#         emb1 = self.get_face_embedding(image1_path)
#         emb2 = self.get_face_embedding(image2_path)
        
#         if emb1 is None or emb2 is None:
#             return {
#                 'match': False,
#                 'score': 0.0,
#                 'error': 'No face detected in one or both images'
#             }
        
#         if self.method == 'insightface':
#             similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
#         elif self.method == 'huggingface':
#             similarity = F.cosine_similarity(
#                 torch.tensor(emb1).unsqueeze(0), 
#                 torch.tensor(emb2).unsqueeze(0)
#             ).item()

#         if similarity > threshold:
#             return {
#                 'match': True,
#                 'score': float(similarity),
#                 'error': None
#             }
#         else:
#             return {
#                 'match': False,
#                 'score': float(similarity),
#                 'error': None
#             }