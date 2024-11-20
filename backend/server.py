from quart import Quart, jsonify
from quart_cors import cors
import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

app = Quart(__name__)

# Enable CORS for all routes (development mode: allow all origins)
app = cors(app, allow_origin="*")

scraped_images = []  # Global variable to hold the scraped images

# Scrape Bumble for profile images (to be called only once for each cycle)
async def scrape_bumble_async(page):
    print('Scraping Bumble for images...')
    
    # Go directly to the Bumble get-started page
    await page.goto("https://us1.bumble.com/get-started", wait_until="load")
    print("Navigated to Bumble get-started page.")

    # Wait for the "Continue with Facebook" button to be visible
    try:
        facebook_button = page.locator("button:has-text('Continue with Facebook')")
        await facebook_button.wait_for(state="visible", timeout=10000)
        print('Clicking Continue with Facebook button...')
        await facebook_button.click()
    except Exception as e:
        print(f"Error clicking 'Continue with Facebook': {e}")
        return []

    # Wait for the popup manually
    try:
        print("Waiting for the popup to appear...")
        popup = await page.wait_for_event("popup", timeout=15000)  # Wait for a popup to appear
        print("Popup appeared.")
    except Exception as e:
        print(f"Error during popup detection: {e}")
        return []

    # Now interact with the popup to fill in login details
    try:
        print('Filling in credentials...')
        await popup.locator("#email").fill("s1973sp@gmail.com")  # Replace with your email
        await popup.locator("#pass").fill("DaRkLaNd@16")  # Replace with your password
        await popup.locator("#pass").press("Enter")
        print('Credentials submitted.')
    except Exception as e:
        print(f"Error filling in credentials: {e}")
        return []

    # Wait for the "Continue as" button after login
    try:
        print('Waiting for the user to continue...')
        
        # Use aria-label to find the button more reliably
        continue_as_button = popup.locator("div[aria-label='Continue as Pranav'][role='button']")
        
        # Wait for the button with a longer timeout and ensure it is in the viewport
        await continue_as_button.wait_for(state="visible", timeout=20000)  # Increase timeout
        await continue_as_button.scroll_into_view_if_needed()  # Ensure it's in view
        print("Clicking 'Continue as' button...")
        await continue_as_button.click()
        print('Logged in and continuing as user.')
    except Exception as e:
        print(f"Error during login process: {e}")
        return []

    # Scraping profile image URLs after login
    try:
        await asyncio.sleep(10)  # Wait for the page to load fully
        html_content = await page.content()
        soup = BeautifulSoup(html_content, 'html.parser')
        image_tags = soup.find_all('img', class_='media-box__picture-image')
        image_sources = [img['src'] for img in image_tags]

        print(f"Scraped {len(image_sources)} images.")
        return image_sources[:2]  # Return the first two image sources
    except Exception as e:
        print(f"Error during scraping images: {e}")
        return []

    # Wait for the "Continue as" button after login
    try:
        print('Waiting for the user to continue...')
        
        # Ensure the element is visible, clickable, and scrolls into view if necessary
        continue_as_button = popup.locator("label:has-text('Continue as Pranav')")
        await continue_as_button.wait_for(state="visible", timeout=30000)
        await continue_as_button.scroll_into_view_if_needed()  # Ensure it's in view
        await continue_as_button.click()
        print('Logged in and continuing as user.')
    except Exception as e:
        print(f"Error during login process: {e}")
        return []

    # Scraping profile image URLs after login
    try:
        await asyncio.sleep(10)  # Wait for the page to load fully
        html_content = await page.content()
        soup = BeautifulSoup(html_content, 'html.parser')
        image_tags = soup.find_all('img', class_='media-box__picture-image')
        image_sources = [img['src'] for img in image_tags]

        print(f"Scraped {len(image_sources)} images.")
        return image_sources[:2]  # Return the first two image sources
    except Exception as e:
        print(f"Error during scraping images: {e}")
        return []

# Start Playwright process
async def start_playwright_scraping():
    print('Starting Playwright scraping process...')
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        print('Browser launched.')
        context = await browser.new_context()
        page = await context.new_page()
        print('New page created in browser.')

        images = await scrape_bumble_async(page)
        
        await browser.close()
        print('Browser closed.')

        return images  # Return the scraped image URLs

