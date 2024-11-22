import React, { useState, useEffect } from 'react';
import UploadBox from './components/UploadBox';
import { ComparisonView } from './components/ComparisonView';
import { Header } from './components/Header';

const Main = () => {
  const [userImage, setUserImage] = useState('');
  const [bumbleImagesAndScores, setBumbleImagesAndScores] = useState([]);
  const [error, setError] = useState('');

  // Function to handle file upload
  const handleUploadImage = (ev) => {
    ev.preventDefault();

    const fileInput = ev.target.files[0];

    if (!fileInput) {
      setError('Please select a file to upload');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(fileInput.type)) {
      setError('Please select a valid image file (PNG, JPG, JPEG, GIF)');
      return;
    }

    const imageUrl = URL.createObjectURL(fileInput);
    setUserImage(imageUrl);

    const data = new FormData();
    data.append('file', fileInput);

    fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: data,
    })
      .then((response) => response.json())
      .then((body) => {
        setUserImage(body.resized_image_url);
        setError('');
        fetchBumbleImages(); // Call to fetch Bumble images and scores after the upload
      })
      .catch((error) => setError('An error occurred while uploading the image.'));
  };

  // Function to fetch Bumble images and scores
  const fetchBumbleImages = () => {
    fetch('http://localhost:5000/scrape_images', {
      method: 'POST',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Bumble images and scores:", data); // Log the entire response

        // Combine images and scores into an array of objects
        const combinedImages = data.images.map((image, index) => ({
          base64: image,
          score: data.image_scores[index]
        }));

        setBumbleImagesAndScores(combinedImages); // Set the state with combined image and score data
      })
      .catch((error) => setError('An error occurred while fetching Bumble images.'));
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
          bumbleImage={bumbleImagesAndScores}  // Pass the images and scores to ComparisonView
          status="Loading Bumble Image..." 
        />
      )}
    </div>
  );
};

export default Main;










// import React, { useState, useEffect } from 'react';
// import UploadBox from './components/UploadBox';
// import { ComparisonView } from './components/ComparisonView';
// import { Header } from './components/Header';

// const Main = () => {
//   const [userImage, setUserImage] = useState('');
//   const [bumbleImagesAndScores, setBumbleImagesAndScores] = useState([]);
//   const [error, setError] = useState('');

//   // Function to handle file upload
//   const handleUploadImage = (ev) => {
//     ev.preventDefault();

//     const fileInput = ev.target.files[0];

//     if (!fileInput) {
//       setError('Please select a file to upload');
//       return;
//     }

//     const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
//     if (!allowedTypes.includes(fileInput.type)) {
//       setError('Please select a valid image file (PNG, JPG, JPEG, GIF)');
//       return;
//     }

//     const imageUrl = URL.createObjectURL(fileInput);
//     setUserImage(imageUrl);

//     const data = new FormData();
//     data.append('file', fileInput);

//     fetch('http://localhost:5000/upload', {
//       method: 'POST',
//       body: data,
//     })
//       .then((response) => response.json())
//       .then((body) => {
//         setUserImage(body.resized_image_url);
//         setError('');
//         fetchBumbleImages(); // Call to fetch Bumble images and scores after the upload
//       })
//       .catch((error) => setError('An error occurred while uploading the image.'));
//   };

//   // Function to fetch Bumble images and scores
//   const fetchBumbleImages = () => {
//     fetch('http://localhost:5000/scrape_images', {
//       method: 'POST',
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log("Fetched Bumble images and scores:", data.images); // Add console.log here
//         setBumbleImagesAndScores(data.images); // Assuming the backend returns the images and scores in the 'images' field
//       })
//       .catch((error) => setError('An error occurred while fetching Bumble images.'));
//   };

//   return (
//     <div className="bg-gray-900 text-white min-h-screen">
//       <Header />
      
//       {/* Conditionally render the UploadBox only if no image is uploaded */}
//       {!userImage && <UploadBox onImageUpload={handleUploadImage} />}
      
//       {error && <p className="text-red-400">{error}</p>} {/* Show error messages */}
      
//       {/* Conditionally render ComparisonView only if userImage is set */}
//       {userImage && (
//         <ComparisonView 
//           userImage={userImage}  // Pass the user image to the ComparisonView
//           bumbleImage={bumbleImagesAndScores}  // Pass the images and scores to ComparisonView
//           status="Loading Bumble Image..." 
//         />
//       )}
//     </div>
//   );
// };

// export default Main;










// import React, { useState, useEffect } from 'react';
// import UploadBox from './components/UploadBox';  // Import the UploadBox component
// import { ComparisonView } from './components/ComparisonView';  // Import ComparisonView component
// import { Header } from './components/Header';

// const Main = () => {
//   const [userImage, setUserImage] = useState('');  // Initially no user image
//   const [bumbleImages, setBumbleImages] = useState([]);  // To store Bumble images and their scores
//   const [error, setError] = useState('');  // Error message state

//   // Function to handle file upload and send it to the backend
//   const handleUploadImage = (ev) => {
//     ev.preventDefault();

//     const fileInput = ev.target.files[0];  // Get the file from the input field

//     // Check if a file is selected and if it's an image
//     if (!fileInput) {
//       setError('Please select a file to upload');
//       return;
//     }

//     const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
//     if (!allowedTypes.includes(fileInput.type)) {
//       setError('Please select a valid image file (PNG, JPG, JPEG, GIF)');
//       return;
//     }

