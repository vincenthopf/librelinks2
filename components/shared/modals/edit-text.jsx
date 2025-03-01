import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import closeSVG from '@/public/close_button.svg';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useCurrentUser from '@/hooks/useCurrentUser';
import { signalIframe } from '@/utils/helpers';

const EditTextModal = (props) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? null;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (props.title) {
      setNewTitle(props.title);
    }
    if (props.content) {
      setNewContent(props.content);
    }
  }, [props.title, props.content]);

  const updateTextMutation = useMutation(
    async ({ title, content }) => {
      setIsLoading(true);
      try {
        const response = await axios.put(`/api/texts/${props.id}`, {
          title,
          content,
        });
        return response.data;
      } finally {
        setIsLoading(false);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['texts', userId] });
        signalIframe();
      },
    }
  );

  const handleEditText = async () => {
    if (newTitle.trim() === '') {
      toast.error('Please enter a title');
      return;
    }
    await toast.promise(
      updateTextMutation.mutateAsync({ title: newTitle, content: newContent }),
      {
        loading: 'Updating text...',
        success: 'Text updated successfully',
        error: 'An error occurred while updating the text',
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
              Edit Text
            </Dialog.Title>
            <Dialog.Close className="flex flex-end justify-end">
              <div className="p-2 rounded-full flex justify-center items-center bg-gray-100 hover:bg-gray-300">
                <Image priority src={closeSVG} alt="close" />
              </div>
            </Dialog.Close>
          </div>
          <form name="edit-text-form" className="mb-6">
            <div className="relative mb-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="block w-full h-10 px-4 py-6 mb-2 leading-tight text-gray-700 border rounded-2xl appearance-none focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                placeholder="Title"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="block w-full h-32 px-4 py-3 mb-2 leading-tight text-gray-700 border rounded-2xl appearance-none focus:outline-none focus:shadow-outline"
                id="content"
                placeholder="Content"
                disabled={isLoading}
              />
            </div>

            <Dialog.Close asChild>
              <button
                onClick={handleEditText}
                disabled={isLoading}
                className={`inline-block w-full px-4 py-4 leading-none 
                     			 text-lg mt-2 text-white rounded-3xl 
                      			${
                              !isLoading
                                ? 'bg-slate-800 hover:bg-slate-900'
                                : 'bg-slate-500'
                            }`}
              >
                {isLoading ? 'Updating...' : 'Update Text'}{' '}
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

export default EditTextModal;