# Route to start the scraping process (must be async)
@app.route('/scrape_images', methods=['POST'])
async def scrape_images():
    global scraped_images  # Reference the global scraped_images
    
    print('Received request to scrape images.')
    
    # Start the scraping process asynchronously
    images = await start_playwright_scraping()
    
    # Store scraped images globally
    scraped_images = images
    print(f"Scraped Images: {scraped_images}")
    
    return jsonify({"message": "Scraping started", "images": scraped_images}), 200

if __name__ == '__main__':
    print('Starting Quart application...')
    app.run(debug=True, port=5001)




# from quart import Quart, jsonify
# from quart_cors import cors
# import asyncio
# from playwright.async_api import async_playwright
# from bs4 import BeautifulSoup

# app = Quart(__name__)

# # Enable CORS for all routes (development mode: allow all origins)
# app = cors(app, allow_origin="*")

# scraped_images = []  # Global variable to hold the scraped images

# # Scrape Bumble for profile images (to be called only once for each cycle)
# async def scrape_bumble_async(page):
#     print('Scraping Bumble for images...')
    
#     # Go directly to the Bumble get-started page
#     await page.goto("https://us1.bumble.com/get-started")
    
#     # Wait for the "Continue with Facebook" button to be visible
#     try:
#         # Wait for the "Continue with Facebook" button to appear on the page
#         facebook_button = page.locator("button:has-text('Continue with Facebook')")
#         await facebook_button.wait_for(state="visible", timeout=10000)
#         print('Clicking Continue with Facebook button...')
#         await facebook_button.click()
#     except Exception as e:
#         print(f"Error clicking 'Continue with Facebook': {e}")
#         return []

#     # Wait for the popup manually
#     try:
#         print("Waiting for the popup to appear...")
#         popup = await page.wait_for_event("popup", timeout=15000)  # Wait for a popup to appear
#         print("Popup appeared.")
#     except Exception as e:
#         print(f"Error during popup detection: {e}")
#         return []

#     # Now interact with the popup to fill in login details
#     try:
#         print('Filling in credentials...')
#         await popup.locator("#email").fill("s1973sp@gmail.com")  # Replace with your email
#         await popup.locator("#pass").fill("DaRkLaNd@16")  # Replace with your password
#         await popup.locator("#pass").press("Enter")
#         print('Credentials submitted.')
#     except Exception as e:
#         print(f"Error filling in credentials: {e}")
#         return []

#     # Wait for the "Continue as" button after login
#     try:
#         print('Waiting for the user to continue...')
#         await popup.locator("label:has-text('Continue as')").wait_for(state="visible", timeout=15000)
#         await popup.locator("label:has-text('Continue as')").click()
#         print('Logged in and continuing as user.')
#     except Exception as e:
#         print(f"Error during login process: {e}")
#         return []

#     # Scraping profile image URLs after login
#     try:
#         await asyncio.sleep(10)  # Wait for the page to load fully
#         html_content = await page.content()
#         soup = BeautifulSoup(html_content, 'html.parser')
#         image_tags = soup.find_all('img', class_='media-box__picture-image')
#         image_sources = [img['src'] for img in image_tags]

#         print(f"Scraped {len(image_sources)} images.")
#         return image_sources[:2]  # Return the first two image sources
#     except Exception as e:
#         print(f"Error during scraping images: {e}")
#         return []

# # Start Playwright process
# async def start_playwright_scraping():
#     print('Starting Playwright scraping process...')
#     async with async_playwright() as p:
#         browser = await p.chromium.launch(headless=False)
#         print('Browser launched.')
#         context = await browser.new_context()
#         page = await context.new_page()
#         print('New page created in browser.')

#         images = await scrape_bumble_async(page)
        
#         await browser.close()
#         print('Browser closed.')

#         return images  # Return the scraped image URLs

# # Route to start the scraping process (must be async)
# @app.route('/scrape_images', methods=['POST'])
# async def scrape_images():
#     global scraped_images  # Reference the global scraped_images
    
#     print('Received request to scrape images.')
    
#     # Start the scraping process asynchronously
#     images = await start_playwright_scraping()
    
#     # Store scraped images globally
#     scraped_images = images
#     print(f"Scraped Images: {scraped_images}")
    
#     return jsonify({"message": "Scraping started", "images": scraped_images}), 200

# if __name__ == '__main__':
#     print('Starting Quart application...')
#     app.run(debug=True, port=5001)



# from flask import Flask, jsonify
# from flask_cors import CORS
# import asyncio
# from playwright.async_api import async_playwright
# from bs4 import BeautifulSoup

# app = Flask(__name__)