//     // Use createObjectURL to display the selected image immediately
//     const imageUrl = URL.createObjectURL(fileInput);
//     setUserImage(imageUrl);  // Set the user image to the temp URL

//     const data = new FormData();
//     data.append('file', fileInput);

//     // Send the file to the backend (replace with actual backend URL)
//     fetch('http://localhost:5000/upload', {
//       method: 'POST',
//       body: data,
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         }
//         throw new Error('Error uploading image');
//       })
//       .then((body) => {
//         // Handle success: Set the URL of the uploaded image
//         setUserImage(body.resized_image_url);  // Set the uploaded user image
//         setError('');  // Clear any previous error messages
//         fetchBumbleImages();  // Call to scrape Bumble images after the user image is uploaded
//       })
//       .catch((error) => {
//         // Handle error: Set the error message
//         setError('An error occurred while uploading the image.');
//       });
//   };

//   // Function to fetch Bumble images and their scores
//   const fetchBumbleImages = () => {
//     fetch('http://localhost:5000/scrape_images', {
//       method: 'POST',
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         }
//         throw new Error('Error fetching Bumble images');
//       })
//       .then((data) => {
//         // Assuming the data returned from the backend is an array of objects
//         // Each object contains a base64 string and a score
//         const imagesWithScores = data.images.map((imageData) => ({
//           base64: imageData.base64,  // Base64 image data
//           score: imageData.score,    // Corresponding score
//         }));
//         setBumbleImages(imagesWithScores);
//         console.log(imagesWithScores)  // Update Bumble images and scores in the state
//       })
//       .catch((error) => {
//         setError('An error occurred while fetching Bumble images.');
//       });
//   };

//   return (
//     <div className="bg-gray-900 text-white min-h-screen">
//       <Header />
      
//       {/* Conditionally render the UploadBox only if no image is uploaded */}
//       {!userImage && <UploadBox onImageUpload={handleUploadImage} />}
      
//       {error && <p className="text-red-400">{error}</p>} {/* Show error messages */}
      
//       {/* Conditionally render ComparisonView only if userImage is set */}
//       {userImage && (
//         <ComparisonView 
//           userImage={userImage}  // Pass the user image to the ComparisonView
//           bumbleImages={bumbleImages}  // Pass both images and scores to ComparisonView
//           status="Loading Bumble Images..." 
//         />
//       )}
//     </div>
//   );
// };

// export default Main;










// import React, { useState, useEffect } from 'react';
// import UploadBox from './components/UploadBox';  // Import the UploadBox component
// import { ComparisonView } from './components/ComparisonView';  // Import ComparisonView component
// import { Header } from './components/Header';

// const Main = () => {
//   const [userImage, setUserImage] = useState('');  // Initially no user image
//   const [bumbleImage, setBumbleImage] = useState([  // Initially, empty array for Bumble images
//     'https://via.placeholder.com/150', // Placeholder Bumble image 1
//     'https://via.placeholder.com/150', // Placeholder Bumble image 2
//   ]);
//   const [error, setError] = useState('');  // Error message state

//   // Function to handle file upload and send it to the backend
//   const handleUploadImage = (ev) => {
//     ev.preventDefault();

//     const fileInput = ev.target.files[0];  // Get the file from the input field

//     // Check if a file is selected and if it's an image
//     if (!fileInput) {
//       setError('Please select a file to upload');
//       return;
//     }

//     const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
//     if (!allowedTypes.includes(fileInput.type)) {
//       setError('Please select a valid image file (PNG, JPG, JPEG, GIF)');
//       return;
//     }

//     // Use createObjectURL to display the selected image immediately
//     const imageUrl = URL.createObjectURL(fileInput);
//     setUserImage(imageUrl);  // Set the user image to the temp URL

//     const data = new FormData();
//     data.append('file', fileInput);

//     // Send the file to the backend (replace with actual backend URL)
//     fetch('http://localhost:5000/upload', {
//       method: 'POST',
//       body: data,
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         }
//         throw new Error('Error uploading image');
//       })
//       .then((body) => {
//         // Handle success: Set the URL of the uploaded image
//         setUserImage(body.resized_image_url);  // Set the uploaded user image
//         setError('');  // Clear any previous error messages
//         fetchBumbleImages();  // Call to scrape Bumble images after the user image is uploaded
//       })
//       .catch((error) => {
//         // Handle error: Set the error message
//         setError('An error occurred while uploading the image.');
//       });
//   };

//   // Function to fetch Bumble images
//   const fetchBumbleImages = () => {
//     fetch('http://localhost:5000/scrape_images', {
//       method: 'POST',
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         }
//         throw new Error('Error fetching Bumble images');
//       })
//       .then((data) => {
//         setBumbleImage(data.images);  // Update Bumble images in the state
//       })
//       .catch((error) => {
//         setError('An error occurred while fetching Bumble images.');
//       });
//   };

//   return (
//     <div className="bg-gray-900 text-white min-h-screen">
//       <Header />
      
//       {/* Conditionally render the UploadBox only if no image is uploaded */}
//       {!userImage && <UploadBox onImageUpload={handleUploadImage} />}
      
//       {error && <p className="text-red-400">{error}</p>} {/* Show error messages */}
      
//       {/* Conditionally render ComparisonView only if userImage is set */}
//       {userImage && (
//         <ComparisonView 
//           userImage={userImage}  // Pass the user image to the ComparisonView
//           bumbleImage={bumbleImage} 
//           status="Loading Bumble Image..." 
//         />
//       )}
//     </div>
//   );
// };

// export default Main;
  