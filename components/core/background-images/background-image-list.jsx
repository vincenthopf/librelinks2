import React, { useState } from 'react';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';

const BackgroundImageList = ({ backgroundImages, onEditName, onDelete }) => {
  const [editingImageId, setEditingImageId] = useState(null);
  const [newName, setNewName] = useState('');

  const startEditing = image => {
    setEditingImageId(image.id);
    setNewName(image.name);
  };

  const cancelEditing = () => {
    setEditingImageId(null);
    setNewName('');
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error('Background image name cannot be empty');
      return;
    }
    try {
      await onEditName(editingImageId, newName);
      toast.success('Background image name updated');
      setEditingImageId(null);
      setNewName('');
    } catch (error) {
      console.error('Error updating background image name:', error);
    }
  };

  if (!backgroundImages?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          No background images found. Upload your first background image to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {backgroundImages.map(image => (
        <div
          key={image.id}
          className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
        >
          <div className="relative h-48">
            <img src={image.imageUrl} alt={image.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            {editingImageId === image.id ? (
              <div className="mb-4">
                <label
                  htmlFor={`name-${image.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <Input
                  id={`name-${image.id}`}
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="mb-2"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button onClick={handleSaveName} size="sm">
                    <Check size={16} className="mr-1" /> Save
                  </Button>
                  <Button onClick={cancelEditing} variant="outline" size="sm">
                    <X size={16} className="mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate" title={image.name}>
                    {image.name}
                  </h3>
                </div>

                {image.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{image.description}</p>
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
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => startEditing(image)}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => onDelete(image.id)}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BackgroundImageList;
