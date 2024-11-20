import React from 'react';

export const ComparisonView = ({ userImage, bumbleImage, status }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Comparison Photo</h2>
        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
          {bumbleImage ? (
            <img 
              src={bumbleImage} 
              alt="Bumble profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">{status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};





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