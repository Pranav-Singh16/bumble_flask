import React, { useState } from 'react';
import { Header } from './components/Header';
import UploadBox from './components/UploadBox';
import ComparisonView from './components/ComparisonView';
import { useRecoilState } from 'recoil';
import { processStatusState, userImageState } from './state/atoms';
import axios from 'axios';

function App() {
  const [processStatus, setProcessStatus] = useRecoilState(processStatusState);
  const [userImage, setUserImage] = useRecoilState(userImageState);
  const [bumbleImage, setBumbleImage] = useState(null);

  // Handles image upload and initiates the scraping process on the backend
  // const handleImageUpload = async (event) => {
  //   const imageFile = event.target.files[0];
  //   if (imageFile) {
  //     // Immediately update user image and set processing status
  //     setUserImage(URL.createObjectURL(imageFile));  // Set user image URL
  //     setProcessStatus('loading');  // Set process status to loading
  //     setBumbleImage(null);  // Reset bumble image while waiting for backend

  //     try {
  //       // Create FormData and send it to the backend for scraping
  //       const formData = new FormData();
  //       formData.append('user_image', imageFile);
        
  //       // Send the image to backend for scraping
  //       const response = await axios.post('http://localhost:5001/scrape_images', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data'
  //         }
  //       });

  //       // Update states with the Bumble image from response
  //       setBumbleImage(response.data.bumble_image);  // Update the Bumble image from response
  //       setProcessStatus('completed');  // Set process status to completed
  //     } catch (error) {
  //       console.error('Error processing the image:', error);
  //       setProcessStatus('failed');
  //     }
  //   }
  // };




  // const handleImageUpload = async (event) => {
  //   const imageFile = event.target.files[0];
  //   if (imageFile) {
  //     // Immediately update user image and set processing status
  //     setUserImage(URL.createObjectURL(imageFile));  // Set user image URL
  //     setProcessStatus('loading');  // Set process status to loading
  //     setBumbleImage(null);  // Reset bumble image while waiting for backend
  
  //     try {
  //       // Create FormData and send it to the backend for scraping
  //       const formData = new FormData();
  //       formData.append('user_image', imageFile);
        
  //       // Send the image to backend for scraping
  //       const response = await axios.post('http://localhost:5001/scrape_images', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data'
  //         }
  //       });
  
  //       // Log the backend response to see if we get the images
  //       console.log('Backend response:', response.data);
  
  //       // Check if the images are present in the response
  //       if (response.data.images && response.data.images.length > 0) {
  //         setBumbleImage(response.data.images[0]); // Use the first image from the response
  //       } else {
  //         console.error('No images received from backend');
  //       }
  
  //       setProcessStatus('completed');  // Set process status to completed
  //     } catch (error) {
  //       console.error('Error processing the image:', error);
  //       setProcessStatus('failed');
  //     }
  //   }
  // };

  const handleImageUpload = async (event) => {
    const imageFile = event.target.files[0];
    if (imageFile) {
      // Immediately update user image and set processing status
      setUserImage(URL.createObjectURL(imageFile));  // Set user image URL
      setProcessStatus('loading');  // Set process status to loading
      setBumbleImage([]);  // Reset bumble images while waiting for backend
  
      try {
        // Create FormData and send it to the backend for scraping
        const formData = new FormData();
        formData.append('user_images', imageFile);
  
        // Send the image to backend for scraping
        const response = await axios.post('http://localhost:5001/scrape_images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // Log the backend response to check if bumbleImage is present
        console.log('Backend response:', response.data);
  
        // Assuming the backend sends images in an array like: response.data.images
        if (response.data.images && response.data.images.length > 0) {
          console.log('Received Bumble images:', response.data.images);
          setBumbleImage(response.data.images);  // Set the array of Bumble images
        } else {
          console.error('No Bumble images found in response.');
        }
  
        setProcessStatus('completed');  // Set process status to completed
      } catch (error) {
        console.error('Error processing the image:', error);
        setProcessStatus('failed');
      }
    }
};




  // const handleImageUpload = async (event) => {
  //   const imageFile = event.target.files[0];
  //   if (imageFile) {
  //     // Immediately update user image and set processing status
  //     setUserImage(URL.createObjectURL(imageFile));  // Set user image URL
  //     setProcessStatus('loading');  // Set process status to loading
  //     setBumbleImage(null);  // Reset bumble image while waiting for backend
  
  //     try {
  //       // Create FormData and send it to the backend for scraping
  //       const formData = new FormData();
  //       formData.append('user_images', imageFile);
  
  //       // Send the image to backend for scraping
  //       const response = await axios.post('http://localhost:5001/scrape_images', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       });
  
  //       // Log the backend response to check if bumbleImage is present
  //       console.log('Backend response:', response.data);
  
  //       // Assuming the backend sends images in an array like: response.data.images
  //       if (response.data.images && response.data.images.length > 0) {
  //         console.log('Received Bumble image:', response.data.images[0]);
  //         setBumbleImage(response.data.images[0]);  // Set the Bumble image from response
  //       } else {
  //         console.error('No Bumble image found in response.');
  //       }
  
  //       setProcessStatus('completed');  // Set process status to completed
  //     } catch (error) {
  //       console.error('Error processing the image:', error);
  //       setProcessStatus('failed');
  //     }
  //   }
  // };
  

  

  // Stops the ongoing process on the backend (optional for your use case)
  const handleStopProcess = async () => {
    try {
      await axios.post('http://localhost:5001/stop_process');
      setProcessStatus('stopped');
      setUserImage(null);  // Reset user image
      setBumbleImage(null); // Reset comparison image
    } catch (error) {
      console.error('Error stopping the process:', error);
    }
  };

  return (
    <div>
      <Header />
      <UploadBox onImageUpload={handleImageUpload} />

      {/* Display Comparison View with the user image and Bumble image */}
      {userImage && (
        <ComparisonView
          userImage={userImage}
          bumbleImage={bumbleImage}
          status={processStatus}  // Show loading or error state
        />
      )}

      {/* Show the "Stop Process" button if a session exists */}
      {processStatus === 'completed' && (
        <button
          data-tip="Stop the ongoing process"
          onClick={handleStopProcess}
          className="mt-4 p-2 bg-red-600 text-white rounded"
        >
          Stop Process
        </button>
      )}

      {/* Show a loading state if the process is in progress */}
      {processStatus === 'loading' && (
        <div className="flex justify-center items-center mt-8">
          <span>Getting data from Bumble...</span>
        </div>
      )}

      {/* Show error state if the process failed */}
      {processStatus === 'failed' && <p className="text-red-600">Error processing the image. Please try again.</p>}
    </div>
  );
}

export default App;





















// import React, { useState } from 'react';
// import { Header } from './components/Header';
// import UploadBox from './components/UploadBox';
// import { ComparisonView } from './components/ComparisonView';
// import { useRecoilState } from 'recoil';
// import { processStatusState, userImageState } from './state/atoms';
// import axios from 'axios';

// function App() {
//   const [processStatus, setProcessStatus] = useRecoilState(processStatusState);
//   const [userImage, setUserImage] = useRecoilState(userImageState);
//   const [bumbleImage, setBumbleImage] = useState(null);
//   const [sessionId, setSessionId] = useState(null);

//   // Handles image upload and initiates the process on the backend
//   const handleImageUpload = async (event) => {
//     const imageFile = event.target.files[0];
//     if (imageFile) {
//         // Immediately update user image and set processing status
//         setUserImage(URL.createObjectURL(imageFile));  // Set user image URL
//         setProcessStatus('loading');  // Set process status to loading
//         setBumbleImage(null);  // Reset bumble image while waiting for backend

//         try {
//             // Create FormData and send it to the backend
//             const formData = new FormData();
//             formData.append("user_image", imageFile);
            
//             // Send the image to backend to compare faces
//             const response = await axios.post('http://localhost:5001/compare_faces', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 }
//             });

//             // Update states with sessionId and Bumble image
//             setSessionId(response.data.sessionId);  // assuming response contains a sessionId
//             setBumbleImage(response.data.bumble_image);  // Update the Bumble image from response
//             setProcessStatus('completed');  // Set process status to completed
//         } catch (error) {
//             console.error('Error processing the image:', error);
//             setProcessStatus('failed');
//         }
//     }
//   };

//   // const handleImageUpload = async (event) => {
//   //   const imageFile = event.target.files[0];
//   //   if (imageFile) {
//   //     const formData = new FormData();
//   //     formData.append("user_image", imageFile);
  
//   //     try {
//   //       // Send the image data with FormData
//   //       const response = await axios.post('http://localhost:5001/compare_faces', formData, {
//   //         headers: {
//   //           'Content-Type': 'multipart/form-data'  // Ensure the right content type is set
//   //         }
//   //       });
  
//   //       // Handle the response as usual
//   //       console.log('Comparison result:', response.data);
//   //     } catch (error) {
//   //       console.error('Error processing the image:', error);
//   //     }
//   //   }
//   // };
  

//   // Stops the ongoing process on the backend
//   const handleStopProcess = async () => {
//     try {
//       await axios.post('http://localhost:5001/stop_process');
//       setProcessStatus('stopped');
//       setUserImage(null);  // Reset user image
//       setBumbleImage(null); // Reset comparison image
//     } catch (error) {
//       console.error('Error stopping the process:', error);
//     }
//   };

//   return (
//     <div>
//       <Header />
//       <UploadBox onImageUpload={handleImageUpload} />

//       {/* Display Comparison View with the user image and Bumble image */}
//       {userImage && (
//         <ComparisonView
//           userImage={userImage}
//           bumbleImage={bumbleImage}
//           status={processStatus}  // Show loading or error state
//         />
//       )}

//       {/* Show the "Stop Process" button if a session exists */}
//       {sessionId && processStatus === 'completed' && (
//         <button
//           data-tip="Stop the ongoing process"
//           onClick={handleStopProcess}
//           className="mt-4 p-2 bg-red-600 text-white rounded"
//         >
//           Stop Process
//         </button>
//       )}

//       {/* Show a loading state if the process is in progress */}
//       {processStatus === 'loading' && (
//         <div className="flex justify-center items-center mt-8">
//           <span>Getting data from Bumble...</span>
//         </div>
//       )}

//       {/* Show error state if the process failed */}
//       {processStatus === 'failed' && <p className="text-red-600">Error processing the image. Please try again.</p>}
//     </div>
//   );
// }

// export default App;


















// // import React, { useState } from 'react';
// // import { Header } from './components/Header';
// // import UploadBox from './components/UploadBox';
// // import { ComparisonView } from './components/ComparisonView';
// // import { useRecoilState } from 'recoil';
// // import { processStatusState, userImageState } from './state/atoms';
// // import axios from 'axios';// import ReactTooltip from 'react-tooltip';  // Correct import

// // function App() {
// //   const [processStatus, setProcessStatus] = useRecoilState(processStatusState);
// //   const [userImage, setUserImage] = useRecoilState(userImageState);
// //   const [bumbleImage, setBumbleImage] = useState(null);
// //   const [sessionId, setSessionId] = useState(null);

// //   // Handles image upload and initiates the process on the backend
// //   // const handleImageUpload = async (event) => {
// //   //   const imageFile = event.target.files[0];
// //   //   if (imageFile) {
// //   //     try {
// //   //       const formData = new FormData();
// //   //       formData.append("user_image", imageFile);
        
// //   //       const response = await axios.post('/start_process', formData, {
// //   //         headers: {
// //   //           'Content-Type': 'multipart/form-data'
// //   //         }
// //   //       });
        
// //   //       setSessionId(response.data.sessionId);
// //   //       setUserImage(URL.createObjectURL(imageFile));
// //   //       setProcessStatus('processing');
// //   //       setBumbleImage(response.data.bumbleImages);
// //   //     } catch (error) {
// //   //       console.error('Error starting the process:', error);
// //   //       setProcessStatus('failed');
// //   //     }
// //   //   }
// //   // };

// //   const handleImageUpload = async (event) => {
// //     const imageFile = event.target.files[0];
// //     if (imageFile) {
// //         try {
// //             const formData = new FormData();
// //             formData.append("user_image", imageFile);
            
// //             // Manually specify the backend URL
// //             const response = await axios.post('http://localhost:5001/start_process', formData, {
// //                 headers: {
// //                     'Content-Type': 'multipart/form-data'
// //                 }
// //             });

// //             // Handle the response
// //             setSessionId(response.data.sessionId);
// //             setUserImage(URL.createObjectURL(imageFile));
// //             setProcessStatus('processing');
// //             setBumbleImage(response.data.bumbleImages);
// //         } catch (error) {
// //             console.error('Error starting the process:', error);
// //             setProcessStatus('failed');
// //         }
// //     }
// // };

// //   // Stops the ongoing process on the backend
// //   const handleStopProcess = async () => {
// //     try {
// //       await axios.post('/stop_process');
// //       setProcessStatus('stopped');
// //       setUserImage(null);  // Reset user image
// //       setBumbleImage(null); // Reset comparison image
// //     } catch (error) {
// //       console.error('Error stopping the process:', error);
// //     }
// //   };

// //   return (
// //     <div>
// //       <Header />
// //       <UploadBox onImageUpload={handleImageUpload} />

// //       {/* Display Comparison View only if there is a user image and status isn't idle */}
// //       {userImage && processStatus !== 'idle' && (
// //         <ComparisonView
// //           userImage={userImage}
// //           bumbleImage={bumbleImage}
// //           status={processStatus}
// //         />
// //       )}

// //       {/* Show the "Stop Process" button if a session exists */}
// //       {sessionId && processStatus === 'processing' && (
// //         <button
// //           data-tip="Stop the ongoing process"
// //           onClick={handleStopProcess}
// //           className="mt-4 p-2 bg-red-600 text-white rounded"
// //         >
// //           Stop Process
// //         </button>
// //       )}

// //       {/* Show a loading state if the process is in progress */}
// //       {processStatus === 'processing' && (
// //         <div className="flex justify-center items-center mt-8">
// //           <TailSpin color="indigo" height={80} width={80} />
// //         </div>
// //       )}

// //       {/* Show error state if the process failed */}
// //       {processStatus === 'failed' && <p className="text-red-600">Error processing the image. Please try again.</p>}
// //     </div>
// //   );
// // }

// // export default App;


