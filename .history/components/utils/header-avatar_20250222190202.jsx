import * as Avatar from '@radix-ui/react-avatar';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';

/**
 * HeaderAvatar component specifically for the navigation header
 * Uses fixed sizing and maintains existing styling
 */
export const HeaderAvatar = ({ onClick }) => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  return (
    <Avatar.Root
      onClick={onClick}
      className="inline-flex h-[35px] w-[35px] border-2 border-blue-300
       items-center justify-center overflow-hidden rounded-full align-middle 
       lg:w-[45px] lg:h-[45px] transition-transform hover:scale-110"
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
  );
}; 