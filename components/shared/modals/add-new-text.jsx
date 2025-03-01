import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import Image from 'next/image';
import closeSVG from '@/public/close_button.svg';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useCurrentUser from '@/hooks/useCurrentUser';
import useTexts from '@/hooks/useTexts'; // This hook will need to be created
import { signalIframe } from '@/utils/helpers';

const AddTextModal = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? null;
  const { data: userTexts } = useTexts(userId); // This hook will need to be created

  const queryClient = useQueryClient();

  const order = userTexts?.length || 0;

  const addTextMutation = useMutation(
    async ({ title, content, order }) => {
      setIsLoading(true);
      try {
        const response = await axios.post('/api/texts', {
          title,
          content,
          order,
        });
        return response.data;
      } finally {
        setIsLoading(false);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['texts', userId] });
        setTitle('');
        setContent('');
        signalIframe();
      },
    }
  );

  const submitText = async () => {
    if (title.trim() === '') {
      toast.error('Please enter a title');
      return;
    }
    await toast.promise(
      addTextMutation.mutateAsync({ title, content, order }),
      {
        loading: 'Adding text...',
        success: 'Text added successfully',
        error: 'An error occurred while adding the text',
      }
    );
  };

  return (
    <>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm bg-gray-800 bg-opacity-50 w-full" />
        <Dialog.Content className="contentShow fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 sm:p-8 lg:max-w-3xl w-[350px] sm:w-[500px] shadow-lg md:max-w-lg max-md:max-w-lg focus:outline-none">
          <div className="flex flex-row justify-between items-center mb-4">
            <Dialog.Title className="text-xl text-center font-medium mb-2 sm:mb-0 sm:mr-4">
              Create a new Text
            </Dialog.Title>
            <Dialog.Close className="flex flex-end justify-end">
              <div className="p-2 rounded-full flex justify-center items-center bg-gray-100 hover:bg-gray-300">
                <Image priority src={closeSVG} alt="close" />
              </div>
            </Dialog.Close>
          </div>
          <form name="add-text-form" className="mb-6">
            <div className="relative mb-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full h-10 px-4 py-6 mb-2 leading-tight text-gray-700 border rounded-2xl appearance-none focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                placeholder="Title"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="block w-full h-32 px-4 py-3 mb-2 leading-tight text-gray-700 border rounded-2xl appearance-none focus:outline-none focus:shadow-outline"
                id="content"
                placeholder="Content"
                disabled={isLoading}
              />
            </div>

            <Dialog.Close asChild>
              <button
                onClick={submitText}
                disabled={isLoading}
                className={`inline-block w-full px-4 py-4 leading-none 
                     			 text-lg mt-2 text-white rounded-3xl 
                      			${
                              !isLoading
                                ? 'bg-slate-800 hover:bg-slate-900'
                                : 'bg-slate-500'
                            }`}
              >
                {isLoading ? 'Creating...' : 'Create Text'}{' '}
                <span role="img" aria-label="sparkling star">
                  ✨
                </span>
              </button>
            </Dialog.Close>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </>
  );
};

export default AddTextModal;
