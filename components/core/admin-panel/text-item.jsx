import { useState } from 'react';
import { GripVertical, FileText, MoreVertical } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Dialog from '@radix-ui/react-dialog';
import { formatDistance } from 'date-fns';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { signalIframe } from '@/utils/helpers';
import useCurrentUser from '@/hooks/useCurrentUser';
import EditTextModal from '../../shared/modals/edit-text';

// To be implemented later
// import EditTextModal from '../../shared/modals/edit-text';

const timeAgo = (dateString, shortFormat = false) => {
  try {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), {
      addSuffix: false,
    });
  } catch (e) {
    return 'some time ago';
  }
};

// Popover desktop component for edit/delete options
const PopoverDesktop = props => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  // Delete text mutation
  const deleteTextMutation = useMutation(
    async () => {
      await axios.delete(`/api/texts/${props.id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['texts', currentUser?.id]);
      },
      onError: () => {
        toast.error('Failed to delete text');
      },
    }
  );

  const handleDeleteText = async () => {
    try {
      await toast.promise(deleteTextMutation.mutateAsync(), {
        loading: 'Deleting text...',
        success: 'Text deleted successfully',
        error: 'Failed to delete text',
      });
    } catch (error) {
      console.error('Error deleting text:', error);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex justify-center items-center rounded-full bg-gray-100 p-1.5 hover:bg-gray-200">
          <MoreVertical color="grey" size={17} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={5}
          className="bg-white rounded-lg overflow-hidden shadow-lg w-44 border"
        >
          <div className="flex flex-col">
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="px-4 py-2.5 text-left hover:bg-gray-100 text-sm">
                  Edit text
                </button>
              </Dialog.Trigger>
              <EditTextModal {...props} />
            </Dialog.Root>
            <button
              onClick={handleDeleteText}
              className="px-4 py-2.5 text-left hover:bg-gray-100 text-sm text-red-500"
            >
              Delete text
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const TextItem = props => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="bg-white rounded-lg drop-shadow-md my-5">
        <div className="flex items-center p-2">
          <div
            className="text-gray-400 text-sm hover:bg-blue-100 rounded-sm p-[3px]"
            {...attributes}
            {...listeners}
          >
            <GripVertical color="grey" size={17} />
          </div>

          {/* Text Icon */}
          <div className="h-10 w-10 flex justify-center items-center bg-gray-100 rounded-full">
            <FileText size={20} color="#6B7280" />
          </div>

          <div className="flex-1 p-2 h-full relative">
            <div className="flex">
              <div className="w-full pr-3">
                <div className="grid mb-1 w-full grid-cols-[minmax(0,_90%)] items-baseline">
                  <div className="w-full row-start-1 col-start-1 items-center">
                    <div className="flex items-center max-w-full rounded-[2px] outline-offset-2 outline-2 gap-2 lg:gap-4">
                      <p className="w-fit text-gray-900 font-semibold">{props.title}</p>
                    </div>
                  </div>

                  <div className="">
                    <div className="row-start-1 col-start-1 inline-flex">
                      <p className="text-gray-500 w-[200px] text-sm lg:w-[320px] whitespace-pre-wrap overflow-hidden">
                        {props.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="flex justify-center items-center">
                <div className="flex items-center">
                  {/* <small className="mr-8 hidden whitespace-nowrap text-sm text-gray-500 sm:block">
                    Added {timeAgo(props.createdAt, true)}
                  </small> */}
                  <PopoverDesktop {...props} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TextItem;
