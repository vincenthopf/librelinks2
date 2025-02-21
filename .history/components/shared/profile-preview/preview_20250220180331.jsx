import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true`;

  return (
    <>
      <div className="relative border-[4px] lg:border-[8px] border-black rounded-[2.5rem] w-full max-w-[280px] lg:max-w-[320px] xl:max-w-[360px] aspect-[9/19] overflow-hidden mx-auto z-0">
        <div className="absolute inset-0 z-10">
          {currentUser && (
            <iframe
              seamless
              loading="lazy"
              title="preview"
              id="preview"
              className="h-full w-full"
              src={url}
            ></iframe>
          )}
        </div>
      </div>
    </>
  );
};

export default Preview;
