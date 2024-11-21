from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import os
import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import requests
import base64
import io
from io import BytesIO

app = Flask(__name__)

# Enable CORS for all origins (you can also specify the allowed origins, if you want to restrict access)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Process image (resize for example)
        img = Image.open(filepath)
        img = img.resize((800, 800))  # Resize to 800x800

        # Save resized image
        resized_filename = f"resized_{filename}"
        resized_filepath = os.path.join(app.config['UPLOAD_FOLDER'], resized_filename)
        img.save(resized_filepath)

        return jsonify({'resized_image_url': f'http://localhost:5000/{resized_filename}'}), 200
    else:
        return jsonify({'error': 'Invalid file format'}), 400


# # Scrape Bumble images (new route)
# @app.route('/scrape_images', methods=['POST'])
# async def scrape_images():
#     async def scrape_bumble():
#         # Scraping function
#         async with async_playwright() as p:
#             browser = await p.chromium.launch(headless=False)  # Launch Chromium in headless mode
#             page = await browser.new_page()
#             await page.goto('https://bumble.com/en-in/')
#             await page.locator("#main").get_by_role("link", name="Sign In").click()

#             try:
#                 facebook_button = page.locator("button:has-text('Continue with Facebook')")
#                 print("Waiting for 'Continue with Facebook' button...")
#                 await facebook_button.wait_for(state="visible", timeout=20000)
#                 await facebook_button.scroll_into_view_if_needed()
#                 print("Clicking 'Continue with Facebook' button...")
#                 await facebook_button.click(force=True)  # Force click to bypass any potential issues with visibility
#                 print("Clicked 'Continue with Facebook'.")
#             except Exception as e:
#                 print(f"Error clicking 'Continue with Facebook': {e}")
#                 return []

#             # Wait for the popup and handle login
#             try:
#                 print("Waiting for the popup to appear...")
#                 popup = await page.wait_for_event("popup", timeout=15000)
#                 print("Popup appeared.")
#                 await popup.locator("#email").fill("s1973sp@gmail.com")
#                 await popup.locator("#pass").fill("DaRkLaNd@16")
#                 await popup.locator("#pass").press("Enter")
#                 print('Credentials submitted.')
#             except Exception as e:
#                 print(f"Error during popup handling: {e}")
#                 return []

#             # Wait for the "Continue as" button after login
#             try:
#                 continue_as_button = popup.locator("div[aria-label='Continue as Pranav'][role='button']")
#                 await continue_as_button.wait_for(state="visible", timeout=30000)
#                 await continue_as_button.scroll_into_view_if_needed()
#                 print("Clicking 'Continue as' button...")
#                 await continue_as_button.click()
#                 print('Logged in and continuing as user.')
#             except Exception as e:
#                 print(f"Error during login process: {e}")
#                 return []

#             # Scraping profile image URLs after login
#             try:
#                 await asyncio.sleep(10)  # Wait for the page to load fully
#                 html_content = await page.content()
#                 soup = BeautifulSoup(html_content, 'html.parser')
#                 image_tags = soup.find_all('img', class_='media-box__picture-image')
#                 image_sources = [img['src'] for img in image_tags if 'src' in img.attrs]

#                 print(f"Scraped {len(image_sources)} images.")
#                 return image_sources[:2]  # Ensure you return exactly 2 images
#             except Exception as e:
#                 print(f"Error during scraping images: {e}")
#                 return []

#         # Scrape the Bumble images
#         images = await scrape_bumble()

#         # Ensure all images have the 'https' prefix
#         images = [img if img.startswith(('http://', 'https://')) else 'https:' + img for img in images]

#         # Return the images as part of the JSON response
#         return jsonify({"images": images[:2]}), 200  # Return the first 2 images for example

#     # Start the scraping process and return the results
#     result = await scrape_bumble()
#     return result

