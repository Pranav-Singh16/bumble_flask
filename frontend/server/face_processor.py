import os
import warnings
import logging
from insightface import app
import numpy as np
from PIL import Image
import io
import requests

# Set up logging
logging.basicConfig(level=logging.DEBUG)

warnings.filterwarnings("ignore", category=UserWarning)

class FaceProcessor:
    def __init__(self):
        logging.debug("Initializing FaceProcessor...")
        self.model = self._init_model()

    def _init_model(self):
        logging.debug("Initializing face detection model...")
        model = app.FaceAnalysis()
        model.prepare(ctx_id=0, det_size=(640, 640))
        logging.debug("Face detection model initialized.")
        return model

    def load_image(self, image_data):
        logging.debug("Loading image...")
        try:
            if isinstance(image_data, str):
                if os.path.isfile(image_data):
                    img = Image.open(image_data)
                elif image_data.startswith(('http', 'https')):
                    response = requests.get(image_data)
                    img = Image.open(io.BytesIO(response.content))
            else:
                img = Image.open(io.BytesIO(image_data))

            img = np.array(img)
            img = img[:, :, ::-1]  # Convert to BGR
            logging.debug("Image loaded successfully.")
            return img
        except Exception as e:
            logging.error(f"Error loading image: {e}")
            return None

    def get_face_embedding(self, image_data):
        logging.debug("Extracting face embedding...")
        try:
            image = self.load_image(image_data)
            if image is None:
                logging.error("Failed to load image.")
                return None

            faces = self.model.get(image)

            if not faces:
                logging.warning("No faces detected in the image.")
                return None
            
            if len(faces) > 1:
                # Get largest face
                areas = [face.bbox[2] * face.bbox[3] for face in faces]
                largest_face = faces[np.argmax(areas)]
            else:
                largest_face = faces[0]

            logging.debug("Face embedding extracted successfully.")
            return largest_face.embedding
        except Exception as e:
            logging.error(f"Error in get_face_embedding: {e}")
            return None

    def compare_faces(self, image1_data, image2_data, threshold=0.6):
        logging.debug("Comparing faces...")
        try:
            emb1 = self.get_face_embedding(image1_data)
            emb2 = self.get_face_embedding(image2_data)

            if emb1 is None or emb2 is None:
                logging.error("Face embedding comparison failed.")
                return {
                    'match': False,
                    'score': 0.0,
                    'error': 'No face detected in one or both images'
                }

            similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))

            match = similarity > threshold
            logging.debug(f"Comparison result: {'Match' if match else 'No match'}, Similarity score: {similarity}")

            return {
                'match': match,
                'score': float(similarity),
                'error': None
            }
        except Exception as e:
            logging.error(f"Error in compare_faces: {e}")
            return {
                'match': False,
                'score': 0.0,
                'error': str(e)
            }




# import os
# import warnings
# import logging
# from insightface import app
# import numpy as np
# from PIL import Image
# import io
# import requests

# # Set up logging to display messages in the console
# logging.basicConfig(level=logging.DEBUG)

# warnings.filterwarnings("ignore", category=UserWarning)

# class FaceProcessor:
#     def __init__(self):
#         logging.debug("Initializing FaceProcessor...")
#         self.model = self._init_model()
    
#     def _init_model(self):
#         logging.debug("Initializing face detection model...")
#         model = app.FaceAnalysis()
#         model.prepare(ctx_id=0, det_size=(640, 640))
#         logging.debug("Face detection model initialized.")
#         return model
    
#     def load_image(self, image_data):
#         logging.debug("Loading image...")
#         if isinstance(image_data, str):
#             if os.path.isfile(image_data):
#                 img = Image.open(image_data)
#             elif image_data.startswith(('http', 'https')):
#                 response = requests.get(image_data)
#                 img = Image.open(io.BytesIO(response.content))
#         else:
#             img = Image.open(io.BytesIO(image_data))
        
#         img = np.array(img)
#         img = img[:, :, ::-1]  # Convert to BGR
#         logging.debug("Image loaded successfully.")
#         return img
    
#     def get_face_embedding(self, image_data):
#         try:
#             logging.debug("Extracting face embedding...")
#             image = self.load_image(image_data)
#             faces = self.model.get(image)
            
#             if not faces:
#                 logging.warning("No faces detected in the image.")
#                 return None
                
#             if len(faces) > 1:
#                 # Get largest face
#                 areas = [face.bbox[2] * face.bbox[3] for face in faces]
#                 largest_face = faces[np.argmax(areas)]
#             else:
#                 largest_face = faces[0]
            
#             logging.debug("Face embedding extracted successfully.")
#             return largest_face.embedding
            
#         except Exception as e:
#             logging.error(f"Error in get_face_embedding: {e}")
#             return None
    
#     def compare_faces(self, image1_data, image2_data, threshold=0.6):
#         logging.debug("Comparing faces...")
#         emb1 = self.get_face_embedding(image1_data)
#         emb2 = self.get_face_embedding(image2_data)
        
#         if emb1 is None or emb2 is None:
#             logging.error("Face embedding comparison failed.")
#             return {
#                 'match': False,
#                 'score': 0.0,
#                 'error': 'No face detected in one or both images'
#             }
        
#         similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        
#         match = similarity > threshold
#         logging.debug(f"Comparison result: {'Match' if match else 'No match'}, Similarity score: {similarity}")
        
#         return {
#             'match': match,
#             'score': float(similarity),
#             'error': None
#         }
