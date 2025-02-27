/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import useCurrentUser from '@/hooks/useCurrentUser';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import UploadModal from '@/components/shared/modals/upload-modal';
import { TinyLoader } from '@/components/utils/tiny-loader';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Balancer } from 'react-wrap-balancer';
import useUser from '@/hooks/useUser';
import { UserAvatarSetting } from '@/components/utils/avatar';
import { signalIframe } from '@/utils/helpers';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import CustomAlert from '@/components/shared/alerts/custom-alert';
import useMediaQuery from '@/hooks/use-media-query';
import { signOut } from 'next-auth/react';
import Head from 'next/head';
import PaddingSelector from '@/components/core/custom-padding/padding-selector';
import ProfileImageSizeSelector from '@/components/core/custom-sizes/profile-image-size-selector';
import { FrameCustomizer } from '@/components/core/profile-frames/frame-customizer';

const Settings = () => {
  const { data: currentUser } = useCurrentUser();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [handle, setHandle] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const { isMobile } = useMediaQuery();

  const queryClient = useQueryClient();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  useEffect(() => {
    setUsername(fetchedUser?.name);
    setBio(fetchedUser?.bio);
    setImage(fetchedUser?.image);
    setHandle(fetchedUser?.handle);
  }, [
    fetchedUser?.name,
    fetchedUser?.bio,
    fetchedUser?.image,
    fetchedUser?.handle,
  ]);

  // edit profile details
  const editMutation = useMutation(
    async ({ bio, username, image, handle }) => {
      await axios.patch('/api/edit', {
        bio,
        username,
        image,
        handle,
      });
    },
    {
      onError: () => {
        toast.error('An error occurred');
      },
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Changes applied');
        signalIframe();
      },
    }
  );

  const handleSubmit = async () => {
    toast.loading('Applying changes');
    await editMutation.mutateAsync({ bio, username, image, handle });
  };

  // delete profile picture
  const handleDeletePfp = async () => {
    if (image === '') {
      toast.error('There is nothing to delete');
      return;
    } else {
      toast.loading('Applying changes');
      await editMutation.mutateAsync({ bio, username, image: '', handle });
    }
  };

  // delete user's account
  const deleteMutation = useMutation(
    async () => {
      await axios.delete('/api/edit');
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        router.push('/register');
      },
    }
  );

  const handleDeleteUser = async () => {
    await toast.promise(deleteMutation.mutateAsync(), {
      loading: 'Deleting your account',
      success: 'So long partner 🫡',
      error: 'An error occured',
    });
    await signOut();
  };

  const deleteAlertProps = {
    action: handleDeleteUser,
    title: 'Are you absolutely sure?',
    desc: 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
    confirmMsg: 'Yes, delete account',
  };

  return (
    <>
      <Head>
        <title>Librelinks | Profile </title>
      </Head>
      <Layout>
        <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-scroll">
          <div className="max-w-[690px] mx-auto my-10">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="flex border-b mb-8">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Image
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'frame'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('frame')}
              >
                Frame Template
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'padding'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('padding')}
              >
                Padding
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'danger'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('danger')}
              >
                Danger Zone
              </button>
            </div>

            {activeTab === 'profile' && (
              <div>
                <div className="rounded-2xl border bg-white p-lg w-full h-auto pb-10">
                  <div className="flex flex-col lg:flex-row items-start gap-x-8 p-10">
                    <div className="flex-shrink-0 flex items-center justify-center mx-auto lg:mx-0 mb-6 lg:mb-0 min-w-[100px]">
                      {fetchedUser ? (
                        <UserAvatarSetting />
                      ) : (
                        <TinyLoader color="black" stroke={1} size={100} />
                      )}
                    </div>
                    <div className="flex flex-col gap-4 w-full lg:max-w-[490px]">
                      <div className="relative overflow-hidden">
                        <Dialog.Root>
                          <Dialog.Trigger asChild>
                            <button className="relative w-full h-[45px] border rounded-3xl border-[#000] outline-none text-white bg-slate-900 p-2 hover:bg-slate-700">
                              Pick an image
                            </button>
                          </Dialog.Trigger>
                          <UploadModal
                            value={image}
                            onChange={(image) => setImage(image)}
                            submit={handleSubmit}
                          />
                        </Dialog.Root>
                        <div className="mt-4 mb-4">
                          <ProfileImageSizeSelector />
                        </div>
                        <button
                          onClick={handleDeletePfp}
                          className="w-full h-[45px] border border-[#aaa] 
                          outline-none font-semibold text-slate-900 bg-white p-2 rounded-3xl hover:bg-gray-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-10">
                    <textarea
                      value={bio ?? ''}
                      onChange={(e) => setBio(e.target.value)}
                      onBlur={handleSubmit}
                      placeholder="@Bio"
                      className="outline-none w-full p-4 h-[120px] rounded-lg border-2
                    bg-gray-100 text-black focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'frame' && (
              <div>
                <div className="rounded-2xl border bg-white p-lg w-full h-auto">
                  <div className="p-6">
                    <FrameCustomizer
                      template={fetchedUser?.frameTemplate || 'none'}
                      color={fetchedUser?.frameColor || '#000000'}
                      thickness={fetchedUser?.frameThickness ?? 0}
                      rotation={fetchedUser?.frameRotation || 0}
                      pictureRotation={fetchedUser?.pictureRotation || 0}
                      syncRotation={fetchedUser?.syncRotation ?? true}
                      animation={
                        fetchedUser?.frameAnimation || {
                          type: null,
                          enabled: false,
                          config: {},
                        }
                      }
                      name={fetchedUser?.name || ''}
                      onTemplateChange={async (template) => {
                        try {
                          await axios.patch('/api/frame', {
                            frameTemplate: template,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Frame template updated');
                        } catch (error) {
                          toast.error('Failed to update frame template');
                        }
                      }}
                      onColorChange={async (color) => {
                        try {
                          await axios.patch('/api/frame', {
                            frameColor: color,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Frame color updated');
                        } catch (error) {
                          toast.error('Failed to update frame color');
                        }
                      }}
                      onThicknessChange={async (thickness) => {
                        try {
                          await axios.patch('/api/frame', {
                            frameThickness: thickness,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Frame thickness updated');
                        } catch (error) {
                          console.error('Frame thickness update error:', error);
                          toast.error('Failed to update frame thickness');
                        }
                      }}
                      onRotationChange={async (rotation) => {
                        try {
                          await axios.patch('/api/frame', {
                            frameRotation: rotation,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Frame rotation updated');
                        } catch (error) {
                          toast.error('Failed to update frame rotation');
                        }
                      }}
                      onPictureRotationChange={async (rotation) => {
                        try {
                          await axios.patch('/api/frame', {
                            pictureRotation: rotation,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Picture rotation updated');
                        } catch (error) {
                          toast.error('Failed to update picture rotation');
                        }
                      }}
                      onSyncRotationChange={async (sync) => {
                        try {
                          await axios.patch('/api/frame', {
                            syncRotation: sync,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Rotation sync updated');
                          return true;
                        } catch (error) {
                          console.error('Sync rotation update error:', error);
                          toast.error('Failed to update rotation sync');
                          throw error;
                        }
                      }}
                      onAnimationChange={async (animation) => {
                        try {
                          await axios.patch('/api/frame', {
                            frameAnimation: animation,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Frame animation updated');
                        } catch (error) {
                          toast.error('Failed to update frame animation');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'padding' && (
              <div>
                <div className="rounded-2xl border bg-white p-lg w-full h-auto">
                  <div className="p-6">
                    <PaddingSelector />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div>
                <h3 className="mb-4 text-gray-600 text-sm">
                  <Balancer>
                    Deleting your account permanently deletes your page and all
                    your data.
                  </Balancer>
                </h3>
                <div className="w-full h-auto border bg-white rounded-lg p-6">
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <button
                        className="border-none w-full lg:w-[200px] rounded-lg h-auto p-3
                        text-white bg-red-600 hover:bg-red-500"
                      >
                        Delete Account
                      </button>
                    </AlertDialog.Trigger>
                    <CustomAlert {...deleteAlertProps} />
                  </AlertDialog.Root>
                </div>
              </div>
            )}
          </div>

          {isMobile ? (
            <div className="h-[100px] mb-24" />
          ) : (
            <div className="h-[40px] mb-12" />
          )}
        </div>
      </Layout>
    </>
  );
};

export default Settings;
