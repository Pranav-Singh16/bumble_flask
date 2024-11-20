import React from 'react';
import { Upload } from 'lucide-react';

const UploadBox = ({ onImageUpload }) => (
  <div className="flex justify-center mb-8">
    <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500">
      <Upload className="w-12 h-12 text-gray-400" />
      <span className="mt-2 text-gray-600">Upload photo</span>
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => {
          console.log('File selected:', e.target.files[0]);
          onImageUpload(e);
        }} 
        accept="image/*" 
      />
    </label>
  </div>
);

export default UploadBox;