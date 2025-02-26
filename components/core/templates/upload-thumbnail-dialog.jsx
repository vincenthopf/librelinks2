import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import CloudinaryImage from '@/components/shared/cloudinary-image';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const UploadThumbnailDialog = ({
  templateId,
  onUploadComplete,
  open,
  onOpenChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const abortControllerRef = useRef(null);

  const resetUploadState = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setCurrentFile(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadToCloudinary = async (file) => {
    try {
      setIsUploading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      const base64Data = await readFileAsDataURL(file);

      const response = await axios.post(
        `/api/templates/${templateId}/thumbnail`,
        { file: base64Data },
        {
          signal: abortControllerRef.current.signal,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      const { url } = response.data;
      setImageUrl(url);
      onUploadComplete(url);
      setIsUploading(false);
      setUploadProgress(100);
      setCurrentFile(null);
      toast.success('Thumbnail uploaded successfully');
      onOpenChange(false);
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.error('Upload cancelled');
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to upload thumbnail'
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    async (files) => {
      const file = files[0];

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be under 4MB');
        return;
      }

      if (!ALLOWED_FILE_TYPES[file.type]) {
        toast.error(
          'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
        );
        return;
      }

      resetUploadState();
      setCurrentFile(file);
      await uploadToCloudinary(file);
    },
    [templateId, onUploadComplete]
  );

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop: handleDrop,
    accept: ALLOWED_FILE_TYPES,
    disabled: isUploading,
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[450px] bg-white rounded-lg p-6">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Upload Template Thumbnail
          </Dialog.Title>

          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer relative min-h-[200px] flex items-center justify-center',
              isUploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />

            {isUploading ? (
              <div className="text-center">
                <div className="mb-2">Uploading... {uploadProgress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : imageUrl ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <CloudinaryImage
                    src={imageUrl}
                    alt="template-thumbnail"
                    width={100}
                    height={100}
                    className="rounded-lg border-2 border-blue-500 object-cover"
                  />
                  {uploadProgress === 100 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  className="text-sm text-blue-600 mt-4 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageUrl('');
                    resetUploadState();
                  }}
                >
                  Choose different image
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">
                  Drop your image here, or click to select
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Maximum file size: 4MB
                </p>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => {
                resetUploadState();
                onOpenChange(false);
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UploadThumbnailDialog;