# # Enable CORS for all routes (development mode: allow all origins)
# CORS(app, resources={r"/*": {"origins": "*"}})

# scraped_images = []  # Global variable to hold the scraped images

# # Scrape Bumble for profile images (to be called only once for each cycle)
# async def scrape_bumble_async(page):
#     print('Scraping Bumble for images...')
#     await page.goto("https://bumble.com/en-in/")
        
#     # Wait for the "Sign In" button to be visible
#     sign_in_button = page.locator("text=Sign In")
#     await sign_in_button.wait_for(state="visible", timeout=10000)  # Wait for button to be visible
#     await sign_in_button.click()

#     with page.expect_popup() as page1_info:
#         print('Clicking Continue with Facebook button...')
#         await page.locator("button:has-text('Continue with Facebook')").click()
#     page1 = page1_info.value
#     print('Popup for login appeared.')

#     print('Filling in credentials...')
#     await page1.locator("#email").fill("your_email")
#     await page1.locator("#pass").fill("your_password")
#     await page1.locator("#pass").press("Enter")
#     print('Credentials submitted.')

#     # Wait for login to complete
#     print('Waiting for the user to continue...')
#     await page1.locator("label:has-text('Continue as')").wait_for(state="visible", timeout=15000)
#     await page1.locator("label:has-text('Continue as')").click()
#     print('Logged in and continuing as user.')

#     # Scraping profile image URLs
#     await asyncio.sleep(10)  # Wait for the page to load fully
#     html_content = await page.content()
#     soup = BeautifulSoup(html_content, 'html.parser')
#     image_tags = soup.find_all('img', class_='media-box__picture-image')
#     image_sources = [img['src'] for img in image_tags]

#     print(f"Scraped {len(image_sources)} images.")
#     return image_sources[:2]  # Return the first two image sources

# # Start Playwright process
# async def start_playwright_scraping():
#     print('Starting Playwright scraping process...')
#     async with async_playwright() as p:
#         browser = await p.chromium.launch(headless=False)
#         print('Browser launched.')
#         context = await browser.new_context()
#         page = await context.new_page()
#         print('New page created in browser.')

#         images = await scrape_bumble_async(page)
        
#         await browser.close()
#         print('Browser closed.')

#         return images  # Return the scraped image URLs

# # Route to start the scraping process (must be async)
# @app.route('/scrape_images', methods=['POST'])
# async def scrape_images():
#     global scraped_images  # Reference the global scraped_images
    
#     print('Received request to scrape images.')
    
#     # Start the scraping process asynchronously
#     images = await start_playwright_scraping()
    
#     # Store scraped images globally
#     scraped_images = images
#     print(f"Scraped Images: {scraped_images}")
    
#     return jsonify({"message": "Scraping started", "images": scraped_images}), 200

# if __name__ == '__main__':
#     print('Starting Flask application...')
#     app.run(debug=True, port=5001)








# from flask import Flask, jsonify
# from flask_cors import CORS  # Import CORS
# import asyncio
# from playwright.async_api import async_playwright
# from bs4 import BeautifulSoup

# app = Flask(__name__)

# # Enable CORS for all routes (development mode: allow all origins)
# CORS(app, resources={r"/*": {"origins": "*"}})

# scraped_images = []  # Global variable to hold the scraped images

# # Scrape Bumble for profile images (to be called only once for each cycle)
# async def scrape_bumble_async(page):
#     print('Scraping Bumble for images...')
#     await page.goto("https://bumble.com/en-in/")
#     print('Navigated to Bumble.')

#     print('Clicking Sign In button...')
#     await page.locator("label:has-text('Main')").locator("a:has-text('Sign In')").click()
#     print('Clicked Sign In.')

#     with page.expect_popup() as page1_info:
#         print('Clicking Continue with Facebook button...')
#         await page.locator("button:has-text('Continue with Facebook')").click()
#     page1 = page1_info.value
#     print('Popup for login appeared.')

#     print('Filling in credentials...')
#     await page1.locator("#email").fill("your_email")
#     await page1.locator("#pass").fill("your_password")
#     await page1.locator("#pass").press("Enter")
#     print('Credentials submitted.')

#     # Wait for login to complete
#     print('Waiting for the user to continue...')
#     await page1.locator("label:has-text('Continue as')").wait_for(state="visible", timeout=15000)
#     await page1.locator("label:has-text('Continue as')").click()
#     print('Logged in and continuing as user.')

#     # Scraping profile image URLs
#     await asyncio.sleep(10)  # Wait for the page to load fully
#     html_content = await page.content()
#     soup = BeautifulSoup(html_content, 'html.parser')
#     image_tags = soup.find_all('img', class_='media-box__picture-image')
#     image_sources = [img['src'] for img in image_tags]

#     print(f"Scraped {len(image_sources)} images.")
#     return image_sources[:2]  # Return the first two image sources

# # Start Playwright process
# async def start_playwright_scraping():
#     print('Starting Playwright scraping process...')
#     async with async_playwright() as p:
#         browser = await p.chromium.launch(headless=False)
#         print('Browser launched.')
#         context = await browser.new_context()
#         page = await context.new_page()
#         print('New page created in browser.')

#         images = await scrape_bumble_async(page)
        
#         await browser.close()
#         print('Browser closed.')

#         return images  # Return the scraped image URLs

# # Route to start the scraping process
# @app.route('/scrape_images', methods=['POST'])
# def scrape_images():
#     global scraped_images  # Reference the global scraped_images
    
#     print('Received request to scrape images.')
    
#     # Start the scraping process in a background task
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     loop.create_task(run_scraping_task())  # Start scraping in the background
    
#     return jsonify({"message": "Scraping started"}), 200

# # Function to handle scraping and return results
# async def run_scraping_task():
#     print('Running scraping task...')
#     images = await start_playwright_scraping()
    
#     # Store scraped images globally
#     global scraped_images
#     scraped_images = images
#     print(f"Scraped Images: {scraped_images}")
    
#     print('Scraping completed.')

# if __name__ == '__main__':
#     print('Starting Flask application...')
#     app.run(debug=True, port=5001)



# from flask import Flask, request, jsonify
# from flask_cors import CORS  # Import CORS
# import os
# import time
# import requests
# import asyncio
# from werkzeug.utils import secure_filename
# from PIL import Image
# from face_comparison import FaceComparer  # Assume face comparison logic is moved here
# from playwright.async_api import async_playwright
# from bs4 import BeautifulSoup

# app = Flask(__name__)

# # Enable CORS for all routes (development mode: allow all origins)
# CORS(app, resources={r"/*": {"origins": "*"}})

# UPLOAD_FOLDER = 'static/images'  # Folder to temporarily store uploaded images
# ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# running = False
# scraped_images = []  # Global variable to hold the scraped images

# # Helper function to check allowed file types
# def allowed_file(filename):
#     print(f"Checking file extension for: {filename}")
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# # Scrape Bumble for profile images (to be called only once for each cycle)
# async def scrape_bumble_async(page):
#     print('Scraping Bumble for images...')
#     await page.goto("https://bumble.com/en-in/")
#     print('Navigated to Bumble.')

#     print('Clicking Sign In button...')
#     await page.locator("label:has-text('Main')").locator("a:has-text('Sign In')").click()
#     print('Clicked Sign In.')

#     with page.expect_popup() as page1_info:
#         print('Clicking Continue with Facebook button...')
#         await page.locator("button:has-text('Continue with Facebook')").click()
#     page1 = page1_info.value
#     print('Popup for login appeared.')

#     print('Filling in credentials...')
#     await page1.locator("#email").fill("your_email")
#     await page1.locator("#pass").fill("your_password")
#     await page1.locator("#pass").press("Enter")
#     print('Credentials submitted.')

#     # Wait for login to complete
#     print('Waiting for the user to continue...')
#     await page1.locator("label:has-text('Continue as')").wait_for(state="visible", timeout=15000)
#     await page1.locator("label:has-text('Continue as')").click()
#     print('Logged in and continuing as user.')

#     # Scraping profile image URLs
#     await asyncio.sleep(10)  # Wait for the page to load fully
#     html_content = await page.content()
#     soup = BeautifulSoup(html_content, 'html.parser')
#     image_tags = soup.find_all('img', class_='media-box__picture-image')
#     image_sources = [img['src'] for img in image_tags]

#     print(f"Scraped {len(image_sources)} images.")
#     return image_sources[:2]  # Return the first two image sources

# # Start Playwright process
# async def start_playwright_scraping():
#     print('Starting Playwright scraping process...')
#     async with async_playwright() as p:
#         browser = await p.chromium.launch(headless=False)
#         print('Browser launched.')
#         context = await browser.new_context()
#         page = await context.new_page()
#         print('New page created in browser.')

#         images = await scrape_bumble_async(page)
        
#         await browser.close()
#         print('Browser closed.')

#         return images  # Return the scraped image URLs

# # Route to start the process
# @app.route('/start_process', methods=['POST'])
# def start_process():
#     global running  # Declare running as global before using it
#     print('Received request to start the process.')
    
#     # Check if scraping is already running
#     if running:
#         print('Process is already running.')
#         return jsonify({"message": "Process is already running"}), 400

#     running = True  # Set the global variable `running` to True

#     # Start the scraping process in a background task
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     loop.create_task(run_scraping_task())  # Start scraping in the background
#     print('Scraping process started in background.')
    
#     return jsonify({"message": "Scraping started"}), 200

# # Function to handle scraping and return results
# async def run_scraping_task():
#     print('Running scraping task...')
#     images = await start_playwright_scraping()
    
#     # Once images are scraped, you can trigger further actions (like sending a response or doing comparisons)
#     global scraped_images
#     scraped_images = images
#     print(f"Scraped Images: {scraped_images}")
    
#     # Optionally, trigger the next process after scraping
#     # Start face comparison or other tasks as needed.
#     print('Scraping completed.')

# # Route to handle the image comparison and return result
# @app.route('/compare_faces', methods=['POST'])
# def compare_faces():
#     global scraped_images  # Reference the global scraped_images
    
#     print('Received request to compare faces.')
#     user_image = request.files.get('user_image')
    
#     # Check if images are available
#     if not user_image:
#         print('User image is missing.')
#         return jsonify({"error": "User image is required"}), 400

#     if not scraped_images:  # Check if scraped images are available
#         print('No Bumble images available for comparison.')
#         return jsonify({"error": "No Bumble images available. Please start the scraping process."}), 400

#     if allowed_file(user_image.filename):
#         print(f"Saving user image: {user_image.filename}")
#         # Save user image
#         user_image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(user_image.filename))
#         user_image.save(user_image_path)

#         # Process the first scraped image (or all, depending on your needs)
#         bumble_image_url = scraped_images[0]  # Using the first scraped image for comparison
#         print(f"Using Bumble image: {bumble_image_url}")
        
#         # Download the Bumble image
#         try:
#             print(f"Downloading Bumble image from URL: {bumble_image_url}")
#             bumble_image = Image.open(requests.get(bumble_image_url, stream=True).raw)
#             bumble_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'bumble_image.jpg')
#             bumble_image.save(bumble_image_path)
#             print(f"Bumble image saved to: {bumble_image_path}")
#         except Exception as e:
#             print(f"Failed to download Bumble image: {str(e)}")
#             return jsonify({"error": f"Failed to download Bumble image: {str(e)}"}), 500
        
#         # Perform image comparison
#         try:
#             print('Starting face comparison...')
#             face_comparer = FaceComparer(method='insightface')  # Replace with your method
#             result = face_comparer.compare_faces(user_image_path, bumble_image_path)

#             # Cleanup images after comparison
#             os.remove(user_image_path)
#             os.remove(bumble_image_path)

#             print('Face comparison completed.')
#             return jsonify(result)
#         except Exception as e:
#             print(f"Error comparing faces: {str(e)}")
#             return jsonify({"error": f"Error comparing faces: {str(e)}"}), 500
#     else:
#         print('Invalid file type for user image.')
#         return jsonify({"error": "Invalid file type"}), 400


# if __name__ == '__main__':
#     print('Starting Flask application...')
#     app.run(debug=True, port=5001)











# import os
# import time
# import requests
# import asyncio
# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from face_comparison import FaceComparer  # Assume face comparison logic is moved here
# from playwright.async_api import async_playwright
# from PIL import Image
# from bs4 import BeautifulSoup

# app = Flask(__name__)
# UPLOAD_FOLDER = 'static/images'  # Folder to temporarily store uploaded images
# ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # Flag to control the process
# running = False

# # Helper function to check allowed file types
# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# # Scrape Bumble for profile images (to be called only once for each cycle)
# async def scrape_bumble_async(page):
#     print('going to url')
#     await page.goto("https://bumble.com/en-in/")
#     print('clicking sign in')
#     # Perform login steps (assuming already logged in)
#     await page.locator("label:has-text('Main')").locator("a:has-text('Sign In')").click()
#     print('pop up')
#     with page.expect_popup() as page1_info:
#         await page.locator("button:has-text('Continue with Facebook')").click()
#     page1 = page1_info.value
#     print('credential')
#     await page1.locator("#email").click()
#     await page1.locator("#email").fill("s1973sp@gmail.com")
#     await page1.locator("#pass").fill("DaRkLaNd@16")
#     print('enter')
#     await page1.locator("#pass").press("label:has-text('Log in')")
    
