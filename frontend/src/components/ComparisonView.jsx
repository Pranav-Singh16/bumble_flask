import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ComparisonView = () => {
  const [userImage, setUserImage] = useState(null);
  const [bumbleImage, setBumbleImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false); // For loading state

  // Scrape images from Bumble and set them
  const handleScrape = async () => {
    setLoading(true); // Show loading indicator while scraping
    try {
      const response = await axios.post('http://localhost:5001/scrape_images');
      const images = response.data.images;

      // Assuming first image is user image and second image is Bumble image
      setUserImage(images[0]);
      setBumbleImage(images[1]);
    } catch (error) {
      console.error("Error scraping Bumble:", error);
    } finally {
      setLoading(false); // Hide loading indicator after scraping is done
    }
  };

  // Compare the faces after images are set
  const handleCompare = async () => {
    if (!userImage || !bumbleImage) return; // Ensure images exist before comparing

    setLoading(true); // Show loading indicator while comparing
    try {
      const response = await axios.post('http://localhost:5001/compare_faces', {
        userImage,
        bumbleImage
      });
      setResult(response.data); // Store the comparison result
    } catch (error) {
      console.error("Error comparing faces:", error);
    } finally {
      setLoading(false); // Hide loading indicator after comparison is done
    }
  };

  // Trigger the scraping process on component mount and then trigger comparison
  useEffect(() => {
    handleScrape(); // Start scraping when the component mounts
  }, []);

  useEffect(() => {
    // Automatically trigger face comparison after images are set
    if (userImage && bumbleImage) {
      handleCompare();
    }
  }, [userImage, bumbleImage]); // This hook will run when images are updated

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">Face Comparison</h1>

      {loading && <div className="text-center text-xl text-gray-600 mb-4">Loading...</div>}

      {/* Display images side by side */}
      <div className="flex justify-center space-x-8 mb-6">
        <div className="text-center">
          {userImage ? (
            <img
              src={`data:image/png;base64,${userImage}`}
              alt="User Image"
              className="w-40 h-40 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">No Image</div>
          )}
          <p className="text-sm text-gray-600 mt-2">Your Image</p>
        </div>

        <div className="text-center">
          {bumbleImage ? (
            <img
              src={`data:image/png;base64,${bumbleImage}`}
              alt="Bumble Image"
              className="w-40 h-40 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              {loading ? "Getting data from Bumble..." : "No Bumble Image"}
            </div>
          )}
          <p className="text-sm text-gray-600 mt-2">Bumble Image</p>
        </div>
      </div>

      {/* ML Score and Results */}
      {result && (
        <div className="text-center bg-green-500 text-white p-4 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-bold mb-2">ML Comparison Result</h2>
          <p className="text-lg">Similarity Score: {result.score}</p>
          <p className="text-lg">{result.match ? 'Match Found' : 'No Match'}</p>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;










// // ComparisonView.jsx

// import React, { useState } from 'react';
// import axios from 'axios';

// const ComparisonView = () => {
//   const [scrapedImages, setScrapedImages] = useState([]);
//   const [userImage, setUserImage] = useState(null);
//   const [bumbleImage, setBumbleImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [comparisonResult, setComparisonResult] = useState(null);

//   // Handle scraping images from Bumble
//   const scrapeImages = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:5001/scrape_images');
//       setScrapedImages(response.data.images); // Assuming scraped images are returned as base64
//     } catch (err) {
//       setError('Error scraping images');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle user image upload
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUserImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle face comparison after images are scraped and displayed
//   const compareFaces = async () => {
//     if (!userImage || !bumbleImage) {
//       alert('Please upload an image and scrape Bumble images first');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:5001/compare_faces', {
//         userImage,
//         bumbleImage,
//         threshold: 0.6,
//       });
//       setComparisonResult(response.data);
//     } catch (err) {
//       setError('Error comparing faces');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
//       <h1 className="text-4xl font-semibold mb-8 text-center text-gray-800">Face Comparison</h1>

//       {/* Image Upload Section */}
//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleImageUpload}
//         className="mb-4 p-2 bg-blue-100 rounded-md"
//       />
//       {userImage && <img src={userImage} alt="User" className="mb-4 w-40 h-40 object-cover rounded-lg" />}

//       {/* Scrape Images Button */}
//       <button
//         onClick={scrapeImages}
//         disabled={loading}
//         className="mb-4 p-2 bg-blue-600 text-white rounded-md w-full sm:w-auto"
//       >
//         {loading ? 'Scraping...' : 'Scrape Bumble Images'}
//       </button>

//       {/* Display Scraped Images */}
//       <div className="flex flex-wrap justify-center gap-4 mb-8">
//         {scrapedImages.map((img, index) => (
//           <img
//             key={index}
//             src={img}
//             alt={`Scraped ${index}`}
//             className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-75"
//             onClick={() => setBumbleImage(img)}
//           />
//         ))}
//       </div>

//       {/* Face Comparison Button */}
//       <button
//         onClick={compareFaces}
//         disabled={loading || !userImage || !bumbleImage}
//         className="p-2 bg-green-600 text-white rounded-md w-full sm:w-auto mb-8"
//       >
//         Compare Faces
//       </button>

//       {/* Display Comparison Result */}
//       {comparisonResult && (
//         <div className="w-full sm:w-80 p-4 bg-green-500 text-white rounded-md shadow-md text-center">
//           <div className="text-xl font-bold mb-2">ML Score:</div>
//           <div className="text-2xl">{comparisonResult.score}</div>
//         </div>
//       )}

//       {/* Error Message */}
//       {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
//     </div>
//   );
// };

// // **This is where you export the component as default**
// export default ComparisonView;














// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export const ComparisonView = ({ userImage, bumbleImage, threshold = 0.6 }) => {
//   const [score, setScore] = useState(null);
//   const [match, setMatch] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (userImage && bumbleImage) {
//       setLoading(true);
//       // Make the API call to compare faces
//       axios.post('http://localhost:5001/compare_faces', {
//         userImage,
//         bumbleImage,
//         threshold,
//       })
//         .then(response => {
//           const { match, score } = response.data;
//           setMatch(match);
//           setScore(score);
//         })
//         .catch(err => {
//           setError('Error comparing faces');
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     }
//   }, [userImage, bumbleImage, threshold]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="comparison-container">
//       <div className="image-container">
//         <img src={userImage} alt="User" />
//         <img src={bumbleImage} alt="Bumble" />
//       </div>
//       {error && <div className="error">{error}</div>}
//       <div className="result">
//         <h3>Match Score: {score}</h3>
//         <h3>{match ? 'Match Found!' : 'No Match Found'}</h3>
//       </div>
//     </div>
//   );
// };



















// import React, { useEffect, useState } from 'react';

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   const [currentBumbleImage, setCurrentBumbleImage] = useState(null);

//   useEffect(() => {
//     console.log('Received user image:', userImage);    // Log user image
//     console.log('Received bumble images:', bumbleImage); // Log bumble images

//     if (bumbleImage && bumbleImage.length > 0) {
//       // Initially show the first bumble image
//       console.log('Setting initial bumble image for 5 seconds');
//       setCurrentBumbleImage(bumbleImage[0]); // Show the first bumble image

//       // After 5 seconds, show the second bumble image (if available)
//       const timer = setTimeout(() => {
//         console.log('5 seconds passed, switching to second bumble image');
//         if (bumbleImage.length > 1) {
//           setCurrentBumbleImage(bumbleImage[1]); // Switch to the second bumble image
//         } else {
//           console.log('No second bumble image available');
//         }
//       }, 5000);

//       // Clean up the timer on component unmount or if bumbleImage changes
//       return () => {
//         console.log('Cleaning up timeout');
//         clearTimeout(timer);
//       };
//     }
//   }, [bumbleImage]); // Runs when bumbleImage prop changes

//   useEffect(() => {
//     console.log('Currently showing bumble image:', currentBumbleImage);
//   }, [currentBumbleImage]);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//       {/* Left box: User Image */}
//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <h2 className="text-lg font-semibold mb-4">Your Photo</h2>
//         <div className="aspect-square relative rounded-lg overflow-hidden">
//           <img 
//             src={userImage} 
//             alt="User uploaded" 
//             className="w-full h-full object-cover"
//           />
//         </div>
//       </div>

//       {/* Right box: Bumble Image */}
//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
//         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
//           {currentBumbleImage ? (
//             <img
//               src={currentBumbleImage} // Display the current bumble image
//               alt="Bumble profile"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <span className="text-gray-500">{status || 'Loading Bumble Image...'}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };









// // import React, { useEffect, useState } from 'react';

// // export const ComparisonView = ({bumbleImage, status }) => {
// //   const [showBothImages, setShowBothImages] = useState(false);

// //   // Log the user image and bumble image to ensure they are passed correctly
// //   useEffect(() => {
// //     console.log('Received user image:', userImage);    // Log user image
// //     console.log('Received bumble image:', bumbleImage); // Log bumble image

// //     if (bumbleImage) {
// //       // Initially show only the user image for 5 seconds
// //       console.log('Setting up timeout to show both images after 5 seconds');
// //       const timer = setTimeout(() => {
// //         console.log('5 seconds passed, showing both images');
// //         setShowBothImages(true); // After 5 seconds, show both images
// //       }, 5000);

// //       // Clean up the timeout if the component is unmounted or bumbleImage changes
// //       return () => {
// //         console.log('Cleaning up timeout');
// //         clearTimeout(timer);
// //       };
// //     }
// //   }, [bumbleImage]); // This effect only runs when bumbleImage changes

// //   // Log the current state of the showBothImages
// //   useEffect(() => {
// //     console.log('showBothImages state:', showBothImages);
// //   }, [showBothImages]);

// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Your Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden">
// //           <img 
// //             src={userImage} 
// //             alt="User uploaded" 
// //             className="w-full h-full object-cover"
// //           />
// //         </div>
// //       </div>

// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
// //           {bumbleImage ? (
// //             <img
// //               src={showBothImages ? bumbleImage : userImage} // If both images are to be shown, show bumble image
// //               alt="Bumble profile"
// //               className="w-full h-full object-cover"
// //             />
// //           ) : (
// //             <div className="flex items-center justify-center h-full">
// //               <span className="text-gray-500">{status}</span>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };











// // import React, { useEffect, useState } from 'react';

// // export const ComparisonView = ({ userImage, bumbleImage, status }) => {
// //   const [showBothImages, setShowBothImages] = useState(false);

// //   // Log the user image and bumble image to ensure they are passed correctly
// //   useEffect(() => {
// //     console.log('Received user image:', userImage);
// //     console.log('Received bumble image:', bumbleImage);

// //     if (bumbleImage) {
// //       // Initially show only the user image for 5 seconds
// //       console.log('Setting up timeout to show both images after 5 seconds');
// //       const timer = setTimeout(() => {
// //         console.log('5 seconds passed, showing both images');
// //         setShowBothImages(true); // After 5 seconds, show both images
// //       }, 5000);

// //       // Clean up the timeout if the component is unmounted or bumbleImage changes
// //       return () => {
// //         console.log('Cleaning up timeout');
// //         clearTimeout(timer);
// //       };
// //     }
// //   }, [bumbleImage]); // This effect only runs when bumbleImage changes

// //   // Log the current state of the showBothImages
// //   useEffect(() => {
// //     console.log('showBothImages state:', showBothImages);
// //   }, [showBothImages]);

// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Your Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden">
// //           <img 
// //             src={userImage} 
// //             alt="User uploaded" 
// //             className="w-full h-full object-cover"
// //           />
// //         </div>
// //       </div>

// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
// //           {bumbleImage ? (
// //             <img
// //               src={showBothImages ? bumbleImage : userImage} // If both images are to be shown, show bumble image
// //               alt="Bumble profile"
// //               className="w-full h-full object-cover"
// //             />
// //           ) : (
// //             <div className="flex items-center justify-center h-full">
// //               <span className="text-gray-500">{status}</span>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };




// // import React, { useEffect, useState } from 'react';

// // export const ComparisonView = ({ userImage, bumbleImage, status }) => {
// //   const [showBothImages, setShowBothImages] = useState(false);

// //   // This effect runs when the component is mounted or the userImage changes
// //   useEffect(() => {
// //     if (bumbleImage) {
// //       // Initially show only the first image (bumbleImage) for 5 seconds
// //       const timer = setTimeout(() => {
// //         setShowBothImages(true); // After 5 seconds, show both images
// //       }, 5000);

// //       // Clear the timeout if the component is unmounted or userImage changes
// //       return () => clearTimeout(timer);
// //     }
// //   }, [bumbleImage]);

// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Your Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden">
// //           <img 
// //             src={userImage} 
// //             alt="User uploaded" 
// //             className="w-full h-full object-cover"
// //           />
// //         </div>
// //       </div>

// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
// //           {bumbleImage ? (
// //             <img
// //               src={showBothImages ? bumbleImage : userImage} // If both images are to be shown, use bumble image
// //               alt="Bumble profile"
// //               className="w-full h-full object-cover"
// //             />
// //           ) : (
// //             <div className="flex items-center justify-center h-full">
// //               <span className="text-gray-500">{status}</span>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };




















// // import React from 'react';

// // export const ComparisonView = ({ userImage, bumbleImage, status }) => {
// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Your Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden">
// //           <img 
// //             src={userImage} 
// //             alt="User uploaded" 
// //             className="w-full h-full object-cover"
// //           />
// //         </div>
// //       </div>

// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
// //           {bumbleImage ? (
// //             <img 
// //               src={bumbleImage} 
// //               alt="Bumble profile" 
// //               className="w-full h-full object-cover"
// //             />
// //           ) : (
// //             <div className="flex items-center justify-center h-full">
// //               <span className="text-gray-500">{status}</span>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };





// // // ComparisonView.js
// // import React from 'react';

// // export const ComparisonView = ({ userImage, bumbleImage, status }) => {
// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Your Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden">
// //           <img 
// //             src={userImage} 
// //             alt="User uploaded" 
// //             className="w-full h-full object-cover"
// //           />
// //         </div>
// //       </div>

// //       <div className="bg-white p-4 rounded-lg shadow-lg">
// //         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
// //         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
// //           {bumbleImage ? (
// //             <img 
// //               src={bumbleImage} 
// //               alt="Bumble profile" 
// //               className="w-full h-full object-cover"
// //             />
// //           ) : (
// //             <div className="flex items-center justify-center h-full">
// //               <span className="text-gray-500">{status}</span>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };