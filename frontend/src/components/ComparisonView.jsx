import React, { useEffect, useState } from "react";

export const ComparisonView = ({ userImage, bumbleImage, status }) => {
  const [currentBumbleImage, setCurrentBumbleImage] = useState(null);
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
    // Resize the first Bumble image when it's provided
    if (bumbleImage && bumbleImage.length > 0) {
      resizeImage(bumbleImage[0], (resizedImage) => {
        setResizedBumbleImage(resizedImage);
        setCurrentBumbleImage(bumbleImage[0]); // Display the first Bumble image
      });

      const timer = setTimeout(() => {
        if (bumbleImage.length > 1) {
          resizeImage(bumbleImage[1], setCurrentBumbleImage); // Switch to the second Bumble image
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
      <div className="grid grid-cols-3 gap-0 w-full max-w-7xl">
        {/* Left box: User Image */}
        <div className="w-full h-full p-2 rounded-lg shadow-lg bg-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Your Photo</h2>
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
            {resizedUserImage ? (
              <img
                src={resizedUserImage}
                alt="User uploaded"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center h-screen bg-gray-800">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle box: Welcome */}
        <div className="w-72 h-72 p-4 rounded-lg shadow-lg bg-gray-900 flex items-center justify-center">
          <h2 className="text-xl font-bold text-white">Welcome ans let  me tell </h2>
        </div>

        {/* Right box: Bumble Image */}
        <div className="w-full h- p-2 rounded-lg shadow-lg bg-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">
            Comparison Photo
          </h2>
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
            {currentBumbleImage ? (
              <img
                src={resizedBumbleImage || currentBumbleImage}
                alt="Bumble profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">
                  {status || "Loading Bumble Image..."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