#     # Wait until the login is complete
#     print('going to continue as praa')
#     await page1.locator("label:has-text('Continue as Pranav')").wait_for(state="visible", timeout=15000)
#     await page1.locator("label:has-text('Continue as Pranav')").click()

#     # Scraping profile image URLs
#     await asyncio.sleep(15)  # Wait for the page to load fully
#     html_content = await page.content()
#     soup = BeautifulSoup(html_content, 'html.parser')
#     image_tags = soup.find_all('img', class_='media-box__picture-image')
#     image_sources = [img['src'] for img in image_tags]
    
#     # Return two images (you can customize this for more users)
#     return image_sources[:2]

# # Function to keep the process running
# async def continuous_process_async():
#     global running
#     async with async_playwright() as p:
#         browser = await p.chromium.launch(headless=False)  # Headless mode set to False
#         context = await browser.new_context()
#         page = await context.new_page()

#         while running:
#             images = await scrape_bumble_async(page)
            
#             if images:
#                 user_image_path = "path_to_user_image"  # Assume this path is dynamically provided by frontend

#                 bumble_results = []  # To store Bumble image results
#                 for bumble_image_url in images:
#                     # Compare user image with current Bumble image
#                     result = compare_faces_with_user_image(user_image_path, bumble_image_url)
#                     bumble_results.append({
#                         'bumble_image_url': bumble_image_url,
#                         'result': result
#                     })
                    
#                     # Wait before the next cycle
#                     await asyncio.sleep(5)  # Throttle requests

#             # Optional: sleep between scraping cycles to avoid overloading the server
#             await asyncio.sleep(5)  # Adjust this value to throttle requests

# # Simulated face comparison logic
# def compare_faces_with_user_image(user_image_path, bumble_image_url):
#     # Simulate ML comparison logic and return a match score
#     match_score = 0.85  # Example score, replace with real logic
#     result = {
#         "match": match_score > 0.7,  # Set a threshold for match
#         "score": match_score
#     }
#     return result

# # Route to start the process
# @app.route('/start_process', methods=['POST'])
# def start_process():
#     global running
#     if running:
#         return jsonify({"message": "Process is already running"}), 400

#     running = True
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     loop.create_task(continuous_process_async())  # Start async task
#     return jsonify({"message": "Process started"}), 200

# # Route to stop the process
# @app.route('/stop_process', methods=['POST'])
# def stop_process():
#     global running
#     running = False
#     return jsonify({"message": "Process stopped"}), 200

# # Route to handle the image comparison and return result
# @app.route('/compare_faces', methods=['POST'])
# def compare_faces():
#     user_image = request.files.get('user_image')
#     bumble_image_url = request.json.get('bumble_image_url')

#     if not user_image or not bumble_image_url:
#         return jsonify({"error": "User image and Bumble image URL are required"}), 400

#     if allowed_file(user_image.filename):
#         user_image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(user_image.filename))
#         user_image.save(user_image_path)

#         # Download the Bumble image
#         try:
#             bumble_image = Image.open(requests.get(bumble_image_url, stream=True).raw)
#             bumble_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'bumble_image.jpg')
#             bumble_image.save(bumble_image_path)
#         except Exception as e:
#             return jsonify({"error": f"Failed to download Bumble image: {str(e)}"}), 500

#         # Compare the images
#         face_comparer = FaceComparer(method='insightface')  # Or 'huggingface'
#         result = face_comparer.compare_faces(user_image_path, bumble_image_path)

#         # Clean up the images after processing
#         os.remove(user_image_path)
#         os.remove(bumble_image_path)

#         return jsonify(result)
#     else:
#         return jsonify({"error": "Invalid file type"}), 400

# if __name__ == '__main__':
#     app.run(debug=True, port=5001)







# import os
# import time
# import requests
# import asyncio
# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from face_comparison import FaceComparer  # Assume face comparison logic is moved here
# from playwright.async_api import async_playwright
# from PIL import Image
# from bs4 import BeautifulSoup

# app = Flask(__name__)
# UPLOAD_FOLDER = 'static/images'  # Folder to temporarily store uploaded images
# ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # Flag to control the process
# running = False

# # Helper function to check allowed file types
# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# # Scrape Bumble for profile images (to be called only once for each cycle)
# async def scrape_bumble_async(page):
#     page.goto("https://bumble.com/en-in/")
    
