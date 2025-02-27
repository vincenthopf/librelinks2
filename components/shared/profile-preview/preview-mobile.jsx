/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo, useRef } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import LinkCard from '@/components/core/user-profile/links-card';
import Link from 'next/link';
import Loader from '@/components/utils/loading-spinner';
import NotFound from '@/components/utils/not-found';
import useLinks from '@/hooks/useLinks';
import { SocialCards } from '@/components/core/user-profile/social-cards';
import useCurrentUser from '@/hooks/useCurrentUser';
import { X } from 'lucide-react';
import { UserAvatarSetting } from '@/components/utils/avatar';
import { getCurrentBaseURL } from '@/utils/helpers';

const PreviewMobile = ({ close }) => {
  const [, setIsDataLoaded] = useState(false);
  const iframeRef = useRef(null);
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true`;

  const { data: userLinks } = useLinks(currentUser?.id);

  const theme = useMemo(
    () => ({
      primary: currentUser?.themePalette.palette[0],
      secondary: currentUser?.themePalette.palette[1],
      accent: currentUser?.themePalette.palette[2],
      neutral: currentUser?.themePalette.palette[3],
    }),
    [currentUser?.themePalette.palette]
  );

  const socialLinks = useMemo(
    () => userLinks?.filter((link) => link.isSocial && !link.archived),
    [userLinks]
  );

  const nonSocialLinks = useMemo(
    () => userLinks?.filter((link) => !link.isSocial),
    [userLinks]
  );

  useEffect(() => {
    if (currentUser && userLinks) {
      setIsDataLoaded(true);
    }
  }, [currentUser, userLinks]);

  useEffect(() => {
    const handleMessage = () => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isUserLoading) {
    return <Loader message={'Loading...'} bgColor="black" textColor="black" />;
  }

  if (!currentUser?.id) {
    return <NotFound />;
  }

  return (
    <>
      <section
        style={{ background: theme.primary }}
        className="h-[100vh] w-[100vw] overflow-auto relative"
      >
        <iframe
          ref={iframeRef}
          key={`${currentUser?.headToPicturePadding}-${currentUser?.pictureToNamePadding}-${currentUser?.betweenCardsPadding}-${currentUser?.linkCardHeight}-${currentUser?.profileImageSize}`}
          seamless
          loading="lazy"
          title="preview"
          id="preview-mobile"
          className="w-full h-full"
          style={{ height: '100%' }}
          src={url}
        />
        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={close}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
            }}
            className="px-6 py-2 rounded-full text-white border-2 border-white hover:bg-black/50 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </section>
    </>
  );
};

export default PreviewMobile;
