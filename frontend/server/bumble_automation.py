import logging
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from config import Config
from PIL import Image
import io
import requests
from face_processor import FaceProcessor
from socketio import Server, WSGIApp

# Set up logging to capture detailed information
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class BumbleAutomation:
    def __init__(self, socket=None, socket_id=None, socket_port=None):
        self.socket = socket
        self.socket_id = socket_id
        self.socket_port = socket_port
        self.browser = None
        self.context = None
        self.page = None
        self.face_processor = FaceProcessor()  # Initialize FaceProcessor

    def emit_status(self, status, data=None):
        if self.socket:
            self.socket.emit('status_update', {'status': status, 'data': data})
            logging.debug(f"Emitting status: {status} via socket ID {self.socket_id} on port {self.socket_port}")

    def start_browser(self):
        """Initialize Playwright browser and page."""
        try:
            self.browser = self.p.chromium.launch(headless=False)  # Headful mode for debugging
            self.context = self.browser.new_context()
            self.page = self.context.new_page()
        except Exception as e:
            logging.error(f"Error starting browser: {e}")
            raise

    def login(self):
        """Login to Bumble"""
        try:
            self.page.goto("https://bumble.com/en-in/")
            self.emit_status('Navigating to Bumble')

            self.page.wait_for_selector('text=Sign In')
            self.page.get_by_label("Main").get_by_role("link", name="Sign In").click()

            with self.page.expect_popup() as page1_info:
                self.page.get_by_role("button", name="Continue with Facebook").click()
            page1 = page1_info.value

            page1.locator("#email").fill(Config.BUMBLE_EMAIL)
            page1.locator("#pass").fill(Config.BUMBLE_PASSWORD)
            page1.get_by_label("Log in").click()
            page1.get_by_label("Continue as Pranav").wait_for(state="visible", timeout=10000)
            page1.get_by_label("Continue as Pranav").click()
            time.sleep(5)

            return True
        except Exception as e:
            logging.error(f"Login failed: {e}")
            self.emit_status('Login failed', str(e))

    def scrape_images(self):
        """Scrape images from the page."""
        if not self.page or self.page.is_closed():
            logging.error("Page is closed or not initialized.")
            self.emit_status('Error scraping images', 'Page is closed or not initialized')
            return []

        time.sleep(5)
        html_content = self.page.content()
        soup = BeautifulSoup(html_content, 'html.parser')
        image_tags = soup.find_all('img', class_='media-box__picture-image')  
        image_sources = [img['src'] for img in image_tags]

        for j in range(min(2, len(image_sources))):  # Process up to 2 images
            try:
                image_url = image_sources[j]
                bumble_image_url = 'https:' + image_url if image_url.startswith('//') else image_url
                
                logging.debug("Constructed URL: %s", bumble_image_url)
                self.emit_status('Image URL Sent', {'bumbleImage': bumble_image_url})
                
                response = requests.get(bumble_image_url)
                if response.status_code == 200:
                    bumble_image = Image.open(io.BytesIO(response.content))
                    logging.debug("Image fetched successfully.")
                else:
                    logging.error("Failed to fetch image, HTTP status code: %d", response.status_code)

            except Exception as e:
                logging.error("Error fetching image %d: %s", j, e)

    def close(self):
        """Close the browser and context."""
        if self.context:
            self.context.close()
            logging.debug("Browser context closed.")
        if self.browser:
            self.browser.close()
            logging.debug("Browser closed.")

if __name__ == '__main__':
    # Create the socket server
    sio = Server(cors_allowed_origins='*')
    app = WSGIApp(sio)

    @sio.event
    def connect(sid):
        print("Client connected")
        # Store the socket ID and port for this connection
        automation.socket_id = sid
        automation.socket_port = sio.eio.server.engine.http_server.port
        automation.emit_status('Client connected', {'socket_id': sid})

    # Create instance of BumbleAutomation
    automation = BumbleAutomation(socket=sio)

    with sync_playwright() as p:
        automation.p = p
        automation.start_browser()
        login_success = automation.login()
        
        if login_success:
            automation.scrape_images()
        else:
            print("Login failed. Aborting.")
        
        automation.close()

    print('End of class')















# import logging
# import time
# from playwright.sync_api import sync_playwright
# from bs4 import BeautifulSoup
# from config import Config
# from PIL import Image
# import io
# import requests
# from face_processor import FaceProcessor

# # Set up logging to capture detailed information
# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# # print('Welcome 1')

# class BumbleAutomation:
#     def __init__(self, socket=None):
#         # print("Initializing BumbleAutomation...")
#         # logging.debug("Initializing BumbleAutomation...")
#         self.socket = socket
#         self.browser = None
#         self.context = None
#         self.page = None
#         self.face_processor = FaceProcessor()  # Initialize FaceProcessor

#     def emit_status(self, status, data=None):
#         if self.socket:
#             self.socket.emit('status_update', {'status': status, 'data': data})
#         print(f"Emitting status: {status}")
#         logging.debug(f"Emitting status: {status}")

#     def start_browser(self):
#         """Initialize Playwright browser and page."""
#         try:
#             # logging.debug("Starting browser...")
#             self.browser = self.p.chromium.launch(headless=False)  # Headful mode for debugging
#             self.context = self.browser.new_context()
#             self.page = self.context.new_page()
#             # print("Browser started.")
#         except Exception as e:
#             # logging.error(f"Error starting browser: {e}")
#             raise

#     def login(self):
#         """Login to Bumble"""
#         try:
#             # print("Starting login process...")
#             # logging.debug("Starting login process...")

#             # Navigate to Bumble
#             # logging.debug("Navigating to Bumble...")
#             self.page.goto("https://bumble.com/en-in/")
#             self.emit_status('Navigating to Bumble')

#             # Wait for the 'Sign In' button to be clickable and click it
#             # logging.debug("Waiting for 'Sign In' button to be clickable...")
#             self.page.wait_for_selector('text=Sign In')
#             self.page.get_by_label("Main").get_by_role("link", name="Sign In").click()

#             with self.page.expect_popup() as page1_info:
#                 # logging.debug("Clicking 'Continue with Facebook' button...")
#                 self.page.get_by_role("button", name="Continue with Facebook").click()
#             page1 = page1_info.value

#             # Fill Facebook credentials
#             # logging.debug("Filling Facebook login credentials...")
#             page1.locator("#email").fill(Config.BUMBLE_EMAIL)
#             page1.locator("#pass").fill(Config.BUMBLE_PASSWORD)
#             page1.get_by_label("Log in").click()
#             page1.get_by_label("Continue as Pranav").wait_for(state="visible", timeout=10000)
#             page1.get_by_label("Continue as Pranav").click()
#             time.sleep(5)
#             # logging.debug("login success")

#             # print('going to take html content')
#             # html_content = self.page.content()
#             # print('html content taken and passing to bs4')
#             # soup = BeautifulSoup(html_content, 'html.parser')
#             # print('Page content:')
#             # print(soup)

#             return True
#         except Exception as e:
#             print(f"Login failed: {e}")
#             logging.error(f"Login failed: {e}")
#             self.emit_status('Login failed', str(e))
#             # return False

#     def scrape_images(self):
#         """Scrape images from the page."""
#         # print('welcome to scrape_images')

#         # Ensure the page is still active
#         if not self.page or self.page.is_closed():
#             # print("Error: Page is closed or not initialized.")
#             logging.error("Page is closed or not initialized.")
#             self.emit_status('Error scraping images', 'Page is closed or not initialized')
#             return []

#         # Wait for the content to load (optional if needed)
#         time.sleep(5)
#         # Now proceed with scraping
# # 
#         html_content = self.page.content()
#         soup = BeautifulSoup(html_content, 'html.parser')

#         image_tags = soup.find_all('img', class_='media-box__picture-image')  
#         image_sources = [img['src'] for img in image_tags]

#         for j in range(2):  # Process first 2 images
#             try:
#                 logging.debug("Processing image %d", j)
                
#                 # Ensure the URL is correctly constructed
#                 image_url = image_sources[j]
#                 if image_url.startswith('//'):
#                     bumble_image_url = 'https:' + image_url
#                 else:
#                     bumble_image_url = image_url
                
#                 # Log the constructed URL
#                 logging.debug("Constructed URL: %s", bumble_image_url)
#                 self.emit_status('Image URL Sent', {'bumbleImage': bumble_image_url})
                
