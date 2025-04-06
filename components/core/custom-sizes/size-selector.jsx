/* eslint-disable react-hooks/exhaustive-deps */
import useCurrentUser from '@/hooks/useCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import ProfileImageSizeSelector from './profile-image-size-selector';

const SizeSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [sizes, setSizes] = useState({
    // Font sizes
    profileName: 16,
    bio: 14,
    linkTitle: 14,
    // Image sizes
    socialIcon: 30,
    favicon: 32,
  });

  // Define default sizes
  const defaultSizes = {
    profileName: 16,
    bio: 14,
    linkTitle: 14,
    socialIcon: 30,
    favicon: 32,
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser) {
      setSizes({
        // Font sizes
        profileName: currentUser.profileNameFontSize || 16,
        bio: currentUser.bioFontSize || 14,
        linkTitle: currentUser.linkTitleFontSize || 14,
        // Image sizes
        socialIcon: currentUser.socialIconSize || 30,
        favicon: currentUser.faviconSize || 32,
      });
    }
  }, [currentUser]);

  const mutateSizes = useMutation(
    async newSizes => {
      await axios.patch('/api/customize', {
        // Font sizes
        profileNameFontSize: newSizes.profileName,
        bioFontSize: newSizes.bio,
        linkTitleFontSize: newSizes.linkTitle,
        // Image sizes
        socialIconSize: newSizes.socialIcon,
        faviconSize: newSizes.favicon,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        signalIframe();
      },
    }
  );

  const handleSizeChange = async (type, size) => {
    const newSizes = { ...sizes, [type]: size };
    await toast.promise(mutateSizes.mutateAsync(newSizes), {
      loading: 'Updating size',
      success: 'Size updated successfully',
      error: 'An error occurred',
    });
    setSizes(newSizes);
  };

  // Add Reset Handler
  const handleResetToDefaults = async () => {
    await toast.promise(mutateSizes.mutateAsync(defaultSizes), {
      loading: 'Resetting sizes to default',
      success: 'Sizes reset successfully',
      error: 'An error occurred while resetting',
    });
    setSizes(defaultSizes); // Update local state after successful API call
  };

  const handleSliderChange = (type, value) => {
    const newSizes = { ...sizes, [type]: value };
    setSizes(newSizes);
    mutateSizes.mutate(newSizes);
  };

  const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64];
  const imageSizeOptions = [16, 20, 24, 28, 32, 40, 48, 56, 64];

  return (
    <div className="max-w-[640px] mx-auto my-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Sizes</h3>
        {/* Add Reset Button */}
        <button
          onClick={handleResetToDefaults}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors duration-150 ease-in-out text-sm"
        >
          Reset to Default
        </button>
      </div>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="space-y-6">
          {/* Font Sizes */}
          <div>
            <h4 className="text-lg font-medium mb-4">Font Sizes</h4>
            {/* Profile Name Font Size */}
            <div className="mb-6">
              <p className="text-inherit pb-2">Profile Name</p>
              <select
                value={sizes.profileName}
                onChange={e => handleSizeChange('profileName', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <span style={{ fontSize: `${sizes.profileName}px` }} className="font-semibold">
                  Preview Text
                </span>
              </div>
            </div>

            {/* Bio Font Size */}
            <div className="mb-6">
              <p className="text-inherit pb-2">Bio</p>
              <select
                value={sizes.bio}
                onChange={e => handleSizeChange('bio', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <span style={{ fontSize: `${sizes.bio}px` }}>Preview Text</span>
              </div>
            </div>

            {/* Link Title Font Size */}
            <div className="mb-6">
              <p className="text-inherit pb-2">Link Title</p>
              <select
                value={sizes.linkTitle}
                onChange={e => handleSizeChange('linkTitle', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <span style={{ fontSize: `${sizes.linkTitle}px` }}>Preview Text</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t my-6" />

          {/* Image Sizes */}
          <div>
            <h4 className="text-lg font-medium mb-4">Image Sizes</h4>
            {/* Add Profile Image Size Selector */}
            <div className="mb-6">
              <p className="text-inherit pb-2">Profile Image Size</p>
              <ProfileImageSizeSelector />
            </div>

            {/* Social Icon Size */}
            <div className="mb-6">
              <p className="text-inherit pb-2">Social Icon Size</p>
              <select
                value={sizes.socialIcon}
                onChange={e => handleSizeChange('socialIcon', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {imageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <div
                  style={{
                    width: `${sizes.socialIcon}px`,
                    height: `${sizes.socialIcon}px`,
                    backgroundColor: '#F3F3F1',
                    borderRadius: '50%',
                  }}
                />
              </div>
            </div>

            {/* Favicon Size */}
            <div>
              <p className="text-inherit pb-2">Favicon Size</p>
              <select
                value={sizes.favicon}
                onChange={e => handleSizeChange('favicon', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {imageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <div
                  style={{
                    width: `${sizes.favicon}px`,
                    height: `${sizes.favicon}px`,
                    backgroundColor: '#F3F3F1',
                    borderRadius: '50%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeSelector;
