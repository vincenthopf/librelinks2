import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import usePhotoBook from '@/hooks/usePhotoBook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { signalIframe } from '@/utils/helpers';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/webp': true,
};

const PhotoUpload = () => {
  const { uploadPhoto, isUploading, readFileAsDataURL } = usePhotoBook();
  const [previewImage, setPreviewImage] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetUploadState = () => {
    setPreviewImage(null);
    setCurrentFile(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
  };

  const handleDrop = useCallback(
    async (files) => {
      const file = files[0];

      if (!file) return;

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

      try {
        const preview = await readFileAsDataURL(file);
        setPreviewImage(preview);
        setCurrentFile(file);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Failed to read file');
      }
    },
    [readFileAsDataURL]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleUpload = async () => {
    if (!currentFile) {
      toast.error('Please select an image to upload');
      return;
    }

    try {
      setUploadProgress(0);
      const base64Data = await readFileAsDataURL(currentFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      await uploadPhoto({
        file: base64Data,
        title,
        description,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Signal iframe to refresh after upload
      signalIframe();

      // Reset form after successful upload
      resetUploadState();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleCancel = () => {
    resetUploadState();
  };

  return (
    <div className="border rounded-lg p-4">
      {!previewImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">
              Drag & drop a photo here, or click to select
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: JPEG, PNG, WebP (max 4MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                onClick={handleCancel}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                disabled={isUploading}
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your photo"
                  disabled={isUploading}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description"
                  rows={2}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
