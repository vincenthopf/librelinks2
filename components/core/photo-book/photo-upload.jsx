import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { Upload, Loader } from 'lucide-react';

const PhotoUpload = ({ onComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { uploadMutation, uploadMultipleMutation } = usePhotoBook();

  const handleFilesSelected = useCallback(
    async acceptedFiles => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      setUploading(true);
      setProgress(0);

      try {
        // Handle multiple files
        if (acceptedFiles.length > 1) {
          const photoDataArray = [];

          // Convert all files to base64
          for (const file of acceptedFiles) {
            // Validate file size
            if (file.size > 10 * 1024 * 1024) {
              toast.error(`File ${file.name} exceeds 10MB size limit`);
              continue;
            }

            const reader = new FileReader();
            const filePromise = new Promise(resolve => {
              reader.onload = event => {
                resolve({
                  file: event.target.result,
                  title: '',
                  description: '',
                });
              };
              reader.readAsDataURL(file);
            });

            photoDataArray.push(await filePromise);
          }

          if (photoDataArray.length === 0) {
            setUploading(false);
            return;
          }

          // Upload all photos
          const batchSize = Math.min(photoDataArray.length, 10);
          setProgress(10);

          const result = await uploadMultipleMutation.mutateAsync({
            photos: photoDataArray,
          });

          setProgress(100);

          if (result.success) {
            toast.success(result.message);
            if (onComplete) onComplete(result.results);
          } else {
            toast.error('Failed to upload some photos');
          }
        }
        // Handle single file
        else {
          const file = acceptedFiles[0];

          // Validate file size
          if (file.size > 10 * 1024 * 1024) {
            toast.error('File size exceeds 10MB limit');
            setUploading(false);
            return;
          }

          const reader = new FileReader();
          reader.onload = async event => {
            setProgress(50);

            try {
              const result = await uploadMutation.mutateAsync({
                file: event.target.result,
                title: '',
                description: '',
              });

              setProgress(100);

              if (result.success) {
                toast.success('Photo uploaded successfully!');
                if (onComplete) onComplete([result.image]);
              } else {
                toast.error(result.message || 'Failed to upload photo');
              }
            } catch (error) {
              console.error('Upload error:', error);
              toast.error('Error uploading photo');
            }
          };

          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Upload process error:', error);
        toast.error('Error during upload process');
      } finally {
        setUploading(false);
      }
    },
    [uploadMutation, uploadMultipleMutation, onComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true, // Enable multiple file selection
    maxSize: 10 * 1024 * 1024, // 10MB max size per file
    onDrop: handleFilesSelected,
  });

  return (
    <div
      className="w-full h-64 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
      style={{
        borderColor: isDragActive ? 'var(--highlight-color)' : 'var(--border-color)',
        backgroundColor: isDragActive ? 'rgba(var(--highlight-color-rgb), 0.05)' : 'transparent',
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {uploading ? (
        <div className="flex flex-col items-center">
          <Loader size={48} className="animate-spin text-gray-400" />
          <p className="mt-2 text-sm text-center">Uploading... {progress}%</p>
        </div>
      ) : (
        <>
          <Upload size={48} className="text-gray-400" />
          <p className="mt-4 text-center">
            {isDragActive
              ? 'Drop your photos here...'
              : 'Drag & drop photos here, or click to select'}
          </p>
          <p className="mt-2 text-sm text-center text-gray-500">
            Upload multiple photos at once (max 10MB per photo)
          </p>
        </>
      )}
    </div>
  );
};

export default PhotoUpload;
