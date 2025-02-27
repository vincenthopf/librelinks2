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
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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
      name: '',
      description: '',
      isPublic: true,
    },
  });

  const isPublic = watch('isPublic');

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await axios.post('/api/background-images', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['backgroundImages']);
      toast.success('Background image uploaded successfully');
      reset();
      setPreviewImage(null);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to upload background image'
      );
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image size should not exceed 4MB');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreviewImage(null);
  };

  const onSubmit = async (data) => {
    if (!previewImage) {
      toast.error('Please select an image');
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync({
        ...data,
        imageData: previewImage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-lg font-medium mb-4">Upload New Background Image</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="Enter a name for this background"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter a description"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={(checked) => setValue('isPublic', checked)}
          />
          <Label htmlFor="isPublic">Make this background public</Label>
        </div>

        <div className="mt-4">
          {!previewImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 mb-2">
                  Click to upload an image (JPG, PNG, WebP)
                </span>
                <span className="text-xs text-gray-400">Max size: 4MB</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <Button type="submit" disabled={isUploading} className="w-full">
          {isUploading ? 'Uploading...' : 'Upload Background Image'}
        </Button>
      </form>
    </div>
  );
};

export default BackgroundImageUploader;
