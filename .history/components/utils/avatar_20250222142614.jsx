import * as Avatar from '@radix-ui/react-avatar';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';

export const UserAvatar = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  const size = fetchedUser?.profileImageSize || 35;
  const lgSize = Math.floor(size * 1.3); // 30% larger for desktop

  return (
    <>
      <Avatar.Root
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        className="inline-flex border-2 border-blue-300
         items-center justify-center overflow-hidden rounded-full align-middle lg:w-[${lgSize}px] lg:h-[${lgSize}px]"
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

export const UserAvatarSetting = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  const size = fetchedUser?.profileImageSize || 100;

  return (
    <>
      <Avatar.Root
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        className="inline-flex border-2 border-blue-400
         items-center justify-center overflow-hidden rounded-full align-middle"
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
