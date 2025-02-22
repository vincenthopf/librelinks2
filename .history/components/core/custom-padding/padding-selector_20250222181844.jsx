import useCurrentUser from '@/hooks/useCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';

const PaddingSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [paddingValues, setPaddingValues] = useState({
    headToPicture: 40,
    pictureToName: 16,
    betweenCards: 16,
    cardHeight: 16
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser) {
      setPaddingValues({
        headToPicture: currentUser.headToPicturePadding || 40,
        pictureToName: currentUser.pictureToNamePadding || 16,
        betweenCards: currentUser.betweenCardsPadding || 16,
        cardHeight: currentUser.linkCardHeight || 16
      });
    }
  }, [currentUser]);

  const mutatePadding = useMutation(
    async (newPaddingValues) => {
      await axios.patch('/api/customize', {
        headToPicturePadding: newPaddingValues.headToPicture,
        pictureToNamePadding: newPaddingValues.pictureToName,
        betweenCardsPadding: newPaddingValues.betweenCards,
        linkCardHeight: newPaddingValues.cardHeight
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        signalIframe();
      },
    }
  );

  const handlePaddingChange = async (type, value) => {
    const newPaddingValues = { ...paddingValues, [type]: value };
    await toast.promise(mutatePadding.mutateAsync(newPaddingValues), {
      loading: 'Updating padding',
      success: 'Padding updated successfully',
      error: 'An error occurred'
    });
    setPaddingValues(newPaddingValues);
  };

  // Generate padding options from 0 to 200 in steps of 5
  const paddingOptions = Array.from({ length: 41 }, (_, i) => i * 5);

  return (
    <div className="max-w-[640px] mx-auto my-4">
      <h3 className="text-xl font-semibold">Padding</h3>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="space-y-6">
          {/* Head to Profile Picture */}
          <div>
            <p className="text-inherit pb-2">Head to Profile Picture</p>
            <select 
              value={paddingValues.headToPicture}
              onChange={(e) => handlePaddingChange('headToPicture', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {paddingOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <div className="mt-2 bg-gray-100 rounded" style={{ height: `${paddingValues.headToPicture}px` }} />
          </div>

          {/* Profile Picture to Profile Name */}
          <div>
            <p className="text-inherit pb-2">Profile Picture to Profile Name</p>
            <select 
              value={paddingValues.pictureToName}
              onChange={(e) => handlePaddingChange('pictureToName', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {paddingOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <div className="mt-2 bg-gray-100 rounded" style={{ height: `${paddingValues.pictureToName}px` }} />
          </div>

          {/* Between Link Cards */}
          <div>
            <p className="text-inherit pb-2">Between Link Cards</p>
            <select 
              value={paddingValues.betweenCards}
              onChange={(e) => handlePaddingChange('betweenCards', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {paddingOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <div className="mt-2 bg-gray-100 rounded" style={{ height: `${paddingValues.betweenCards}px` }} />
          </div>

          {/* Link Card Height */}
          <div>
            <p className="text-inherit pb-2">Link Card Height</p>
            <select 
              value={paddingValues.cardHeight}
              onChange={(e) => handlePaddingChange('cardHeight', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {paddingOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <div className="mt-2 bg-gray-100 rounded" style={{ height: `${paddingValues.cardHeight}px` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaddingSelector; 