import React, { useEffect, useState } from 'react';

export const ComparisonView = ({ userImage, bumbleImage, status }) => {
  const [currentBumbleImage, setCurrentBumbleImage] = useState(null);

  useEffect(() => {
    console.log('Received user image:', userImage);    // Log user image
    console.log('Received bumble images:', bumbleImage); // Log bumble images

    if (bumbleImage && bumbleImage.length > 0) {
      // Initially show the first bumble image
      console.log('Setting initial bumble image for 5 seconds');
      setCurrentBumbleImage(bumbleImage[0]); // Show the first bumble image

      // After 5 seconds, show the second bumble image (if available)
      const timer = setTimeout(() => {
        console.log('5 seconds passed, switching to second bumble image');
        if (bumbleImage.length > 1) {
          setCurrentBumbleImage(bumbleImage[1]); // Switch to the second bumble image
        } else {
          console.log('No second bumble image available');
        }
      }, 5000);

      // Clean up the timer on component unmount or if bumbleImage changes
      return () => {
        console.log('Cleaning up timeout');
        clearTimeout(timer);
      };
    }
  }, [bumbleImage]); // Runs when bumbleImage prop changes

  useEffect(() => {
    console.log('Currently showing bumble image:', currentBumbleImage);
  }, [currentBumbleImage]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Left box: User Image */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Your Photo</h2>
        <div className="aspect-square relative rounded-lg overflow-hidden">
          <img 
            src={userImage} 
            alt="User uploaded" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right box: Bumble Image */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
          {currentBumbleImage ? (
            <img
              src={currentBumbleImage} // Display the current bumble image
              alt="Bumble profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">{status || 'Loading Bumble Image...'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};









// import React, { useEffect, useState } from 'react';

// export const ComparisonView = ({bumbleImage, status }) => {
//   const [showBothImages, setShowBothImages] = useState(false);

//   // Log the user image and bumble image to ensure they are passed correctly
//   useEffect(() => {
//     console.log('Received user image:', userImage);    // Log user image
//     console.log('Received bumble image:', bumbleImage); // Log bumble image

//     if (bumbleImage) {
//       // Initially show only the user image for 5 seconds
//       console.log('Setting up timeout to show both images after 5 seconds');
//       const timer = setTimeout(() => {
//         console.log('5 seconds passed, showing both images');
//         setShowBothImages(true); // After 5 seconds, show both images
//       }, 5000);

//       // Clean up the timeout if the component is unmounted or bumbleImage changes
//       return () => {
//         console.log('Cleaning up timeout');
//         clearTimeout(timer);
//       };
//     }
//   }, [bumbleImage]); // This effect only runs when bumbleImage changes

//   // Log the current state of the showBothImages
//   useEffect(() => {
//     console.log('showBothImages state:', showBothImages);
//   }, [showBothImages]);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
//         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
//           {bumbleImage ? (
//             <img
//               src={showBothImages ? bumbleImage : userImage} // If both images are to be shown, show bumble image
//               alt="Bumble profile"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <span className="text-gray-500">{status}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };











// import React, { useEffect, useState } from 'react';

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   const [showBothImages, setShowBothImages] = useState(false);

//   // Log the user image and bumble image to ensure they are passed correctly
//   useEffect(() => {
//     console.log('Received user image:', userImage);
//     console.log('Received bumble image:', bumbleImage);

//     if (bumbleImage) {
//       // Initially show only the user image for 5 seconds
//       console.log('Setting up timeout to show both images after 5 seconds');
//       const timer = setTimeout(() => {
//         console.log('5 seconds passed, showing both images');
//         setShowBothImages(true); // After 5 seconds, show both images
//       }, 5000);

//       // Clean up the timeout if the component is unmounted or bumbleImage changes
//       return () => {
//         console.log('Cleaning up timeout');
//         clearTimeout(timer);
//       };
//     }
//   }, [bumbleImage]); // This effect only runs when bumbleImage changes

//   // Log the current state of the showBothImages
//   useEffect(() => {
//     console.log('showBothImages state:', showBothImages);
//   }, [showBothImages]);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
//         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
//           {bumbleImage ? (
//             <img
//               src={showBothImages ? bumbleImage : userImage} // If both images are to be shown, show bumble image
//               alt="Bumble profile"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <span className="text-gray-500">{status}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };




// import React, { useEffect, useState } from 'react';

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   const [showBothImages, setShowBothImages] = useState(false);

//   // This effect runs when the component is mounted or the userImage changes
//   useEffect(() => {
//     if (bumbleImage) {
//       // Initially show only the first image (bumbleImage) for 5 seconds
//       const timer = setTimeout(() => {
//         setShowBothImages(true); // After 5 seconds, show both images
//       }, 5000);

//       // Clear the timeout if the component is unmounted or userImage changes
//       return () => clearTimeout(timer);
//     }
//   }, [bumbleImage]);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
//         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
//           {bumbleImage ? (
//             <img
//               src={showBothImages ? bumbleImage : userImage} // If both images are to be shown, use bumble image
//               alt="Bumble profile"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <span className="text-gray-500">{status}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };




















// import React from 'react';

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
//         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
//           {bumbleImage ? (
//             <img 
//               src={bumbleImage} 
//               alt="Bumble profile" 
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <span className="text-gray-500">{status}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };





// // ComparisonView.js
// import React from 'react';

// export const ComparisonView = ({ userImage, bumbleImage, status }) => {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
//         <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
//           {bumbleImage ? (
//             <img 
//               src={bumbleImage} 
//               alt="Bumble profile" 
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <span className="text-gray-500">{status}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };