import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import { signalIframe } from '@/utils/helpers';
import FontCard from './font-card';

const FontSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [selectedFont, setSelectedFont] = useState('Inter');
  const fontFromDB = currentUser?.profileNameFontFamily;

  const queryClient = useQueryClient();

  useEffect(() => {
    // First try to get font from DB, fallback to localStorage, then default to 'Inter'
    const storedFont = fontFromDB || localStorage.getItem('selected-font') || 'Inter';
    setSelectedFont(storedFont);
  }, [fontFromDB]);

  const mutateFonts = useMutation(
    async font => {
      // Only update the three fields that are actually used by the API
      await axios.patch('/api/customize', {
        profileNameFontFamily: font,
        bioFontFamily: font,
        linkTitleFontFamily: font,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        signalIframe();
      },
    }
  );

  const handleFontChange = async font => {
    setSelectedFont(font);
    // Store in localStorage as fallback
    localStorage.setItem('selected-font', font);

    await toast.promise(mutateFonts.mutateAsync(font), {
      loading: 'Updating font',
      success: 'Font updated successfully',
      error: 'An error occurred',
    });
  };

  const resetToDefaults = async () => {
    const defaultFont = 'Inter';
    setSelectedFont(defaultFont);
    localStorage.setItem('selected-font', defaultFont);

    await toast.promise(mutateFonts.mutateAsync(defaultFont), {
      loading: 'Resetting font',
      success: 'Font reset to default',
      error: 'An error occurred',
    });
  };

  // Font options based on the existing list
  const fontOptions = [
    'Roboto',
    'Playfair',
    'Lato',
    'Playfair Black',
    'Bebas',
    'Open Sans',
    'Cinzel',
    'Space Mono',
    'Comfortaa',
    'Playfair Pack',
    'Cinzel Pack',
    'Bebas Pack',
    'Slab',
    'Alegreya',
    'Oswald',
    'Barlow',
    'Escar',
    'Lora',
    'Inter',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Source Sans Pro',
    'Ubuntu',
    'Merriweather',
    'Nunito',
    'Quicksand',
    'Josefin Sans',
  ];

  return (
    <div className="max-w-[640px] mx-auto my-4">
      <h3 className="text-xl font-semibold">Fonts</h3>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <p className="text-gray-600 mb-4">
          Select a font to apply to all text elements (Profile Name, Bio, and Link Titles).
        </p>

        <div className="font-grid">
          {fontOptions.map(font => (
            <FontCard
              key={font}
              font={font}
              isSelected={selectedFont === font}
              onSelect={handleFontChange}
            />
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default FontSelector;
