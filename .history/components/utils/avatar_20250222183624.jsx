import * as Avatar from '@radix-ui/react-avatar';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { getFrameStyles, getFrameClassName, DEFAULT_FRAME_TYPE, DEFAULT_FRAME_COLOR } from '@/utils/frame-helpers';

/**
 * UserAvatar component for preview panels
 * Uses dynamic sizing based on profileImageSize setting
 */
export const UserAvatar = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  const size = fetchedUser?.profileImageSize || 70;
  const frameType = fetchedUser?.profileFrameType || DEFAULT_FRAME_TYPE;
  const frameColor = fetchedUser?.profileFrameColor || DEFAULT_FRAME_COLOR;

  return (
    <>
      <Avatar.Root
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderColor: frameColor,
          ...getFrameStyles(frameType)
        }}
        className={`inline-flex border-2 items-center justify-center overflow-hidden ${getFrameClassName(frameType)} align-middle`}
      >
        <Avatar.Image
          className="h-full w-full rounded-[inherit] object-cover"
          src={fetchedUser && fetchedUser?.image}
          referrerPolicy="no-referrer"
          alt="avatar"
        />
        <Avatar.Fallback
          className="leading-1 text-slate-900 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium"
          delayMs={100}
        >
          @
        </Avatar.Fallback>
      </Avatar.Root>
    </>
  );
};

/**
 * UserAvatarSetting component for the settings page
 * Uses dynamic sizing based on profileImageSize setting
 */
export const UserAvatarSetting = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  const size = fetchedUser?.profileImageSize || 100;
  const frameType = fetchedUser?.profileFrameType || DEFAULT_FRAME_TYPE;
  const frameColor = fetchedUser?.profileFrameColor || DEFAULT_FRAME_COLOR;

  return (
    <>
      <Avatar.Root
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderColor: frameColor,
          ...getFrameStyles(frameType)
        }}
        className={`inline-flex border-2 items-center justify-center overflow-hidden ${getFrameClassName(frameType)} align-middle`}
      >
        <Avatar.Image
          className="h-full w-full rounded-[inherit] object-cover"
          src={fetchedUser && fetchedUser?.image}
          referrerPolicy="no-referrer"
          alt="avatar"
        />
        <Avatar.Fallback
          className="leading-1 flex h-full w-full items-center justify-center bg-white text-slate-900 text-[35px] font-medium"
          delayMs={100}
        >
          @
        </Avatar.Fallback>
      </Avatar.Root>
    </>
  );
};
