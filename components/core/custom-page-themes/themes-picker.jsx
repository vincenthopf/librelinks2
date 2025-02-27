import { useEffect, useState } from 'react';
import { themes } from '@/utils/themes';
import { CheckMark } from '@/components/utils/checkmark';
import useCurrentUser from '@/hooks/useCurrentUser';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signalIframe } from '@/utils/helpers';
import ColorSpectrumSelector from './ColorSpectrumSelector';

const ThemesPicker = () => {
  const { data: currentUser } = useCurrentUser();
  const [displayedThemes, setDisplayedThemes] = useState(themes.slice(0, 9));
  const [showAll, setShowAll] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [customColors, setCustomColors] = useState({
    background: '',
    secondary: '',
    text: '',
    accent: '',
  });
  const themeFromDB = currentUser?.themePalette.name;

  const queryClient = useQueryClient();

  useEffect(() => {
    const storedTheme = themeFromDB
      ? themeFromDB
      : localStorage.getItem('selectedTheme');
    if (storedTheme) {
      const theme = themes.find((t) => t.name === storedTheme);
      if (theme) {
        setSelectedTheme(theme);
        setCustomColors({
          background: theme.palette[0],
          secondary: theme.palette[1],
          text: theme.palette[2],
          accent: theme.palette[3],
        });
      }
    }
  }, [themeFromDB]);

  const handleShowMore = () => {
    setShowAll(true);
    setDisplayedThemes(themes);
  };

  const handleShowLess = () => {
    setDisplayedThemes(themes.slice(0, 9));
    setShowAll(false);
  };

  const mutateTheme = useMutation(
    async (themeData) => {
      const backgroundImage = currentUser?.backgroundImage;
      await axios.patch('/api/customize', {
        themePalette: {
          ...themeData,
          palette: [
            themeData.customColors.background,
            themeData.customColors.secondary,
            themeData.customColors.text,
            themeData.customColors.accent,
          ],
        },
        backgroundImage,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['currentUser']);
        signalIframe();
      },
    }
  );

  const handleThemeSelect = async (theme) => {
    setSelectedTheme(theme);
    setCustomColors({
      background: theme.palette[0],
      secondary: theme.palette[1],
      text: theme.palette[2],
      accent: theme.palette[3],
    });

    await toast.promise(
      mutateTheme.mutateAsync({
        ...theme,
        customColors: {
          background: theme.palette[0],
          secondary: theme.palette[1],
          text: theme.palette[2],
          accent: theme.palette[3],
        },
      }),
      {
        loading: 'Changing theme',
        success: 'New theme applied',
        error: 'An error occurred',
      }
    );
    localStorage.setItem('selectedTheme', theme.name);
  };

  const handleColorChange = async (colorKey, value) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);

    if (selectedTheme) {
      await mutateTheme.mutateAsync({
        ...selectedTheme,
        customColors: newColors,
      });
    }
  };

  const handleResetColors = async () => {
    if (selectedTheme) {
      const originalColors = {
        background: selectedTheme.palette[0],
        secondary: selectedTheme.palette[1],
        text: selectedTheme.palette[2],
        accent: selectedTheme.palette[3],
      };
      setCustomColors(originalColors);
      await mutateTheme.mutateAsync({
        ...selectedTheme,
        customColors: originalColors,
      });
    }
  };

  return (
    <>
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Themes</h3>
        <div className="my-4 grid grid-cols-2 lg:grid-cols-3 rounded-2xl auto-rows-max gap-4 max-w-md md:gap-6 md:max-w-2xl lg:max-w-3xl p-4 mx-auto md:basis-3/5 w-full overflow-y-auto bg-white">
          {displayedThemes?.map((theme) => (
            <div
              key={theme.name}
              className={`rounded-2xl overflow-hidden cursor-pointer relative z-0 duration-200 w-full border-2 ${
                selectedTheme === theme
                  ? 'border-[2.5px] border-blue-500'
                  : 'border-primary'
              }`}
              onClick={() => handleThemeSelect(theme)}
            >
              <div className="grid grid-cols-4 h-24 md:h-28">
                {theme.palette.map((color) => (
                  <div
                    key={color}
                    className="h-full"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <span
                style={{ color: theme.palette[2] }}
                className="absolute top-2 left-2 z-10 text-xs text-base-content/80"
              >
                {theme.name}
              </span>
              {selectedTheme === theme && (
                <span
                  style={{ color: theme.palette[0] }}
                  className="absolute top-2 right-2 z-10 text-xs text-base-content/80"
                >
                  <CheckMark />
                </span>
              )}
            </div>
          ))}
        </div>
        {!showAll && (
          <button
            className="block mx-auto mt-4 text-white bg-blue-600 rounded-lg py-2 px-4 hover:bg-blue-800"
            onClick={handleShowMore}
          >
            Show More
          </button>
        )}
        {showAll && (
          <button
            className="block mx-auto mt-4 text-white bg-blue-600 rounded-lg py-2 px-4 hover:bg-blue-800"
            onClick={handleShowLess}
          >
            Show Less
          </button>
        )}

        {selectedTheme && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Customize Colors</h4>
              <button
                onClick={handleResetColors}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset to Original
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorSpectrumSelector
                label="Background Color"
                initialColor={customColors.background}
                onChange={(color) => handleColorChange('background', color)}
              />
              <ColorSpectrumSelector
                label="Secondary Color"
                initialColor={customColors.secondary}
                onChange={(color) => handleColorChange('secondary', color)}
              />
              <ColorSpectrumSelector
                label="Text Color"
                initialColor={customColors.text}
                onChange={(color) => handleColorChange('text', color)}
              />
              <ColorSpectrumSelector
                label="Accent Color"
                initialColor={customColors.accent}
                onChange={(color) => handleColorChange('accent', color)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ThemesPicker;
