import React from 'react';
import { Upload } from 'lucide-react'; // Icon used for the upload button

const UploadBox = ({ onImageUpload }) => (
  <div className="h-screen flex items-center justify-center">
    {/* Upload button */}
    <label className="upload-box cursor-pointer bg-gray-700 text-white p-4 rounded-md shadow-md hover:bg-gray-600 transition flex items-center">
      <Upload className="w-6 h-6 text-gray-400 mr-2" /> {/* Icon with consistent size */}
      <span>Upload Photo</span> {/* Text is aligned */}
      <input
        type="file"
        className="hidden"
        onChange={onImageUpload} // Trigger image upload when file is selected
        accept="image/*" // Restrict file types to images
      />
    </label>
  </div>
);

export default UploadBox;
