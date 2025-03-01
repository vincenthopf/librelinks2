import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CloudinaryImage } from '@/components/shared/cloudinary-image';
import { Trash2, X } from 'lucide-react';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { toast } from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';

const PhotoEditModal = ({ photo, isOpen, onClose }) => {
  const [title, setTitle] = useState(photo.title || '');
  const [description, setDescription] = useState(photo.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updatePhoto, deletePhoto } = usePhotoBook();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updatePhoto({
        id: photo.id,
        title,
        description,
      });

      // Signal iframe to refresh after update
      signalIframe();

      onClose();
    } catch (error) {
      console.error('Failed to update photo:', error);
      toast.error('Failed to update photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this photo? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePhoto(photo.id);

      // Signal iframe to refresh after delete
      signalIframe();

      onClose();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none overflow-auto">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Edit Photo
          </Dialog.Title>

          <Dialog.Close className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100">
            <X size={20} />
          </Dialog.Close>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative w-full max-w-xs">
                <CloudinaryImage
                  src={photo.url}
                  alt={photo.title || 'Photo'}
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title"
                disabled={isSubmitting || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description"
                rows={3}
                disabled={isSubmitting || isDeleting}
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                  className="border px-3 py-1 rounded hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PhotoEditModal;
