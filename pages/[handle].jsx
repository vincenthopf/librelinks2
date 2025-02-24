/* eslint-disable @next/next/no-img-element */
import LinkCard from '@/components/core/user-profile/links-card';
import * as Avatar from '@radix-ui/react-avatar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useUser from '@/hooks/useUser';
import Loader from '@/components/utils/loading-spinner';
import NotFound from '@/components/utils/not-found';
import useLinks from '@/hooks/useLinks';
import Script from 'next/script';
import { SocialCards } from '@/components/core/user-profile/social-cards';
import Head from 'next/head';
import { UserAvatarSetting } from '@/components/utils/avatar';

const ProfilePage = () => {
  const { query } = useRouter();
  const { handle } = query;

  const {
    data: fetchedUser,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
  } = useUser(handle);

  const { data: userLinks, isFetching: isLinksFetching } = useLinks(
    fetchedUser?.id
  );

  const queryClient = useQueryClient();
  const [, setIsDataLoaded] = useState(false);

  const mutation = useMutation(
    async (id) => {
      await axios.patch(`/api/analytics/clicks/${id}`);
    },
    {
      onError: (error) => {
        toast.error(
          (error.response && error.response.data.message) || 'An error occurred'
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['links', fetchedUser?.id] });
        queryClient.invalidateQueries({ queryKey: ['users', fetchedUser?.id] });
      },
    }
  );

  const handleRegisterClick = async (id) => {
    await mutation.mutateAsync(id);
  };

  useEffect(() => {
    window.addEventListener('message', () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    });

    return () => {
      window.removeEventListener('message', () => {
        queryClient.invalidateQueries({ queryKey: ['links'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
      });
    };
  }, [queryClient]);

  useEffect(() => {
    if (fetchedUser && userLinks) {
      setIsDataLoaded(true);
    }
  }, [fetchedUser, userLinks]);

  if (isUserLoading) {
    return <Loader message={'Loading...'} bgColor="black" textColor="black" />;
  }

  if (!fetchedUser?.id) {
    return <NotFound />;
  }

  const buttonStyle = fetchedUser?.buttonStyle;
  const theme = {
    primary: fetchedUser?.themePalette.palette[0],
    secondary: fetchedUser?.themePalette.palette[1],
    accent: fetchedUser?.themePalette.palette[2],
    neutral: fetchedUser?.themePalette.palette[3],
  };

  return (
    <>
      <Head>
        <title> @{handle} | Librelinks</title>
      </Head>
      {!query.isIframe ? (
        <Script
          defer
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-host="https://api.us-east.tinybird.co"
          data-token={process.env.NEXT_PUBLIC_DATA_TOKEN}
        />
      ) : (
        ''
      )}
      <section
        style={{ background: theme.primary }}
        className="h-[100vh] w-[100vw] overflow-auto"
      >
        <div 
          className="flex items-center w-full flex-col mx-auto max-w-3xl justify-center px-8"
          style={{ 
            paddingTop: `${fetchedUser?.headToPicturePadding || 40}px`,
            paddingBottom: `${fetchedUser?.headToPicturePadding || 40}px`
          }}
        >
          {(isLinksFetching || isUserFetching) && (
            <div className="absolute -top-5 left-2">
              <Loader
                strokeWidth={7}
                width={15}
                height={15}
                bgColor={theme.accent}
              />
            </div>
          )}
          <UserAvatarSetting isPreview={true} handle={handle} />
          <p
            style={{ 
              color: theme.accent,
              fontSize: `${fetchedUser?.profileNameFontSize || 16}px`,
              marginTop: `${fetchedUser?.pictureToNamePadding || 16}px`
            }}
            className="font-bold text-white text-center mb-2 lg:mt-4"
          >
            {fetchedUser?.name}
          </p>
          {fetchedUser?.bio && (
            <div className="w-full">
              <p
                style={{ 
                  color: theme.accent,
                  fontSize: `${fetchedUser?.bioFontSize || 14}px`
                }}
                className="text-center mt-1 mb-4 break-words whitespace-pre-wrap"
              >
                {fetchedUser?.bio}
              </p>
            </div>
          )}
          <div className="min-w-max flex flex-wrap gap-2 mb-8 lg:w-fit lg:gap-4">
            {userLinks
              ?.filter((link) => link.isSocial && !link.archived)
              .map(({ id, title, url }) => {
                return (
                  <SocialCards
                    key={title}
                    title={title}
                    url={url}
                    color={theme.accent}
                    registerClicks={() => handleRegisterClick(id)}
                  />
                );
              })}
          </div>
          <div className="w-full flex flex-col" style={{ gap: `${fetchedUser?.betweenCardsPadding || 16}px` }}>
            {userLinks
              ?.filter((link) => !link.isSocial)
              .map(({ id, ...link }) => (
                <LinkCard
                  buttonStyle={buttonStyle}
                  theme={theme}
                  id={id}
                  key={id}
                  fontSize={fetchedUser?.linkTitleFontSize || 14}
                  cardHeight={fetchedUser?.linkCardHeight || 16}
                  {...link}
                  registerClicks={() => handleRegisterClick(id)}
                />
              ))}
          </div>

          {userLinks?.length === 0 && (
            <div className="flex justify-center">
              <h3
                style={{ color: theme.neutral }}
                className="pt-8 text-md text-white font-semibold lg:text-2xl"
              >
                Hello World 🚀
              </h3>
            </div>
          )}
        </div>
        <div className="my-10 lg:my-24" />
        {userLinks?.length > 0 ? (
          <footer className="relative left-1/2 bottom-0 transform -translate-x-1/2 w-[200px]">
            <p
              style={{ color: theme.accent }}
              className="text-sm text-semibold text-center w lg:text-lg"
            >
              Made with{' '}
              <Link
                className="font-semibold"
                target="_blank"
                href="https://librelinks.vercel.app/"
              >
                Librelinks
              </Link>
            </p>
          </footer>
        ) : (
          ''
        )}
      </section>
    </>
  );
};

export default ProfilePage;
