import React, { useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import Footer from '@/components/layout/footer/footer';
import ButtonSelector from '@/components/core/custom-buttons/buttons-selector';
import TextCardButtonSelector from '@/components/core/custom-buttons/text-card-button-selector';
import ThemesPicker from '@/components/core/custom-page-themes/themes-picker';
import FontSizeSelector from '@/components/core/custom-font-sizes/font-size-selector';
import FontSelector from '@/components/core/custom-fonts/font-selector';
import ImageSizeSelector from '@/components/core/custom-image-sizes/image-size-selector';
import SizeSelector from '@/components/core/custom-sizes/size-selector';
import BackgroundImageSelector from '@/components/core/background-images/background-image-selector';
import Head from 'next/head';
import { FrameCustomizer } from '@/components/core/profile-frames/frame-customizer';
import PaddingSelector from '@/components/core/custom-padding/padding-selector';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';
import { debounce } from 'lodash';

const Customize = () => {
  const [activeTab, setActiveTab] = useState('themes');
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  // Debounced API call function for frame color
  const debouncedFrameColorUpdate = useCallback(
    debounce(async color => {
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
    }, 1000), // 1000ms debounce
    [queryClient, signalIframe]
  );

  return (
    <>
      <Head>
        <title>Librelinks | Customize</title>
      </Head>
      <Layout>
        <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-auto">
          <div className="max-w-[690px] mx-auto my-10">
            <h1 className="text-2xl font-bold mb-6">Customize</h1>

            {/* Tab Navigation */}
            <div className="flex border-b mb-8 flex-wrap">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'themes'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('themes')}
              >
                Themes
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'backgrounds'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('backgrounds')}
              >
                Background Images
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'buttons'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('buttons')}
              >
                Buttons
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
                  activeTab === 'fonts'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('fonts')}
              >
                Fonts
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'sizes'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('sizes')}
              >
                Sizes
              </button>
            </div>

            {/* Themes Tab */}
            {activeTab === 'themes' && (
              <div className="space-y-8">
                <ThemesPicker />
              </div>
            )}

            {/* Background Images Tab */}
            {activeTab === 'backgrounds' && (
              <div className="space-y-8">
                <BackgroundImageSelector />
              </div>
            )}

            {/* Buttons Tab */}
            {activeTab === 'buttons' && (
              <div className="space-y-8">
                <ButtonSelector />
                <div className="border-t my-8 pt-4"></div>
                <TextCardButtonSelector />
              </div>
            )}

            {/* Frame Template Tab */}
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
                      cornerStyle={fetchedUser?.frameCornerStyle || 'squircle'}
                      borderRadius={fetchedUser?.frameBorderRadius || 20}
                      allCorners={fetchedUser?.frameAllCorners ?? true}
                      topLeftRadius={fetchedUser?.frameTopLeftRadius || 20}
                      topRightRadius={fetchedUser?.frameTopRightRadius || 20}
                      bottomLeftRadius={fetchedUser?.frameBottomLeftRadius || 20}
                      bottomRightRadius={fetchedUser?.frameBottomRightRadius || 20}
                      width={fetchedUser?.frameWidth || 512}
                      height={fetchedUser?.frameHeight || 512}
                      onTemplateChange={async template => {
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
                      onColorChange={debouncedFrameColorUpdate}
                      onThicknessChange={async thickness => {
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
                      onRotationChange={async rotation => {
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
                      onPictureRotationChange={async rotation => {
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
                      onSyncRotationChange={async sync => {
                        try {
                          await axios.patch('/api/frame', {
                            syncRotation: sync,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Sync rotation updated');
                        } catch (error) {
                          toast.error('Failed to update sync rotation');
                        }
                      }}
                      onAnimationChange={async animation => {
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
                      onCornerStyleChange={async style => {
                        try {
                          await axios.patch('/api/frame', {
                            frameCornerStyle: style,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Corner style updated');
                        } catch (error) {
                          toast.error('Failed to update corner style');
                        }
                      }}
                      onBorderRadiusChange={async radius => {
                        try {
                          await axios.patch('/api/frame', {
                            frameBorderRadius: radius,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Border radius updated');
                        } catch (error) {
                          toast.error('Failed to update border radius');
                        }
                      }}
                      onAllCornersChange={async allCorners => {
                        try {
                          await axios.patch('/api/frame', {
                            frameAllCorners: allCorners,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('All corners setting updated');
                        } catch (error) {
                          toast.error('Failed to update all corners setting');
                        }
                      }}
                      onTopLeftRadiusChange={async radius => {
                        try {
                          await axios.patch('/api/frame', {
                            frameTopLeftRadius: radius,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Top left radius updated');
                        } catch (error) {
                          toast.error('Failed to update top left radius');
                        }
                      }}
                      onTopRightRadiusChange={async radius => {
                        try {
                          await axios.patch('/api/frame', {
                            frameTopRightRadius: radius,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Top right radius updated');
                        } catch (error) {
                          toast.error('Failed to update top right radius');
                        }
                      }}
                      onBottomLeftRadiusChange={async radius => {
                        try {
                          await axios.patch('/api/frame', {
                            frameBottomLeftRadius: radius,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Bottom left radius updated');
                        } catch (error) {
                          toast.error('Failed to update bottom left radius');
                        }
                      }}
                      onBottomRightRadiusChange={async radius => {
                        try {
                          await axios.patch('/api/frame', {
                            frameBottomRightRadius: radius,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Bottom right radius updated');
                        } catch (error) {
                          toast.error('Failed to update bottom right radius');
                        }
                      }}
                      onWidthChange={async width => {
                        try {
                          await axios.patch('/api/frame', {
                            frameWidth: width,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Frame width updated');
                        } catch (error) {
                          toast.error('Failed to update frame width');
                        }
                      }}
                      onHeightChange={async height => {
                        try {
                          await axios.patch('/api/frame', {
                            frameHeight: height,
                          });
                          queryClient.invalidateQueries('users');
                          signalIframe();
                          toast.success('Frame height updated');
                        } catch (error) {
                          toast.error('Failed to update frame height');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Padding Tab */}
            {activeTab === 'padding' && (
              <div>
                <div className="rounded-2xl border bg-white p-lg w-full h-auto">
                  <div className="p-6">
                    <PaddingSelector />
                  </div>
                </div>
              </div>
            )}

            {/* Fonts Tab */}
            {activeTab === 'fonts' && (
              <div className="space-y-8">
                <FontSelector />
              </div>
            )}

            {/* Sizes Tab */}
            {activeTab === 'sizes' && (
              <div className="space-y-8">
                <SizeSelector />
              </div>
            )}
          </div>
          <Footer />
        </div>
      </Layout>
    </>
  );
};

export default Customize;
