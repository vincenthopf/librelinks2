import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const BackgroundImageUploader = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      description: '',
      isPublic: true,
    },
  });

  const isPublic = watch('isPublic');

  const uploadMutation = useMutation({
    mutationFn: async formData => {
      const { data } = await axios.post('/api/background-images/bulk', formData, {
        onUploadProgress: progressEvent => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['backgroundImages']);
      toast.success('Background images uploaded successfully');
      reset();
      setSelectedFiles([]);
      setUploadProgress(0);
    },
    onError: error => {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload background images');
    },
  });

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push({ file, reason: 'size' });
        return;
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        invalidFiles.push({ file, reason: 'type' });
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      const sizeErrors = invalidFiles.filter(f => f.reason === 'size').map(f => f.file.name);
      const typeErrors = invalidFiles.filter(f => f.reason === 'type').map(f => f.file.name);

      if (sizeErrors.length > 0) {
        toast.error(`Some files exceed 10MB size limit: ${sizeErrors.join(', ')}`);
      }

      if (typeErrors.length > 0) {
        toast.error(`Some files have unsupported formats: ${typeErrors.join(', ')}`);
      }
    }

    if (validFiles.length === 0) return;

    // Convert valid files to preview objects
    Promise.all(
      validFiles.map(file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = event => {
            resolve({
              name: file.name,
              preview: event.target.result,
              file,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    ).then(previewFiles => {
      setSelectedFiles(previewFiles);
    });
  };

  const removeFile = index => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const onSubmit = async data => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsUploading(true);
    try {
      // Prepare form data with all files and common settings
      const formData = {
        ...data,
        images: selectedFiles.map(file => ({
          name: file.name.split('.')[0], // Use filename as default name
          imageData: file.preview,
        })),
      };

      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-lg font-medium mb-4">Upload Background Images</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter a description for these images"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={checked => setValue('isPublic', checked)}
          />
          <Label htmlFor="isPublic">Make these backgrounds public</Label>
        </div>

        <div className="mt-4">
          {selectedFiles.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 mb-2">
                  Click to upload images (JPG, PNG, WebP)
                </span>
                <span className="text-xs text-gray-400">Max size: 10MB per image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  multiple
                />
              </label>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedFiles.length} image(s) selected
                </span>
                <Button type="button" variant="outline" size="sm" onClick={clearAllFiles}>
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>

              <label className="mt-4 cursor-pointer flex justify-center items-center py-2 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Add more images</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  multiple
                />
              </label>
            </div>
          )}
        </div>

        <Button type="submit" disabled={isUploading} className="w-full">
          {isUploading
            ? `Uploading... ${uploadProgress}%`
            : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Background Image${selectedFiles.length !== 1 ? 's' : ''}`}
        </Button>
      </form>
    </div>
  );
};

export default BackgroundImageUploader;
