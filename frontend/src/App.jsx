import React, { useState, useEffect } from 'react';
import UploadBox from './components/UploadBox';  // Import the UploadBox component
import { ComparisonView } from './components/ComparisonView';  // Import ComparisonView component
import { Header } from './components/Header';

const Main = () => {
  const [userImage, setUserImage] = useState('');  // Initially no user image
  const [bumbleImage, setBumbleImage] = useState([  // Initially, empty array for Bumble images
    'https://via.placeholder.com/150', // Placeholder Bumble image 1
    'https://via.placeholder.com/150', // Placeholder Bumble image 2
  ]);
  const [error, setError] = useState('');  // Error message state

  // Function to handle file upload and send it to the backend
  const handleUploadImage = (ev) => {
    ev.preventDefault();

    const fileInput = ev.target.files[0];  // Get the file from the input field

    // Check if a file is selected and if it's an image
    if (!fileInput) {
      setError('Please select a file to upload');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(fileInput.type)) {
      setError('Please select a valid image file (PNG, JPG, JPEG, GIF)');
      return;
    }

    // Use createObjectURL to display the selected image immediately
    const imageUrl = URL.createObjectURL(fileInput);
    setUserImage(imageUrl);  // Set the user image to the temp URL

    const data = new FormData();
    data.append('file', fileInput);

    // Send the file to the backend (replace with actual backend URL)
    fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: data,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error uploading image');
      })
      .then((body) => {
        // Handle success: Set the URL of the uploaded image
        setUserImage(body.resized_image_url);  // Set the uploaded user image
        setError('');  // Clear any previous error messages
        fetchBumbleImages();  // Call to scrape Bumble images after the user image is uploaded
      })
      .catch((error) => {
        // Handle error: Set the error message
        setError('An error occurred while uploading the image.');
      });
  };

  // Function to fetch Bumble images
  const fetchBumbleImages = () => {
    fetch('http://localhost:5000/scrape_images', {
      method: 'POST',
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error fetching Bumble images');
      })
      .then((data) => {
        setBumbleImage(data.images);  // Update Bumble images in the state
      })
      .catch((error) => {
        setError('An error occurred while fetching Bumble images.');
      });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header />
      
      {/* Conditionally render the UploadBox only if no image is uploaded */}
      {!userImage && <UploadBox onImageUpload={handleUploadImage} />}
      
      {error && <p className="text-red-400">{error}</p>} {/* Show error messages */}
      
      {/* Conditionally render ComparisonView only if userImage is set */}
      {userImage && (
        <ComparisonView 
          userImage={userImage}  // Pass the user image to the ComparisonView
          bumbleImage={bumbleImage} 
          status="Loading Bumble Image..." 
        />
      )}
    </div>
  );
};

export default Main;
