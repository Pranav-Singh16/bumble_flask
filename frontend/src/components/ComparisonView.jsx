import React, { useEffect, useState } from "react";

export const ComparisonView = ({ userImage, bumbleImage, status }) => {
  const [currentBumbleImage, setCurrentBumbleImage] = useState(null);
  const [currentScore, setCurrentScore] = useState(null);
  const [resizedUserImage, setResizedUserImage] = useState(null);
  const [resizedBumbleImage, setResizedBumbleImage] = useState(null);

  // Function to resize an image by half
  const resizeImage = (imageSrc, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width / 2;
      canvas.height = img.height / 2;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL());
    };
    img.src = imageSrc;
  };

  useEffect(() => {
    // Resize user image when it's provided
    if (userImage) {
      resizeImage(userImage, setResizedUserImage);
    }
  }, [userImage]);

  useEffect(() => {
    // Resize the Bumble images and set the first one as the current image and score
    if (bumbleImage && bumbleImage.length > 0) {
      console.log("Received Bumble images and scores:", bumbleImage);
      const firstBumbleImage = bumbleImage[0];

      // Resize the first Bumble image and set the score (if available)
      resizeImage(firstBumbleImage.base64, (resizedImage) => {
        setResizedBumbleImage(resizedImage);
        setCurrentBumbleImage(firstBumbleImage.base64);
        setCurrentScore(firstBumbleImage.score || 0); // Default to 0 if no score available
      });

      const timer = setTimeout(() => {
        if (bumbleImage.length > 1) {
          const secondBumbleImage = bumbleImage[1];
          resizeImage(secondBumbleImage.base64, (resizedImage) => {
            setResizedBumbleImage(resizedImage);
            setCurrentBumbleImage(secondBumbleImage.base64);
            setCurrentScore(secondBumbleImage.score || 0);
          });
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [bumbleImage]);

  return (
    <div className="flex items-center justify-center h-screen gap-2">
      {/* Grid container */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-7xl">
        
        {/* Left box: User Image */}
        <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800 col-start-1 col-end-2">
          <h2 className="text-lg font-semibold text-white mb-4">User Photo</h2>
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
            {resizedUserImage ? (
              <img
                src={resizedUserImage}
                alt="User uploaded"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle box (optional): AI result and Score */}
        <div className="w-full h-1/4 p-4 rounded-lg shadow-lg mt-36 bg-gray-700 col-start-2 col-end-3 flex items-center justify-center">
          <h2 className="text-xl font-bold text-white text-center">
            {currentScore === null
              ? "Here AI result will appear" // Placeholder text before the score arrives
              : `Score: ${currentScore.toFixed(2)} (${currentScore < 60 ? "Different person" : "Same person"})`}
          </h2>
        </div>

        {/* Right box: Bumble Image */}
        <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800 col-start-3 col-end-4">
          <h2 className="text-lg font-semibold text-white mb-4">Comparison Photo</h2>
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
            {currentBumbleImage ? (
              <img
                src={resizedBumbleImage || currentBumbleImage}
                alt="Bumble profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">{status || "Loading Bumble Image..."}</span>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};




// import React, { useEffect, useState } from "react";

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   const [currentBumbleImage, setCurrentBumbleImage] = useState(null);
//   const [currentScore, setCurrentScore] = useState(null);
//   const [resizedUserImage, setResizedUserImage] = useState(null);
//   const [resizedBumbleImage, setResizedBumbleImage] = useState(null);

//   // Function to resize an image by half
//   const resizeImage = (imageSrc, callback) => {
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width / 2;
//       canvas.height = img.height / 2;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       callback(canvas.toDataURL());
//     };
//     img.src = imageSrc;
//   };

//   useEffect(() => {
//     // console.log("Props received in ComparisonView:", { userImage, bumbleImage }); // Log the props when received
//     // Resize user image when it's provided
//     if (userImage) {
//       resizeImage(userImage, setResizedUserImage);
//     }
//   }, [userImage, bumbleImage]);

//   useEffect(() => {
//     // Resize the Bumble images and set the first one as the current image and score
//     if (bumbleImage && bumbleImage.length > 0) {
//       // Check the score for the first Bumble image
//       const firstBumbleImage = bumbleImage[0];
//       resizeImage(firstBumbleImage.base64, (resizedImage) => {
//         setResizedBumbleImage(resizedImage);
//         setCurrentBumbleImage(firstBumbleImage.base64);
//         setCurrentScore(firstBumbleImage.score);
//       });

//       const timer = setTimeout(() => {
//         if (bumbleImage.length > 1) {
//           // Switch to the second Bumble image after 5 seconds
//           const secondBumbleImage = bumbleImage[1];
//           resizeImage(secondBumbleImage.base64, (resizedImage) => {
//             setResizedBumbleImage(resizedImage);
//             setCurrentBumbleImage(secondBumbleImage.base64);
//             setCurrentScore(secondBumbleImage.score);
//           });
//         }
//       }, 5000);

//       return () => {
//         clearTimeout(timer);
//       };
//     }
//   }, [bumbleImage]);

//   return (
//     <div className="flex items-center justify-center h-screen gap-2">
//   {/* Grid container */}
//   <div className="grid grid-cols-3 gap-4 w-full max-w-7xl">
    
//     {/* Left box: User Image */}
//     <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800 col-start-1 col-end-2">
//       <h2 className="text-lg font-semibold text-white mb-4">Your Photo</h2>
//       <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
//         {resizedUserImage ? (
//           <img
//             src={resizedUserImage}
//             alt="User uploaded"
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-gray-800">
//             <span className="text-gray-400">No Image Available</span>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* Middle box (optional): AI result and Score */}
//     <div className="w-full h-1/4 p-4 rounded-lg shadow-lg mt-36 bg-gray-700 col-start-2 col-end-3 flex items-center justify-center">
//       {/* AI result */}
//       <h2 className="text-xl font-bold text-white text-center">
//         {currentScore === null
//           ? "Here AI result will appear" // Placeholder text before the score arrives
//           : `Score: ${currentScore.toFixed(2)} (${
//               currentScore < 60
//                 ? "Different person with score"
//                 : "Same person with score"
//             })`}
//       </h2>
//     </div>

//     {/* Right box: Bumble Image */}
//     <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800 col-start-3 col-end-4">
//       <h2 className="text-lg font-semibold text-white mb-4">Comparison Photo</h2>
//       <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
//         {currentBumbleImage ? (
//           <img
//             src={resizedBumbleImage || currentBumbleImage}
//             alt="Bumble profile"
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <span className="text-gray-400">
//               {status || "Loading Bumble Image..."}
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
    
//   </div>
// </div>


//   );
// };


{/* <div className="w-72 h-72 p-4 rounded-lg shadow-lg bg-gray-900 flex items-center justify-center ">
          <h2 className="text-xl font-bold text-white">
            {currentScore === null
              ? "Here AI result will appear" // Placeholder text before the score arrives
              : `Score: ${currentScore.toFixed(2)} (${
                  currentScore < 60
                    ? "Different person with score"
                    : "Same person with score"
                })`}
          </h2>
        </div> */}








// import React, { useEffect, useState } from "react";

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   const [currentBumbleImage, setCurrentBumbleImage] = useState(null);
//   const [currentScore, setCurrentScore] = useState(null);
//   const [resizedUserImage, setResizedUserImage] = useState(null);
//   const [resizedBumbleImage, setResizedBumbleImage] = useState(null);

//   // Function to resize an image by half
//   const resizeImage = (imageSrc, callback) => {
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width / 2;
//       canvas.height = img.height / 2;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       callback(canvas.toDataURL());
//     };
//     img.src = imageSrc;
//   };

//   // Function to get a different person's image if the score is less than 65
//   const getDifferentPersonImage = () => {
//     return "https://via.placeholder.com/150"; // Placeholder for a different person's image
//   };

//   useEffect(() => {
//     // Resize user image when it's provided
//     if (userImage) {
//       resizeImage(userImage, setResizedUserImage);
//     }
//   }, [userImage]);

//   useEffect(() => {
//     // Resize the Bumble images and set the first one as the current image and score
//     if (bumbleImage && bumbleImage.length > 0) {
//       // Check the score for the first Bumble image
//       const firstBumbleImage = bumbleImage[0];
//       resizeImage(firstBumbleImage.base64, (resizedImage) => {
//         setResizedBumbleImage(resizedImage);
//         setCurrentBumbleImage(firstBumbleImage.base64);
//         setCurrentScore(firstBumbleImage.score);
//       });

//       const timer = setTimeout(() => {
//         if (bumbleImage.length > 1) {
//           // Switch to the second Bumble image after 5 seconds
//           const secondBumbleImage = bumbleImage[1];
//           resizeImage(secondBumbleImage.base64, (resizedImage) => {
//             setResizedBumbleImage(resizedImage);
//             setCurrentBumbleImage(secondBumbleImage.base64);
//             setCurrentScore(secondBumbleImage.score);
//           });
//         }
//       }, 5000);

//       return () => {
//         clearTimeout(timer);
//       };
//     }
//   }, [bumbleImage]);

//   return (
//     <div className="flex items-center justify-center h-screen gap-2">
//       {/* Grid container */}
//       <div className="grid grid-cols-3 gap-0 w-full max-w-7xl">
//         {/* Left box: User Image */}
//         <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800">
//           <h2 className="text-lg font-semibold text-white mb-4">Your Photo</h2>
//           <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
//             {resizedUserImage ? (
//               <img
//                 src={resizedUserImage}
//                 alt="User uploaded"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center h-screen bg-gray-800">
//                 <span className="text-gray-400">No Image Available</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Middle box: Welcome */}
//         <div className="w-72 h-72 p-4 rounded-lg shadow-lg bg-gray-900 flex items-center justify-center">
//           <h2 className="text-xl font-bold text-white">
//             Welcome, let me tell you the score!
//           </h2>
//           <div className="mt-4">
//             {currentScore !== null ? (
//               <p className="text-lg text-white">
//                 Score: {currentScore.toFixed(2)} {/* Display the score */}
//                 <br />
//                 {currentScore >= 65
//                   ? "Same person with score"
//                   : "Different person with score"}
//               </p>
//             ) : (
//               <p className="text-gray-400">Loading score...</p>
//             )}
//           </div>
//         </div>

//         {/* Right box: Bumble Image */}
//         <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800">
//           <h2 className="text-lg font-semibold text-white mb-4">
//             Comparison Photo
//           </h2>
//           <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
//             {currentBumbleImage ? (
//               <img
//                 src={resizedBumbleImage || currentBumbleImage}
//                 alt="Bumble profile"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <span className="text-gray-400">
//                   {status || "Loading Bumble Image..."}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };







// import React, { useEffect, useState } from "react";

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   const [currentBumbleImage, setCurrentBumbleImage] = useState(null);
//   const [resizedUserImage, setResizedUserImage] = useState(null);
//   const [resizedBumbleImage, setResizedBumbleImage] = useState(null);

//   // Function to resize an image by half
//   const resizeImage = (imageSrc, callback) => {
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width / 2;
//       canvas.height = img.height / 2;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       callback(canvas.toDataURL());
//     };
//     img.src = imageSrc;
//   };

//   useEffect(() => {
//     // Resize user image when it's provided
//     if (userImage) {
//       resizeImage(userImage, setResizedUserImage);
//     }
//   }, [userImage]);

//   useEffect(() => {
//     // Resize the first Bumble image when it's provided
//     if (bumbleImage && bumbleImage.length > 0) {
//       resizeImage(bumbleImage[0], (resizedImage) => {
//         setResizedBumbleImage(resizedImage);
//         setCurrentBumbleImage(bumbleImage[0]); // Display the first Bumble image
//       });

//       const timer = setTimeout(() => {
//         if (bumbleImage.length > 1) {
//           resizeImage(bumbleImage[1], setCurrentBumbleImage); // Switch to the second Bumble image
//         }
//       }, 5000);

//       return () => {
//         clearTimeout(timer);
//       };
//     }
//   }, [bumbleImage]);

//   return (
//     <div className="flex items-center justify-center h-screen gap-2">
//       {/* Grid container */}
//       <div className="grid grid-cols-3 gap-0 w-full max-w-7xl">
//         {/* Left box: User Image */}
//         <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800">
//           <h2 className="text-lg font-semibold text-white mb-4">Your Photo</h2>
//           <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
//             {resizedUserImage ? (
//               <img
//                 src={resizedUserImage}
//                 alt="User uploaded"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center h-screen bg-gray-800">
//                 <span className="text-gray-400">No Image Available</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Middle box: Welcome */}
//         <div className="w-72 h-72 p-4 rounded-lg shadow-lg bg-gray-900 flex items-center justify-center">
//           <h2 className="text-xl font-bold text-white">Welcome ans let  me tell </h2>
//         </div>

//         {/* Right box: Bumble Image */}
//         <div className="w-full h- p-2 rounded-lg shadow-lg bg-gray-800">
//           <h2 className="text-lg font-semibold text-white mb-4">
//             Comparison Photo
//           </h2>
//           <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
//             {currentBumbleImage ? (
//               <img
//                 src={resizedBumbleImage || currentBumbleImage}
//                 alt="Bumble profile"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <span className="text-gray-400">
//                   {status || "Loading Bumble Image..."}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };






// import React, { useEffect, useState } from "react";

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   const [currentBumbleImage, setCurrentBumbleImage] = useState(null);
//   const [resizedUserImage, setResizedUserImage] = useState(null);
//   const [resizedBumbleImage, setResizedBumbleImage] = useState(null);

//   // Function to resize an image by half
//   const resizeImage = (imageSrc, callback) => {
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width / 2;
//       canvas.height = img.height / 2;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       callback(canvas.toDataURL());
//     };
//     img.src = imageSrc;
//   };

//   useEffect(() => {
//     // Resize user image when it's provided
//     if (userImage) {
//       resizeImage(userImage, setResizedUserImage);
//     }
//   }, [userImage]);

//   useEffect(() => {
//     // Resize the first Bumble image when it's provided
//     if (bumbleImage && bumbleImage.length > 0) {
//       resizeImage(bumbleImage[0], (resizedImage) => {
//         setResizedBumbleImage(resizedImage);
//         setCurrentBumbleImage(bumbleImage[0]); // Display the first Bumble image
//       });

//       const timer = setTimeout(() => {
//         if (bumbleImage.length > 1) {
//           resizeImage(bumbleImage[1], setCurrentBumbleImage); // Switch to the second Bumble image
//         }
//       }, 5000);

//       return () => {
//         clearTimeout(timer);
//       };
//     }
//   }, [bumbleImage]);

//   return (
//     <div className="flex items-center justify-center h-screen gap-2">
//       {/* Grid container */}
//       <div className="grid grid-cols-3 gap-0 w-full max-w-7xl">
//         {/* Left box: User Image */}
//         <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800">
//           <h2 className="text-lg font-semibold text-white mb-4">Your Photo</h2>
//           <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
//             {resizedUserImage ? (
//               <img
//                 src={resizedUserImage}
//                 alt="User uploaded"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center h-screen bg-gray-800">
//                 <span className="text-gray-400">No Image Available</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Middle box: Welcome */}
//         <div className="w-72 h-72 p-4 rounded-lg shadow-lg bg-gray-900 flex items-center justify-center">
//           <h2 className="text-xl font-bold text-white">Welcome ans let  me tell </h2>
//         </div>

//         {/* Right box: Bumble Image */}
//         <div className="w-full h- p-2 rounded-lg shadow-lg bg-gray-800">
//           <h2 className="text-lg font-semibold text-white mb-4">
//             Comparison Photo
//           </h2>
//           <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
//             {currentBumbleImage ? (
//               <img
//                 src={resizedBumbleImage || currentBumbleImage}
//                 alt="Bumble profile"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <span className="text-gray-400">
//                   {status || "Loading Bumble Image..."}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
