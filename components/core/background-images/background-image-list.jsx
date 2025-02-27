import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const BackgroundImageList = ({ backgroundImages }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (imageId) => {
      await axios.delete(`/api/background-images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['backgroundImages']);
      toast.success('Background image deleted successfully');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete background image'
      );
    },
  });

  const handleDelete = async (imageId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this background image? This will remove it from any users who have it selected.'
      )
    ) {
      try {
        await deleteMutation.mutateAsync(imageId);
      } catch (error) {
        console.error('Error deleting background image:', error);
      }
    }
  };

  if (!backgroundImages?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          No background images found. Upload your first background image to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {backgroundImages.map((image) => (
        <div
          key={image.id}
          className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
        >
          <div className="relative h-48">
            <img
              src={image.imageUrl}
              alt={image.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              <h3 className="font-medium truncate">{image.name}</h3>
            </div>
          </div>
          <div className="p-4">
            {image.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {image.description}
              </p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
              <span>{image.isPublic ? 'Public' : 'Private'}</span>
              <span>
                Added{' '}
                {formatDistanceToNow(new Date(image.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => handleDelete(image.id)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BackgroundImageList;
