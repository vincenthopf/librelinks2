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
import useTexts from '@/hooks/useTexts';
import { usePhotoBook } from '@/hooks/usePhotoBook';

const PreviewMobile = ({ close }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef(null);
  const dimensionUpdateTimeoutRef = useRef(null);
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { photos } = usePhotoBook();

  const { data: userLinks } = useLinks(currentUser?.id);
  const { data: userTexts } = useTexts(currentUser?.id);

  // Create a value that changes when link orders change
  const linksOrderString = useMemo(() => {
    if (!userLinks) return '';
    // Sort the links by order to create a consistent ordering before joining
    return [...userLinks]
      .sort((a, b) => a.order - b.order)
      .map(link => `${link.id}-${link.order}`)
      .join('|');
  }, [userLinks]);

  // Create a value that changes when text orders change
  const textsOrderString = useMemo(() => {
    if (!userTexts) return '';
    // Sort the texts by order to create a consistent ordering before joining
    return [...userTexts]
      .sort((a, b) => a.order - b.order)
      .map(text => `${text.id}-${text.order}`)
      .join('|');
  }, [userTexts]);

  // Create a comprehensive string representation of links for dependency tracking
  const linksSnapshot = useMemo(() => {
    if (!userLinks) return '';
    // Sort links for consistency before stringifying
    return JSON.stringify(
      [...userLinks]
        .sort((a, b) => a.order - b.order)
        .map(link => ({
          id: link.id,
          order: link.order,
          title: link.title, // Include title
          url: link.url, // Include url
          archived: link.archived, // Include archived status
          isSocial: link.isSocial, // Include type
          alwaysExpandEmbed: link.alwaysExpandEmbed, // Include expansion state
        }))
    );
  }, [userLinks]);

  const refreshDependencies = [
    currentUser?.handle,
    currentUser?.photoBookLayout,
    userTexts?.length,
    photos?.length,
    linksSnapshot, // Use the comprehensive snapshot
    textsOrderString, // Add dependency on text orders
    currentUser?.photoBookOrder, // Add dependency on photo book order
  ];

  const theme = useMemo(
    () => ({
      primary: currentUser?.themePalette?.palette?.[0] || '#ffffff',
      secondary: currentUser?.themePalette?.palette?.[1] || '#f8f8f8',
      accent: currentUser?.themePalette?.palette?.[2] || '#000000',
      neutral: currentUser?.themePalette?.palette?.[3] || '#888888',
    }),
    [currentUser?.themePalette?.palette]
  );

  const socialLinks = useMemo(
    () => userLinks?.filter(link => link.isSocial && !link.archived),
    [userLinks]
  );

  const nonSocialLinks = useMemo(() => userLinks?.filter(link => !link.isSocial), [userLinks]);

  // Restore effects
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, refreshDependencies);

  useEffect(() => {
    if (currentUser && userLinks) {
      setIsDataLoaded(true);
    }
  }, [currentUser, userLinks]);

  // Restore effects
  useEffect(() => {
    const handleMessage = event => {
      // Handle string messages (standard format)
      if (
        event.data &&
        typeof event.data === 'string' &&
        ['refresh', 'update_user', 'update_links'].includes(event.data) &&
        iframeRef.current
      ) {
        // DO NOT force refresh via setRefreshKey
        // Instead, FORWARD the message to the iframe
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(event.data, '*');
            console.log('Mobile Preview: Forwarded string message to iframe:', event.data);
          } catch (error) {
            console.error('Mobile Preview: Error forwarding string message:', error);
          }
        }
        return;
      }

      // Handle structured messages (new format)
      if (event.data && typeof event.data === 'object' && event.data.type && iframeRef.current) {
        const { type } = event.data;

        // Forward ALL structured messages to the iframe
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(event.data, '*');
            console.log('Mobile Preview: Forwarded structured message to iframe:', event.data);
          } catch (error) {
            console.error('Mobile Preview: Error forwarding structured message:', error);
          }
        }
        // Remove the special handling for 'update_dimensions' that used setRefreshKey as fallback
        // Remove the final setRefreshKey fallback
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Keep timeout cleanup if needed, though dimensionUpdateTimeoutRef is no longer used here
      // if (dimensionUpdateTimeoutRef.current) {
      //   clearTimeout(dimensionUpdateTimeoutRef.current);
      // }
    };
  }, []);

  // Restore effects (but this refresh might still be problematic - monitor)
  useEffect(() => {
    if (currentUser?.photoBookLayout) {
      // Let's keep this one for now, as layout change might NEED a full refresh
      // If still issues, this might need replacing with a postMessage call too
      setRefreshKey(prev => prev + 1);
    }
  }, [currentUser?.photoBookLayout]);

  if (isUserLoading) {
    return <Loader message={'Loading...'} bgColor="black" textColor="black" />;
  }

  if (!currentUser?.id) {
    return <NotFound />;
  }

  // Construct URL only when currentUser is available
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser.handle}?isIframe=true&photoBookLayout=${currentUser.photoBookLayout || 'grid'}`;

  return (
    <>
      <section
        style={{ background: theme.primary }}
        className="h-[100vh] w-full overflow-auto relative"
      >
        <iframe
          ref={iframeRef}
          seamless
          loading="lazy"
          title="preview"
          id="preview-mobile"
          className="w-full h-full"
          style={{ height: '100%' }}
          src={url}
        />
        <div className="fixed top-4 right-4 z-[100]">
          <button
            onClick={close}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg border-2 border-white/20 hover:bg-black/50 transition-all duration-200"
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
        </div>
      </section>
    </>
  );
};

export default PreviewMobile;
