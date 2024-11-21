return (
  <div className="flex items-center justify-center h-screen">
    {/* Grid container */}
    <div className="grid grid-cols-3 gap-0">
      {/* Left box: User Image */}
      <div className="w-[150%] h-[150%] p-2 rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Your Photo</h2>
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

      {/* Middle box: Welcome */}
      <div className="w-72 h-72 p-4 rounded-lg shadow-lg bg-gray-900 flex items-center justify-center">
        <h2 className="text-xl font-bold text-white">Welcome</h2>
      </div>

      {/* Right box: Bumble Image */}
      <div className="w-[150%] h-[150%] p-2 rounded-lg shadow-lg bg-gray-800">
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