#                 # Make the GET request
#                 response = requests.get(bumble_image_url)
#                 if response.status_code == 200:
#                     bumble_image = Image.open(io.BytesIO(response.content))
#                     logging.debug("Image fetched successfully.")
#                 else:
#                     logging.error("Failed to fetch image, HTTP status code: %d", response.status_code)

#             except Exception as e:
#                 logging.error("Error fetching image %d: %s", j, e)


#         return image_sources

#     # def close(self):
#     #     """Close the browser and context."""
#     #     if self.context:
#     #         self.context.close()
#     #         logging.debug("Browser context closed.")
#     #     if self.browser:
#     #         self.browser.close()
#     #         logging.debug("Browser closed.")
#     #     print("Browser context and page closed.")
#     #     logging.debug("Browser context and page closed.")

# if __name__ == '__main__':
#     # Create instance of BumbleAutomation and start login
#     automation = BumbleAutomation()
#     # print("Starting browser and login process...")

#     # Start browser first
#     with sync_playwright() as p:
#         automation.p = p  # Store Playwright instance to use for the browser
#         automation.start_browser()  # Start the browser

#         login_success = automation.login()  # Perform login

#         if login_success:
#             # print("Login successful!")
#             automation.scrape_images()  # Call this if login was successful
#         else:
#             print("Login failed. Aborting.")

#         # Close browser after operations
#         automation.close()

#     print('End of class')




















# import logging
# import time
# from playwright.sync_api import sync_playwright
# from bs4 import BeautifulSoup
# from config import Config
# from PIL import Image
# import io
# import os
# import requests
# from face_processor import FaceProcessor
# # logging.debug(Config.BUMBLE_EMAIL)
# # logging.debug(Config.BUMBLE_PASSWORD)

# # Set up logging to capture detailed information
# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# print('welcome 1')

# class BumbleAutomation:
#     def __init__(self, socket=None):
#         print("Initializing BumbleAutomation...")
#         logging.debug("Initializing BumbleAutomation...")
#         self.socket = socket
#         self.browser = None
#         self.context = None
#         self.page = None

#     def emit_status(self, status, data=None):
#         if self.socket:
#             self.socket.emit('status_update', {'status': status, 'data': data})
#         print(f"Emitting status: {status}")
#         logging.debug(f"Emitting status: {status}")

#     def login(self):
#         try:
#             print("Starting login process...")
#             logging.debug("Starting login process...")

#             # Initialize Playwright
#             with sync_playwright() as p:
#                 logging.debug("Launching browser...")
#                 self.browser = p.chromium.launch(headless=False)
#                 logging.debug("Browser launched successfully.")

#                 self.context = self.browser.new_context()
#                 self.page = self.context.new_page()

#                 # Navigate to Bumble
#                 logging.debug("Navigating to Bumble...")
#                 self.page.goto("https://bumble.com/en-in/")
#                 self.emit_status('Navigating to Bumble')

#                 # Wait for the Sign In button to be clickable and click it
#                 logging.debug("Waiting for 'Sign In' button to be clickable...")
#                 self.page.wait_for_selector('text=Sign In')
#                 self.page.get_by_label("Main").get_by_role("link", name="Sign In").click()

#                 with self.page.expect_popup() as page1_info:
#                     logging.debug("Clicking 'Continue with Facebook' button...")
#                     self.page.get_by_role("button", name="Continue with Facebook").click()
#                 page1 = page1_info.value

#                 # Fill Facebook credentials
#                 logging.debug("Filling Facebook login credentials...")
#                 logging.debug(Config.BUMBLE_EMAIL)
#                 logging.debug(Config.BUMBLE_PASSWORD)
#                 page1.locator("#email").fill(Config.BUMBLE_EMAIL)
#                 page1.locator("#pass").fill(Config.BUMBLE_PASSWORD)
#                 # page1.locator("#pass").press("Enter")
#                 page1.get_by_label("Log in").click()
#                 page1.get_by_label("Continue as Pranav").wait_for(state="visible", timeout=10000)
#                 page1.get_by_label("Continue as Pranav").click()
#                 time.sleep(5)

#                 # Ensure that login completes successfully
#                 # logging.debug("Waiting for successful login...")
#                 # self.page.wait_for_navigation(wait_until="load")  # Wait until page loads after login
#                 time.sleep(10)                    

#                 print("Logged in successfully.")
#                 logging.debug("Logged in successfully.")
#                 self.emit_status('Logged in successfully')
#                 return True
#         except Exception as e:
#             print(f"Login failed: {e}")
#             logging.error(f"Login failed: {e}")
#             self.emit_status('Login failed', str(e))
#             return False

#     def scrape_images(self):
#         images = []
#         try:
#             print("Scraping images from the page...")
#             logging.debug("Scraping images from the page...")
#             html_content = self.page.content()  # Get page content
#             soup = BeautifulSoup(html_content, 'html.parser')


#             image_tags = soup.find_all('img', class_='media-box__picture-image')  
#             image_sources = [img['src'] for img in image_tags]

#             # Find image tags
#             # image_tags = soup.find_all('img', class_='media-box__picture-image')
#             # images = [
#             #     img['src'] if img['src'].startswith('https:') else f"https:{img['src']}"
#             #     for img in image_tags
#             # ]
#             print("Images scraped successfully.")
#             print(images)
#             for j in range(2):

#                 try:
#                     if image_sources[j].startswith('https:'):
#                         bumble_image_url = image_sources[j]
#                     else:
#                         bumble_image_url = 'https:' + image_sources[j]
#                     bumble_image = Image.open(io.BytesIO(requests.get(bumble_image_url).content))
#                     # face_comparer = FaceComparer(method='insightface')
#                     # result = face_comparer.compare_faces(user_image_path, bumble_image_url)

#                     here i need to call face_processor
#                     time.sleep(1)
#                 except:
#                     continue
            
#             # print(f"Scraped {len(images)} images.")
#             # logging.debug(f"Scraped {len(images)} images.")
            
#         except Exception as e:
#             print(f"Error scraping images: {e}")
#             logging.error(f"Error scraping images: {e}")
#             self.emit_status('Error scraping images', str(e))

#         return images

#     def pass_profile(self):
#         try:
#             print("Passing profile...")
#             logging.debug("Passing profile...")
#             self.page.get_by_label("Pass").click()
#             time.sleep(2)  # Sleep to simulate user delay, adjust as needed
#             logging.debug("Profile passed successfully.")
#         except Exception as e:
#             print(f"Error passing profile: {e}")
#             logging.error(f"Error passing profile: {e}")

#     def close(self):
#         if self.context:
#             self.context.close()
#             logging.debug("Browser context closed.")
#         if self.browser:
#             self.browser.close()
#             logging.debug("Browser closed.")
#         print("Browser context and page closed.")
#         logging.debug("Browser context and page closed.")


# if __name__ == '__main__':
#     # Create instance of BumbleAutomation and start login
#     automation = BumbleAutomation()
#     print("Starting login process...")
#     login_success = automation.login()

#     if login_success:
#         automation.scrape_images()
#         automation.pass_profile()

#     # Close browser after operations
#     automation.close()

#     print('End of class')













# import logging
# import time
# from playwright.sync_api import sync_playwright
# from bs4 import BeautifulSoup
# from config import Config

# # Set up logging
# logging.basicConfig(level=logging.DEBUG)

# class BumbleAutomation:
#     def __init__(self, socket=None):
#         self.socket = socket
#         self.browser = None
#         self.context = None
#         self.page = None

#     def emit_status(self, status, data=None):
#         if self.socket:
#             self.socket.emit('status_update', {'status': status, 'data': data})

#     def login(self):
#         try:
#             logging.debug("Starting login process...")
#             with sync_playwright() as p:
#                 self.browser = p.chromium.launch(headless=True)
#                 self.context = self.browser.new_context()
#                 self.page = self.context.new_page()
                
#                 logging.debug("Navigating to Bumble...")
#                 self.page.goto("https://bumble.com/")
#                 self.emit_status('Navigating to Bumble')
                
#                 logging.debug("Clicking Sign In...")
#                 self.page.get_by_label("Main").get_by_role("link", name="Sign In").click()
#                 with self.page.expect_popup() as page1_info:
#                     self.page.get_by_role("button", name="Continue with Facebook").click()
#                 page1 = page1_info.value
                
#                 logging.debug("Filling Facebook login credentials...")
#                 page1.locator("#email").fill(Config.BUMBLE_EMAIL)
#                 page1.locator("#pass").fill(Config.BUMBLE_PASSWORD)
#                 page1.locator("#pass").press("Enter")
                
#                 logging.debug("Logged in successfully")
#                 self.emit_status('Logged in successfully')
#                 return True
#         except Exception as e:
#             logging.error(f"Login failed: {e}")
#             self.emit_status('Login failed', str(e))
#             return False

#     def scrape_images(self):
#         images = []
#         try:
#             logging.debug("Scraping images from the page...")
#             html_content = self.page.content()
#             soup = BeautifulSoup(html_content, 'html.parser')
            
#             image_tags = soup.find_all('img', class_='media-box__picture-image')
#             images = [
#                 img['src'] if img['src'].startswith('https:') else f"https:{img['src']}"
#                 for img in image_tags
#             ]
#             logging.debug(f"Scraped {len(images)} images")
            
#         except Exception as e:
#             logging.error(f"Error scraping images: {e}")
#             self.emit_status('Error scraping images', str(e))
            
#         return images
    
#     def pass_profile(self):
#         try:
#             logging.debug("Passing profile...")
#             self.page.get_by_label("Pass").click()
#             time.sleep(2)
#         except Exception as e:
#             logging.error(f"Error passing profile: {e}")

#     def close(self):
#         if self.context:
#             self.context.close()
#         if self.browser:
#             self.browser.close()
#         logging.debug("Browser context and page closed.")









# import logging
# from playwright.sync_api import sync_playwright
# from bs4 import BeautifulSoup
# import time
# from config import Config
# print("This is a print statement from Python")
# # Set up logging to display messages in the console
# logging.basicConfig(level=logging.DEBUG)

# class BumbleAutomation:
#     def __init__(self, socket=None):
#         self.socket = socket
#         self.browser = None
#         self.context = None
#         self.page = None
    
#     def emit_status(self, status, data=None):
#         if self.socket:
#             self.socket.emit('status_update', {'status': status, 'data': data})
    
#     def login(self):
#         try:
#             logging.debug("Starting login process...")
#             with sync_playwright() as p:
#                 self.browser = p.chromium.launch(headless=True)
#                 self.context = self.browser.new_context()
#                 self.page = self.context.new_page()
                
#                 logging.debug("Navigating to Bumble...")
#                 self.page.goto("https://bumble.com/")
#                 self.emit_status('Navigating to Bumble')
                
#                 logging.debug("Clicking Sign In...")
#                 self.page.get_by_label("Main").get_by_role("link", name="Sign In").click()
#                 with self.page.expect_popup() as page1_info:
#                     self.page.get_by_role("button", name="Continue with Facebook").click()
#                 page1 = page1_info.value
                
#                 logging.debug("Filling Facebook login credentials...")
#                 page1.locator("#email").fill(Config.BUMBLE_EMAIL)
#                 page1.locator("#pass").fill(Config.BUMBLE_PASSWORD)
#                 page1.locator("#pass").press("Enter")
                
#                 self.emit_status('Logged in successfully')
#                 logging.debug("Logged in successfully")
#                 return True
                
#         except Exception as e:
#             logging.error(f"Login failed: {e}")
#             self.emit_status('Login failed', str(e))
#             return False
    
#     def scrape_images(self):
#         images = []
#         try:
#             logging.debug("Scraping images from the page...")
#             html_content = self.page.content()
#             soup = BeautifulSoup(html_content, 'html.parser')
            
#             image_tags = soup.find_all('img', class_='media-box__picture-image')
#             images = [
#                 img['src'] if img['src'].startswith('https:') else f"https:{img['src']}"
#                 for img in image_tags
#             ]
#             logging.debug(f"Scraped {len(images)} images")
            
#         except Exception as e:
#             logging.error(f"Error scraping images: {e}")
#             self.emit_status('Error scraping images', str(e))
            
#         return images
    
#     def pass_profile(self):
#         try:
#             logging.debug("Passing profile...")
#             self.page.get_by_label("Pass").click()
#             time.sleep(2)
#         except Exception as e:
#             logging.error(f"Error passing profile: {e}")
            
#     def close(self):
#         if self.context:
#             self.context.close()
#         if self.browser:
#             self.browser.close()
#         logging.debug("Browser context and page closed.")
