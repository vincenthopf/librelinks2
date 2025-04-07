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
        // Invalidate both links and user data to ensure preview has latest expansion states
        queryClient.invalidateQueries({ queryKey: ['links', userId] });
        queryClient.invalidateQueries({ queryKey: ['users', currentUser?.handle] });

        // Force a refresh of the preview to show the changes
        signalIframe('refresh');

        // Additional delayed refresh to ensure the iframe updates
        setTimeout(() => signalIframe('refresh'), 300);
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
      // Immediately update the preview with the new state
      signalIframe('refresh');

      // Then perform the actual API update
      await toast.promise(updateExpandMutation.mutateAsync(checked), {
        loading: 'Updating setting...',
        success: () => {
          // Force another refresh after successful update to ensure preview shows the change
          setTimeout(() => signalIframe('refresh'), 100);
          return 'Setting updated!';
        },
        error: 'Failed to update setting', // Generic error for promise
      });

      // Invalidate queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ['links', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', currentUser?.handle] });
    } catch (error) {
      // Error is handled by mutation's onError, toast already shown.
      console.error('Error updating link expand setting:', error);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gap:
      props.buttonStyle && props.buttonStyle.includes('edge-to-edge')
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
        className=" flex bg-white items-center py-2 px-1 rounded-lg drop-shadow-md my-5"
      >
        <div
          className=" text-gray-400 text-xs hover:bg-blue-100 rounded-sm p-0 cursor-grab flex-shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical color="grey" size={14} />
        </div>
        {/* Favicon - Removed mt-1 */}
        {!props.archived ? (
          <Image
            src={`${GOOGLE_FAVICON_URL}${apexDomain}`}
            alt={apexDomain}
            className="h-8 w-8 rounded-full flex-shrink-0"
            unoptimized
            width={24}
            height={24}
            priority
          />
        ) : (
          <TooltipWrapper title="This link has been archived by you" component={<ArchiveSVG />} />
        )}
        {/* Content Area - Removed items-center from parent, reverting padding */}
        <div className="flex-1 p-0.5 pr-6 sm:pr-8 h-full relative overflow-hidden">
          <div className="flex flex-col">
            {/* Row 1: Title */}
            <div className="flex items-center max-w-full rounded-[2px] outline-offset-2 outline-2 gap-1">
              <p className="truncate text-gray-900 text-base font-semibold">{props.title}</p>
            </div>

            {/* ---- Default Layout for Regular Links ---- */}
            {!props.isSocial && (
              <>
                {/* Row 2: URL */}
                <div className="flex items-center max-w-full rounded-[2px] outline-offset-2 outline-2 mt-0.5">
                  <p className="text-gray-500 text-sm font-semibold truncate">{props.url}</p>
                </div>
                {/* Row 3: Controls area */}
                <div className={`flex justify-between items-center flex-shrink-0 mt-1.5 space-x-2`}>
                  {/* Always Expand Switch */}
                  <div className="flex items-center space-x-1.5">
                    <label
                      htmlFor={`expand-switch-${props.id}`}
                      className="whitespace-nowrap text-xs text-gray-500"
                    >
                      Always Expand
                    </label>
                    <Switch.Root
                      id={`expand-switch-${props.id}`}
                      checked={isExpanded}
                      onCheckedChange={handleToggleChange}
                      className="w-[24px] h-[14px] sm:w-[28px] sm:h-[16px] bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer flex-shrink-0"
                    >
                      <Switch.Thumb className="block w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[12px] sm:data-[state=checked]:translate-x-[14px]" />
                    </Switch.Root>
                  </div>
                  {/* Popover */}
                  <div className="flex-shrink-0">
                    <PopoverDesktop {...props} />
                  </div>
                </div>
              </>
            )}

            {/* ---- Compact Layout for Social Links ---- */}
            {props.isSocial && (
              <div className="flex justify-between items-center mt-0.5">
                {/* Row 2 Left: URL */}
                <p className="text-gray-500 text-sm font-semibold truncate">{props.url}</p>
                {/* Row 2 Right: Popover */}
                <div className="flex-shrink-0">
                  <PopoverDesktop {...props} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkCard;
