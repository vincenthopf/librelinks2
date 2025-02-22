import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true`;

  return (
    <>
      <div className="relative border-[4px] lg:border-[8px] border-black rounded-[2.5rem] w-72 lg:w-80 xl:w-96 aspect-[9/19] overflow-hidden max-w-sm mx-auto z-0">
        <div className="absolute inset-0 z-10 ">
          {currentUser && (
            <iframe
              key={JSON.stringify({
                headToPicturePadding: currentUser?.headToPicturePadding,
                pictureToNamePadding: currentUser?.pictureToNamePadding,
                betweenCardsPadding: currentUser?.betweenCardsPadding,
                linkCardHeight: currentUser?.linkCardHeight
              })}
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