def image_url_to_base64(image_url):
    try:
        # Fetch the image content
        response = requests.get(image_url)
        
        # Open the image using PIL
        img = Image.open(BytesIO(response.content))
        
        # Save image to a bytes buffer
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='PNG')  # Save as PNG (can be JPEG or any other format)
        img_byte_arr = img_byte_arr.getvalue()
        
        # Convert the image to base64
        base64_str = base64.b64encode(img_byte_arr).decode('utf-8')
        
        return base64_str
    except Exception as e:
        print(f"Error processing image {image_url}: {e}")
        return None


async def scrape_bumble_async(page):
    print('Scraping Bumble for images...')


    try:
        await page.goto("https://bumble.com/en-in/")
        await page.locator("#main").get_by_role("link", name="Sign In").click()

    except Exception as e:
        print(f"Error scraping Bumble: {e}")
        return[]
    
    
    # Go directly to the Bumble get-started page
    try:
        await page.goto("https://us1.bumble.com/get-started", wait_until="domcontentloaded", timeout=60000)
        print("Navigated to Bumble get-started page.")
    except Exception as e:
        print(f"Error loading the page: {e}")
        return []
    
    # Wait for the "Continue with Facebook" button to be visible and clickable
    try:
        facebook_button = page.locator("button:has-text('Continue with Facebook')")
        print("Waiting for 'Continue with Facebook' button...")
        await facebook_button.wait_for(state="visible", timeout=20000)
        await facebook_button.scroll_into_view_if_needed()
        print("Clicking 'Continue with Facebook' button...")
        await facebook_button.click(force=True)  # Force click to bypass any potential issues with visibility
        print("Clicked 'Continue with Facebook'.")
    except Exception as e:
        print(f"Error clicking 'Continue with Facebook': {e}")
        return []

    # Wait for the popup and handle login
    try:
        print("Waiting for the popup to appear...")
        popup = await page.wait_for_event("popup", timeout=15000)
        print("Popup appeared.")
        await popup.locator("#email").fill("s1973sp@gmail.com")
        await popup.locator("#pass").fill("DaRkLaNd@16")
        await popup.locator("#pass").press("Enter")
        print('Credentials submitted.')
    except Exception as e:
        print(f"Error during popup handling: {e}")
        return []

    # Wait for the "Continue as" button after login
    try:
        continue_as_button = popup.locator("div[aria-label='Continue as Pranav'][role='button']")
        await continue_as_button.wait_for(state="visible", timeout=30000)
        await continue_as_button.scroll_into_view_if_needed()
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
        image_sources = [img['src'] for img in image_tags if 'src' in img.attrs]

        print(f"Scraped {len(image_sources)} images.")
        return image_sources[:2]  # Ensure you return exactly 2 images
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

        return images 
    

@app.route('/scrape_images', methods=['POST'])
async def scrape_images():
    global scraped_images  # Reference the global scraped_images

    print('Received request to scrape images.')

    # Start the scraping process asynchronously
    images = await start_playwright_scraping()

    # Ensure images have https:// prefix
    for j in range(len(images)):
        if images[j].startswith(('http://', 'https://')):  # Check if it already has http:// or https://
            images[j] = images[j].replace('http://', 'https://')  # Ensure it's using https
        else:
            images[j] = 'https:' + images[j]

    # Store scraped images globally
    scraped_images = images
    print(f"Scraped Images: {scraped_images}")

    # Perform the base64 conversion for the scraped images
    base64_images = []
    
    for url in images:
        base64_str = image_url_to_base64(url)  # No await needed since it's synchronous
        if base64_str:  # Only append if base64 conversion is successful
            # Print the length of the base64 string for debugging
            print(f"Base64 string length for {url}: {len(base64_str)}")
            base64_images.append(f"data:image/png;base64,{base64_str}")
        else:
            print(f"Failed to convert image {url} to base64")

    print(f"Base64 Images: {base64_images}")

    # Return response with base64 images
    return jsonify({"message": "Scraping started", "images": base64_images}), 200


if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True, port=5000)
