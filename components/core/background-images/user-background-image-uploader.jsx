import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define query keys locally
const QUERY_KEYS = {
  backgroundImages: 'backgroundImages',
  userBackgroundImages: 'userBackgroundImages',
  currentUser: 'currentUser',
};

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

// Helper to read file as data URL
const readFileAsDataURL = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const UserBackgroundImageUploader = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const queryClient = useQueryClient();

  const resetUploadState = () => {
    setPreviewImage(null);
    setCurrentFile(null);
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    // Cancel current upload if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async base64Image => {
      setIsUploading(true);

      // Create a new AbortController for this upload
      abortControllerRef.current = new AbortController();

      try {
        const response = await axios.post(
          '/api/user/background-images',
          { file: base64Image },
          {
            signal: abortControllerRef.current.signal,
            onUploadProgress: progressEvent => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              }
            },
          }
        );

        return response.data;
      } catch (error) {
        if (axios.isCancel(error)) {
          throw new Error('Upload canceled');
        }
        throw error;
      }
    },
    onSuccess: data => {
      toast.success('Background image uploaded successfully!');
      // Update cached data
      queryClient.invalidateQueries([QUERY_KEYS.userBackgroundImages]);
      resetUploadState();
    },
    onError: error => {
      if (error.message !== 'Upload canceled') {
        toast.error(`Upload failed: ${error.message}`);
        setError(error.message);
      } else {
        // Use toast with custom style instead of toast.info
        toast('Upload cancelled', {
          icon: '🔔',
          style: {
            background: '#F0F9FF',
            color: '#0284C7',
          },
        });
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onSettled: () => {
      // Ensure uploading state is false even if mutation is cancelled quickly
      setIsUploading(false);
    },
  });

  const onDrop = useCallback(
    async acceptedFiles => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null); // Clear previous errors

      // Validate file type
      if (!ALLOWED_FILE_TYPES[file.type]) {
        const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat().join(', ');
        setError(`Invalid file type. Allowed types: ${allowedExtensions}`);
        toast.error(`Invalid file type. Allowed types: ${allowedExtensions}`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
        setError(`File size exceeds ${maxSizeMB}MB limit.`);
        toast.error(`File size exceeds ${maxSizeMB}MB limit.`);
        return;
      }

      setCurrentFile(file); // Store file for potential retry?

      try {
        resetUploadState(); // Reset before starting new upload process
        setCurrentFile(file); // Set file again after reset

        const base64Data = await readFileAsDataURL(file);
        setPreviewImage(base64Data); // Show preview immediately
        await uploadMutation.mutateAsync(base64Data);
      } catch (readError) {
        console.error('Error reading file:', readError);
        setError('Failed to read file.');
        toast.error('Failed to read file.');
        resetUploadState();
      }
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isUploading,
  });

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetUploadState();
  };

  return (
    <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
      <h4 className="text-md font-semibold mb-3 text-gray-700">Upload Your Background</h4>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ease-in-out',
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          isUploading ? 'cursor-not-allowed bg-gray-100' : '',
          previewImage ? 'border-solid border-gray-200 p-2' : '' // Adjust padding/border when preview is shown
        )}
      >
        <input {...getInputProps()} disabled={isUploading} />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <p className="text-sm font-semibold text-gray-700 mb-2">Uploading...</p>
            <p className="text-sm text-gray-600 mb-2">{uploadProgress}%</p>
            {currentFile && (
              <p className="text-xs text-gray-500 truncate w-full px-4">{currentFile.name}</p>
            )}
            <Button variant="outline" size="sm" onClick={handleCancelUpload} className="mt-3">
              Cancel
            </Button>
          </div>
        ) : previewImage ? (
          <div className="relative flex flex-col items-center justify-center h-32 group">
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-full max-w-full object-contain rounded"
            />
            {/* Overlay to change/remove */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center rounded">
              <Button
                variant="destructive"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  resetUploadState();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X size={16} className="mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Upload className="w-8 h-8 mb-2" />
            {isDragActive ? (
              <p className="text-sm font-medium">Drop the image here...</p>
            ) : (
              <>
                <p className="text-sm font-medium">Drag & drop or click to upload</p>
                <p className="text-xs mt-1">Supports JPG, PNG, GIF, WebP (Max 10MB)</p>
              </>
            )}
            {error && <p className="text-red-500 text-xs mt-2">Error: {error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBackgroundImageUploader;
