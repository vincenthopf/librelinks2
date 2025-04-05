import { GripVertical, BarChart, Copy } from 'lucide-react';
import PopoverDesktop from '../../shared/popovers/popover-desktop';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getApexDomain, timeAgo, signalIframe } from '@/utils/helpers';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArchiveSVG } from '@/components/utils/archive-svg';
import TooltipWrapper from '@/components/utils/tooltip';
import * as Switch from '@radix-ui/react-switch';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useCurrentUser from '@/hooks/useCurrentUser';

const LinkCard = props => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
  });

  const [isExpanded, setIsExpanded] = useState(props.alwaysExpandEmbed || false);

  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = currentUser?.id ?? null;

  const updateExpandMutation = useMutation(
    async newExpandValue => {
      const response = await axios.patch(`/api/links/${props.id}`, {
        alwaysExpandEmbed: newExpandValue,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['links', userId] });
        signalIframe('refresh');
      },
      onError: error => {
        setIsExpanded(!isExpanded);
        toast.error(error?.response?.data?.error || 'Failed to update link setting');
      },
    }
  );

  const handleToggleChange = async checked => {
    // Optimistic update
    setIsExpanded(checked);

    try {
      // Immediately invalidate queries and signal iframe
      queryClient.invalidateQueries({ queryKey: ['links', userId] });
      signalIframe('refresh');

      await toast.promise(updateExpandMutation.mutateAsync(checked), {
        loading: 'Updating setting...',
        success: 'Setting updated!',
        error: 'Failed to update setting', // Generic error for promise
      });
    } catch (error) {
      // Error is handled by mutation's onError, toast already shown.
      console.error('Error updating link expand setting:', error);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gap: props.buttonStyle.includes('edge-to-edge')
      ? '0px'
      : `${props.betweenCardsPadding ?? 16}px`,
  };

  const apexDomain = getApexDomain(props.url);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(props.url);
    toast.success('Copied URL to clipboard!');
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className=" flex bg-white items-center p-2 rounded-lg drop-shadow-md my-5"
      >
        <div
          className=" text-gray-400 text-sm hover:bg-blue-100 rounded-sm p-[3px]"
          {...attributes}
          {...listeners}
        >
          <GripVertical color="grey" size={17} />
        </div>
        {!props.archived ? (
          <Image
            src={`${GOOGLE_FAVICON_URL}${apexDomain}`}
            alt={apexDomain}
            className="h-8 w-8 blur-0 rounded-full sm:h-10 sm:w-10"
            unoptimized
            width={20}
            height={20}
            priority
          />
        ) : (
          <TooltipWrapper title="This link has been archived by you" component={<ArchiveSVG />} />
        )}
        <div className="flex-1 p-2 h-full relative">
          <div className="flex">
            <div className="w-full pr-3">
              <div className="grid mb-1 w-full grid-cols-[minmax(0,_90%)] items-baseline">
                <div className=" w-full row-start-1 col-start-1 items-center">
                  <div
                    target="_blank"
                    className="flex items-center max-w-full rounded-[2px] outline-offset-2 outline-2 gap-2 lg:gap-4"
                  >
                    <p className="truncate w-fit max-w-[80px] text-gray-500 text-sm whitespace-nowrap overflow-hidden font-semibold lg:w-fit lg:max-w-[150px]">
                      {props.title}
                    </p>

                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          onClick={handleCopyLink}
                          href="#"
                          className="group rounded-full bg-gray-100 p-1.5 transition-all duration-75 hover:scale-105 hover:bg-blue-100 active:scale-95"
                        >
                          <Copy color="grey" size={15} />
                        </Link>

                        <Link
                          href="/admin/analytics"
                          className="flex items-center space-x-1 rounded-md bg-gray-100 px-2 py-0.5 transition-all duration-75 hover:scale-105 hover:bg-blue-100 active:scale-100"
                        >
                          <BarChart color="grey" size={15} />
                          <p className="whitespace-nowrap text-sm text-gray-500">
                            {props.clicks}
                            <span className="ml-1 hidden sm:inline-block">clicks</span>
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="">
                  <div className="row-start-1 col-start-1 inline-flex">
                    <a
                      target="_blank"
                      href={props.url}
                      className="flex items-center max-w-full rounded-[2px] outline-offset-2 outline-2"
                    >
                      <p className="text-gray-500 w-[200px] text-sm lg:w-[320px] whitespace-nowrap overflow-hidden font-semibold text-ellipsis">
                        {props.url}
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <button className="flex justify-center items-center ">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor={`expand-switch-${props.id}`}
                    className="whitespace-nowrap text-sm text-gray-500"
                  >
                    Always Expand
                  </label>
                  <Switch.Root
                    id={`expand-switch-${props.id}`}
                    checked={isExpanded}
                    onCheckedChange={handleToggleChange}
                    className="w-[34px] h-[20px] bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer"
                  >
                    <Switch.Thumb className="block w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[16px]" />
                  </Switch.Root>
                </div>

                {/* <small className="hidden whitespace-nowrap text-sm text-gray-500 sm:block">
                  Added {timeAgo(props.createdAt, true)}
                </small> */}
                <PopoverDesktop {...props} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkCard;
