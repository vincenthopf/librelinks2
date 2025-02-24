import * as Avatar from '@radix-ui/react-avatar';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { CloudinaryImage } from '@/components/shared/cloudinary-image';

/**
 * UserAvatar component for preview panels
 * Uses dynamic sizing based on profileImageSize setting
 */
export const UserAvatar = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  const size = fetchedUser?.profileImageSize || 70;

  return (
    <Avatar.Root
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      className="inline-flex border-2 border-blue-300
       items-center justify-center overflow-hidden rounded-full align-middle"
    >
      {fetchedUser?.image ? (
        <CloudinaryImage
          src={fetchedUser.image}
          alt="avatar"
          width={size}
          height={size}
          className="h-full w-full rounded-[inherit] object-cover"
        />
      ) : (
        <Avatar.Fallback
          className="leading-1 text-slate-900 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium"
          delayMs={100}
        >
          @
        </Avatar.Fallback>
      )}
    </Avatar.Root>
  );
};

/**
 * UserAvatarSetting component for the settings page and preview panels
 * @param {Object} props - Component props
 * @param {boolean} [props.isPreview=false] - Whether the avatar is being shown in a preview panel
 * @param {string} [props.handle] - Optional handle for public view
 * Uses fixed 100px size in settings view and dynamic sizing in preview mode
 */
export const UserAvatarSetting = ({ isPreview = false, handle }) => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(handle || currentUser?.handle);

  // Use fixed 100px size for settings view, dynamic size for preview
  const size = isPreview ? (fetchedUser?.profileImageSize || 100) : 100;

  return (
    <Avatar.Root
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      className="inline-flex border-2 border-blue-400
       items-center justify-center overflow-hidden rounded-full align-middle"
    >
      {fetchedUser?.image ? (
        <CloudinaryImage
          src={fetchedUser.image}
          alt="avatar"
          width={size}
          height={size}
          className="h-full w-full rounded-[inherit] object-cover"
          priority={!isPreview}
        />
      ) : (
        <Avatar.Fallback
          className="leading-1 flex h-full w-full items-center justify-center bg-white text-slate-900 text-[35px] font-medium"
          delayMs={100}
        >
          @
        </Avatar.Fallback>
      )}
    </Avatar.Root>
  );
};