/* eslint-disable @next/next/no-img-element */
import * as Dialog from '@radix-ui/react-dialog';
import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import closeSVG from '@/public/close_button.svg';
import { Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import useCurrentUser from '@/hooks/useCurrentUser';
import toast from 'react-hot-toast';
import axios from 'axios';
import { CloudinaryImage } from '@/components/shared/cloudinary-image';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // Reduce to 4MB to account for base64 overhead
const ALLOWED_FILE_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'image/webp': [],
};
const MAX_RETRIES = 3;

const UploadModal = ({ onChange, value, submit }) => {
  const [imageUrl, setImageUrl] = useState(value);
  const { data: currentUser } = useCurrentUser();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const abortControllerRef = useRef(null);
  
  const queryClient = useQueryClient();

  const resetUploadState = () => {
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
    setRetryCount(0);
    setCurrentFile(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const uploadToCloudinary = async (file) => {
    try {
      if (retryCount >= MAX_RETRIES) {
        throw new Error('Max retries reached');
      }

      setIsUploading(true);
      setError(null);
      
      abortControllerRef.current = new AbortController();
      
      // Convert file to base64
      const base64Data = await readFileAsDataURL(file);
      
      const response = await axios.post('/api/upload', 
        { file: base64Data },
        {
          signal: abortControllerRef.current.signal,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        }
      );

      const { url } = response.data;
      setImageUrl(url);
      onChange(url);
      setIsUploading(false);
      setUploadProgress(100);
      setCurrentFile(null);
      queryClient.invalidateQueries(['users', currentUser?.handle]);
      toast.success('Image uploaded successfully');
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.error('Upload cancelled');
        return;
      }
      
      setError(err.response?.data?.message || err.message || 'Failed to upload image');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    async (files) => {
      const file = files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be under 4MB to account for encoding overhead.');
        return;
      }

      if (!ALLOWED_FILE_TYPES[file.type]) {
        toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        return;
      }

      resetUploadState();
      setCurrentFile(file);
      await uploadToCloudinary(file);
    },
    [currentUser?.handle, onChange, queryClient]
  );

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop: handleDrop,
    accept: ALLOWED_FILE_TYPES,
    disabled: isUploading,
  });

  const handleUpload = () => {
    if (imageUrl) {
      submit();
      setImageUrl('');
      resetUploadState();
    } else {
      toast.error('No file selected: Pick an image first');
    }
  };

  const handleCancel = () => {
    resetUploadState();
  };

  const handleRetry = async () => {
    if (!currentFile || !error) return;
    
    const nextRetry = retryCount + 1;
    if (nextRetry >= MAX_RETRIES) {
      toast.error('Max retries reached. Please try again.');
      return;
    }
    
    setRetryCount(nextRetry);
    setError(null);
    
    // Add exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, nextRetry), 8000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    await uploadToCloudinary(currentFile);
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm bg-gray-800 bg-opacity-50 sm:w-full" />
      <Dialog.Content
        className="contentShow z-40 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  rounded-2xl bg-white p-6 sm:p-8 lg:max-w-3xl w-[350px] sm:w-[500px] shadow-lg 
                  md:max-w-lg max-md:max-w-lg focus:outline-none"
      >
        <div className="flex flex-row justify-between items-center mb-4">
          <Dialog.Title className="text-xl text-center font-medium mb-2 sm:mb-0 sm:mr-4">
            Upload Image
          </Dialog.Title>
          <Dialog.Close className="flex flex-end justify-end">
            <div 
              className="p-2 rounded-full flex justify-center items-center bg-gray-100 hover:bg-gray-300"
              onClick={handleCancel}
            >
              <Image priority src={closeSVG} alt="close" />
            </div>
          </Dialog.Close>
        </div>
        
        <div
          {...getRootProps({
            className: `w-full h-[200px] flex justify-center border-2 border-dashed rounded-md p-10 my-4 
                      ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} 
                      ${error ? 'border-red-500' : 'border-gray-300'}`,
          })}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-red-500">
              <AlertCircle size={40} className="mb-2" />
              <p className="text-sm text-center mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center text-blue-500 hover:text-blue-700"
              >
                <RefreshCw size={16} className="mr-1" />
                Retry Upload
              </button>
            </div>
          ) : imageUrl ? (
            <div className="flex flex-col items-center">
              <div className="relative">
                <CloudinaryImage
                  src={imageUrl}
                  alt="uploaded-image"
                  width={100}
                  height={100}
                  className="overflow-hidden border-2 border-blue-500 object-cover rounded-full"
                />
                {uploadProgress === 100 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <a
                href="#"
                className="text-sm text-center text-blue-900 mt-4 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setImageUrl('');
                  resetUploadState();
                }}
              >
                Change photo
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-center text-slate-800 text-md font-semibold mb-2 sm:text-lg">
                  Choose files or drag and drop
                </h3>
                <h3 className="text-center text-slate-800">
                  (Max file size 4MB)
                </h3>
              </div>
              <div className="my-10 absolute top-1/2 transform -translate-y-1/2 lg:my-6">
                <Upload size={40} className="text-gray-400" />
              </div>
            </>
          )}
        </div>

        <Dialog.Close asChild>
          <button
            onClick={handleUpload}
            disabled={isUploading || !imageUrl}
            className={`inline-block w-full px-4 py-4 leading-none text-lg mt-2 text-white rounded-3xl
                      ${isUploading || !imageUrl 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-slate-900 hover:bg-slate-700'}`}
          >
            {isUploading ? 'Uploading...' : 'Upload image'}{' '}
            {!isUploading && (
              <span role="img" aria-label="rocket">
                🚀
              </span>
            )}
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default UploadModal;
