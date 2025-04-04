import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import Image from 'next/image';
import closeSVG from '@/public/close_button.svg';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useCurrentUser from '@/hooks/useCurrentUser';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { signalIframe } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PhotoUpload from '../../core/photo-book/photo-upload';

const AddPhotoBookModal = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Upload photos

  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? null;
  const { photos } = usePhotoBook();
  const queryClient = useQueryClient();

  // Check if photo book section exists (based on photoBookOrder)
  const hasPhotoBookSection =
    currentUser?.photoBookOrder !== null && currentUser?.photoBookOrder !== undefined;

  // Check if there are existing photos
  const hasExistingPhotos = Array.isArray(photos) && photos.length > 0;

  // This is a simplified implementation until we have the full photo books feature
  const createPhotoBookMutation = useMutation(
    async ({ title, description }) => {
      setIsLoading(true);
      try {
        // For now, we'll just create a "virtual" photo book by updating photoBookOrder
        // NOTE: We're only setting photoBookOrder because photoBookTitle and photoBookDescription
        // fields don't exist in the database schema yet
        const response = await axios.patch('/api/users/update', {
          photoBookOrder: 0, // Add at the beginning of links
          // Store title and description in local state or context if needed
        });
        return response.data;
      } finally {
        setIsLoading(false);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['photobook', userId] });
        toast.success('Photo book added to your profile');
        setTitle('');
        setDescription('');
        setStep(1);
      },
      onError: error => {
        console.error('Error creating photo book:', error);
        toast.error('Failed to create photo book');
      },
    }
  );

  const handleSubmit = async e => {
    e.preventDefault();
    if (title.trim() === '') {
      toast.error('Please enter a title for your photo book');
      return;
    }

    await createPhotoBookMutation.mutateAsync({ title, description });
  };

  const handleContinue = () => {
    if (title.trim() === '') {
      toast.error('Please enter a title for your photo book');
      return;
    }
    setStep(2);
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm bg-gray-800 bg-opacity-50 w-full" />
      <Dialog.Content className="contentShow fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 sm:p-8 lg:max-w-3xl w-[90%] max-w-[500px] shadow-lg focus:outline-none">
        <div className="flex flex-row justify-between items-center mb-4">
          <Dialog.Title className="text-xl font-medium mb-2 sm:mb-0 sm:mr-4">
            {hasPhotoBookSection
              ? 'Add Photos to Your Photo Book'
              : hasExistingPhotos
                ? 'Restore Photo Book'
                : step === 1
                  ? 'Create a Photo Book'
                  : 'Upload Photos'}
          </Dialog.Title>
          <Dialog.Close className="flex flex-end justify-end">
            <div className="p-2 rounded-full flex justify-center items-center bg-gray-100 hover:bg-gray-300">
              <Image priority src={closeSVG} alt="close" />
            </div>
          </Dialog.Close>
        </div>
        {hasPhotoBookSection ? (
          // If the photo book section already exists, show the photo upload component directly
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">Add photos to your existing photo book</p>
            <PhotoUpload embedded={true} />
          </div>
        ) : hasExistingPhotos ? (
          // If user has photos but no photo book section (was deleted), show restoration option
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              You have photos but your photo book section was removed. Create a new photo book to
              display your existing photos.
            </p>
            <form
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              <div>
                <Label htmlFor="title">Photo Book Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="My Photo Collection"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="A collection of my favorite photos..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Dialog.Close asChild>
                  <Button variant="outline" type="button" disabled={isLoading}>
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Restoring...' : 'Restore Photo Book'}
                </Button>
              </div>
            </form>
          </div>
        ) : // If this is a new photo book section with no existing photos
        step === 1 ? (
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              handleContinue();
            }}
          >
            <div>
              <Label htmlFor="title">Photo Book Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="My Photo Collection"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A collection of my favorite photos..."
                className="mt-1"
                rows={3}
              />
            </div>
            <p className="text-xs text-gray-500 italic mt-2">
              Note: Currently, title and description are only for your reference and are not saved
              in the database.
            </p>
            <div className="flex justify-end space-x-2 pt-4">
              <Dialog.Close asChild>
                <Button variant="outline" type="button" disabled={isLoading}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isLoading}>
                Continue
              </Button>
            </div>
          </form>
        ) : (
          // Step 2: Photo upload
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Upload photos to your new photo book: <strong>{title}</strong>
            </p>
            <PhotoUpload embedded={true} />
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Back to Details
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Photo Book'}
              </Button>
            </div>
          </div>
        )}
        Please remember to add photos to your Photo Book after you create it.
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default AddPhotoBookModal;