#     # Perform login steps (assuming already logged in)
#     page.get_by_label("Main").get_by_role("link", name="Sign In").click()
#     with page.expect_popup() as page1_info:
#         page.get_by_role("button", name="Continue with Facebook").click()
#     page1 = page1_info.value
#     page1.locator("#email").click()
#     page1.locator("#email").fill("s1973sp@gmail.com")
#     page1.locator("#pass").fill("DaRkLaNd@16")
#     page1.locator("#pass").press("Enter")
#     page1.get_by_label("Continue as Pranav").wait_for(state="visible", timeout=15000)
#     page1.get_by_label("Continue as Pranav").click()
    
#     # Scraping profile image URLs
#     await asyncio.sleep(15)  # Wait for the page to load fully
#     html_content = page.content()
#     soup = BeautifulSoup(html_content, 'html.parser')
#     image_tags = soup.find_all('img', class_='media-box__picture-image')
#     image_sources = [img['src'] for img in image_tags]
    
#     # Return two images (you can customize this for more users)
#     return image_sources[:2]

# # Function to keep the process running
# async def continuous_process_async():
#     global running
#     async with async_playwright() as p:
#         browser = await p.chromium.launch(headless=False)
#         context = await browser.new_context()
#         page = await context.new_page()

#         while running:
#             images = await scrape_bumble_async(page)
            
#             if images:
#                 user_image_path = "path_to_user_image"  # Assume this path is dynamically provided by frontend

#                 bumble_results = []  # To store Bumble image results
#                 for bumble_image_url in images:
#                     # Compare user image with current Bumble image
#                     result = compare_faces_with_user_image(user_image_path, bumble_image_url)
#                     bumble_results.append({
#                         'bumble_image_url': bumble_image_url,
#                         'result': result
#                     })
                    
#                     # Wait before the next cycle
#                     await asyncio.sleep(5)  # Throttle requests

#             # Optional: sleep between scraping cycles to avoid overloading the server
#             await asyncio.sleep(5)  # Adjust this value to throttle requests

# # Simulated face comparison logic
# def compare_faces_with_user_image(user_image_path, bumble_image_url):
#     # Simulate ML comparison logic and return a match score
#     match_score = 0.85  # Example score, replace with real logic
#     result = {
#         "match": match_score > 0.7,  # Set a threshold for match
#         "score": match_score
#     }
#     return result

# # Route to start the process
# @app.route('/start_process', methods=['POST'])
# def start_process():
#     global running
#     if running:
#         return jsonify({"message": "Process is already running"}), 400

#     running = True
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     loop.create_task(continuous_process_async())  # Start async task
#     return jsonify({"message": "Process started"}), 200

# # Route to stop the process
# @app.route('/stop_process', methods=['POST'])
# def stop_process():
#     global running
#     running = False
#     return jsonify({"message": "Process stopped"}), 200

# # Route to handle the image comparison and return result
# @app.route('/compare_faces', methods=['POST'])
# def compare_faces():
#     user_image = request.files.get('user_image')
#     bumble_image_url = request.json.get('bumble_image_url')

#     if not user_image or not bumble_image_url:
#         return jsonify({"error": "User image and Bumble image URL are required"}), 400

#     if allowed_file(user_image.filename):
#         user_image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(user_image.filename))
#         user_image.save(user_image_path)

#         # Download the Bumble image
#         try:
#             bumble_image = Image.open(requests.get(bumble_image_url, stream=True).raw)
#             bumble_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'bumble_image.jpg')
#             bumble_image.save(bumble_image_path)
#         except Exception as e:
#             return jsonify({"error": f"Failed to download Bumble image: {str(e)}"}), 500

#         # Compare the images
#         face_comparer = FaceComparer(method='insightface')  # Or 'huggingface'
#         result = face_comparer.compare_faces(user_image_path, bumble_image_path)

#         # Clean up the images after processing
#         os.remove(user_image_path)
#         os.remove(bumble_image_path)

#         return jsonify(result)
#     else:
#         return jsonify({"error": "Invalid file type"}), 400

# if __name__ == '__main__':
#     app.run(debug=True, port=5001)





# import os
# import time
# import requests
# import threading
# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from face_comparison import FaceComparer  # Assume face comparison logic is moved here
# from playwright.sync_api import sync_playwright
# from PIL import Image
# from bs4 import BeautifulSoup

# app = Flask(__name__)
# UPLOAD_FOLDER = 'static/images'  # Folder to temporarily store uploaded images
# ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # Flag to control the process
# running = False

