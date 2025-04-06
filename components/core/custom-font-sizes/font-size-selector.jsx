/* eslint-disable react-hooks/exhaustive-deps */
import useCurrentUser from '@/hooks/useCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';

const FontSizeSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [fontSizes, setFontSizes] = useState({
    profileName: 16,
    bio: 14,
    linkTitle: 14,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser) {
      setFontSizes({
        profileName: currentUser.profileNameFontSize || 16,
        bio: currentUser.bioFontSize || 14,
        linkTitle: currentUser.linkTitleFontSize || 14,
      });
    }
  }, [currentUser]);

  const mutateFontSizes = useMutation(
    async newFontSizes => {
      await axios.patch('/api/customize', {
        profileNameFontSize: newFontSizes.profileName,
        bioFontSize: newFontSizes.bio,
        linkTitleFontSize: newFontSizes.linkTitle,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        signalIframe();
      },
    }
  );

  const handleFontSizeChange = async (type, size) => {
    const newFontSizes = { ...fontSizes, [type]: size };
    await toast.promise(mutateFontSizes.mutateAsync(newFontSizes), {
      loading: 'Updating font size',
      success: 'Font size updated successfully',
      error: 'An error occurred',
    });
    setFontSizes(newFontSizes);
  };

  const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64];

  return (
    <div className="max-w-[640px] mx-auto my-4">
      <h3 className="text-xl font-semibold">Font Sizes</h3>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="space-y-6">
          {/* Profile Name Font Size */}
          <div>
            <p className="text-inherit pb-2">Profile Name</p>
            <select
              value={fontSizes.profileName}
              onChange={e => handleFontSizeChange('profileName', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {fontSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
            <div className="mt-2">
              <span style={{ fontSize: `${fontSizes.profileName}px` }} className="font-semibold">
                Preview Text
              </span>
            </div>
          </div>

          {/* Bio Font Size */}
          <div>
            <p className="text-inherit pb-2">Bio</p>
            <select
              value={fontSizes.bio}
              onChange={e => handleFontSizeChange('bio', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {fontSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
            <div className="mt-2">
              <span style={{ fontSize: `${fontSizes.bio}px` }}>Preview Text</span>
            </div>
          </div>

          {/* Link Title Font Size */}
          <div>
            <p className="text-inherit pb-2">Link Title</p>
            <select
              value={fontSizes.linkTitle}
              onChange={e => handleFontSizeChange('linkTitle', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {fontSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
            <div className="mt-2">
              <span style={{ fontSize: `${fontSizes.linkTitle}px` }}>Preview Text</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontSizeSelector;
