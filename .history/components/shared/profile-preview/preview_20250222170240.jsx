import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true`;

  return (
    <>
      <div className="relative border-[4px] lg:border-[8px] border-black rounded-[2.5rem] aspect-[9/19] overflow-hidden mx-auto">
        <div className="relative h-full w-full">
          {currentUser && (
            <iframe
              key={currentUser.headToPicturePadding + currentUser.pictureToNamePadding + currentUser.betweenCardsPadding + currentUser.linkCardHeight}
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