# # Helper function to check allowed file types
# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# # Scrape Bumble for profile images (to be called only once for each cycle)
# def scrape_bumble(page):
#     page.goto("https://bumble.com/en-in/")
    
#     # Perform login steps (assuming already logged in)
#     page.get_by_label("Main").get_by_role("link", name="Sign In").click()
#     with page.expect_popup() as page1_info:
#         page.get_by_role("button", name="Continue with Facebook").click()
#     page1 = page1_info.value
#     page1.locator("#email").click()
#     page1.locator("#email").fill("s1973sp@gmail.com")
#     page1.locator("#pass").fill("DaRkLaNd@16")
#     page1.locator("#pass").press("Enter")
#     page1.get_by_label("Continue as Pranav").wait_for(state="visible", timeout=15000)
#     page1.get_by_label("Continue as Pranav").click()
    
#     # Scraping profile image URLs
#     time.sleep(15)
#     html_content = page.content()
#     soup = BeautifulSoup(html_content, 'html.parser')
#     image_tags = soup.find_all('img', class_='media-box__picture-image')
#     image_sources = [img['src'] for img in image_tags]
    
#     # Return two images (you can customize this for more users)
#     return image_sources[:2]

# # Function to keep the process running
# def continuous_process(page):
#     global running
#     while running:
#         images = scrape_bumble(page)
        
#         if images:
#             user_image_path = "path_to_user_image"  # Assume this path is dynamically provided by frontend

#             bumble_results = []  # To store bumble image results
#             for bumble_image_url in images:
#                 # Compare user image with current Bumble image
#                 result = compare_faces_with_user_image(user_image_path, bumble_image_url)
#                 bumble_results.append({
#                     'bumble_image_url': bumble_image_url,
#                     'result': result
#                 })
                
#                 # Wait before the next cycle
#                 time.sleep(5)

#         # Optional: sleep between scraping cycles to avoid overloading the server
#         time.sleep(5)  # Adjust this value to throttle requests

# # Simulated face comparison logic
# def compare_faces_with_user_image(user_image_path, bumble_image_url):
#     # Simulate ML comparison logic and return a match score
#     match_score = 0.85  # Example score, replace with real logic
#     result = {
#         "match": match_score > 0.7,  # Set a threshold for match
#         "score": match_score
#     }
#     return result

# # Simulate pressing the "Pass" button on Bumble (you can use Playwright or browser automation here)
# def press_pass_on_bumble(page):
#     try:
#         page.get_by_label("Pass").click()
#         time.sleep(2)  # Wait a bit after clicking
#     except Exception as e:
#         print(f"Error pressing 'Pass' button: {e}")

# # Endpoint to start the process
# @app.route('/start_process', methods=['POST'])
# def start_process():
#     global running
#     if running:
#         return jsonify({"message": "Process is already running"}), 400

#     running = True
#     with sync_playwright() as p:
#         browser = p.chromium.launch(headless=False)
#         context = browser.new_context()
#         page = context.new_page()

#         # Start continuous process in a separate thread to avoid blocking
#         threading.Thread(target=continuous_process, args=(page,)).start()

#     return jsonify({"message": "Process started"}), 200

# # Endpoint to stop the process
# @app.route('/stop_process', methods=['POST'])
# def stop_process():
#     global running
#     running = False
#     return jsonify({"message": "Process stopped"}), 200

# # Route to handle the image comparison and return result
# @app.route('/compare_faces', methods=['POST'])
# def compare_faces():
#     user_image = request.files['user_image']
#     bumble_image_url = request.json.get('bumble_image_url')
    
#     if user_image and allowed_file(user_image.filename):
#         user_image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(user_image.filename))
#         user_image.save(user_image_path)

#         # Download the Bumble image
#         bumble_image = Image.open(requests.get(bumble_image_url, stream=True).raw)
#         bumble_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'bumble_image.jpg')
#         bumble_image.save(bumble_image_path)

#         # Initialize FaceComparer and compare the images
#         face_comparer = FaceComparer(method='insightface')  # Or 'huggingface'
#         result = face_comparer.compare_faces(user_image_path, bumble_image_path)

#         # Clean up images after processing (optional)
#         os.remove(user_image_path)
#         os.remove(bumble_image_path)

#         return jsonify(result)
#     else:
#         return jsonify({"error": "Invalid file or file type"}), 400

# if __name__ == '__main__':
#     app.run(debug=True, port=5001)
