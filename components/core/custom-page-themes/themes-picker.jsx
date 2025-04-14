import { useEffect, useState, useCallback } from 'react';
import { themes } from '@/utils/themes';
import { CheckMark } from '@/components/utils/checkmark';
import useCurrentUser from '@/hooks/useCurrentUser';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signalIframe } from '@/utils/helpers';
import ColorSpectrumSelector from './ColorSpectrumSelector';
import { debounce } from 'lodash';

// Define default colors, including transparent options
const DEFAULT_BACKGROUND = '#F3F3F1';
const DEFAULT_SECONDARY = '#ffffff';
const DEFAULT_TEXT = '#0a0a0a';
const DEFAULT_ACCENT = '#0a0a0a';
const DEFAULT_EMBED_BACKGROUND = 'transparent'; // Default embed to transparent

const ThemesPicker = () => {
  const { data: currentUser } = useCurrentUser();
  const [displayedThemes, setDisplayedThemes] = useState(themes.slice(0, 9));
  const [showAll, setShowAll] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0); // Add force update counter
  const [customColors, setCustomColors] = useState({
    background: DEFAULT_BACKGROUND,
    secondary: DEFAULT_SECONDARY,
    text: DEFAULT_TEXT,
    accent: DEFAULT_ACCENT,
    embedBackground: DEFAULT_EMBED_BACKGROUND,
  });
  const themeFromDB = currentUser?.themePalette.name;
  // Extract potential custom colors from DB theme
  const backgroundFromDB = currentUser?.themePalette?.palette?.[0];
  const secondaryFromDB = currentUser?.themePalette?.palette?.[1];
  const textFromDB = currentUser?.themePalette?.palette?.[2];
  const accentFromDB = currentUser?.themePalette?.palette?.[3];
  const embedBackgroundFromDB = currentUser?.themePalette?.embedBackground;

  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize from DB or localStorage
    const storedThemeName = themeFromDB ? themeFromDB : localStorage.getItem('selectedTheme');
    const initialBackground = backgroundFromDB || DEFAULT_BACKGROUND;
    const initialSecondary = secondaryFromDB || DEFAULT_SECONDARY;
    const initialText = textFromDB || DEFAULT_TEXT;
    const initialAccent = accentFromDB || DEFAULT_ACCENT;
    const initialEmbedBackground = embedBackgroundFromDB || DEFAULT_EMBED_BACKGROUND;

    let themeFound = false;
    if (storedThemeName) {
      const theme = themes.find(t => t.name === storedThemeName);
      if (theme) {
        themeFound = true;
        setSelectedTheme(theme);
        setCustomColors({
          background: theme.palette[0] || initialBackground,
          secondary: theme.palette[1] || initialSecondary,
          text: theme.palette[2] || initialText,
          accent: theme.palette[3] || initialAccent,
          embedBackground: theme.palette[4] || initialEmbedBackground, // Assume palette[4] might exist for embed
        });
      }
    }

    // If no theme was found or no theme name stored, load directly from DB or use defaults
    if (!themeFound) {
      setCustomColors({
        background: initialBackground,
        secondary: initialSecondary,
        text: initialText,
        accent: initialAccent,
        embedBackground: initialEmbedBackground,
      });
    }
  }, [
    themeFromDB,
    backgroundFromDB,
    secondaryFromDB,
    textFromDB,
    accentFromDB,
    embedBackgroundFromDB,
  ]);

  const handleShowMore = () => {
    setShowAll(true);
    setDisplayedThemes(themes);
  };

  const handleShowLess = () => {
    setDisplayedThemes(themes.slice(0, 9));
    setShowAll(false);
  };

  const mutateTheme = useMutation(
    async themeData => {
      const backgroundImage = currentUser?.backgroundImage;

      // Include all 5 colors in the palette
      const palette = [
        themeData.customColors.background,
        themeData.customColors.secondary,
        themeData.customColors.text,
        themeData.customColors.accent,
        themeData.customColors.embedBackground,
      ];

      const payload = {
        themePalette: {
          name: themeData.name,
          palette: palette,
          // Still keep the embedBackground as a separate property for backward compatibility
          embedBackground: themeData.customColors.embedBackground,
        },
        backgroundImage,
      };

      console.log('🚀 SENDING TO API:', JSON.stringify(payload, null, 2));

      try {
        const response = await axios.patch('/api/customize', payload);
        console.log('✅ API RESPONSE:', response.data);
        return response;
      } catch (error) {
        console.error('❌ API ERROR:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['currentUser']);
        signalIframe();
      },
    }
  );

  const debouncedThemeUpdate = useCallback(
    debounce(async themeData => {
      // Process theme data before sending
      const processedData = {
        ...themeData,
        customColors: {
          ...themeData.customColors,
          // Make sure transparent values are preserved correctly
          background: themeData.customColors.background,
          secondary: themeData.customColors.secondary,
          text: themeData.customColors.text,
          accent: themeData.customColors.accent,
          embedBackground: themeData.customColors.embedBackground,
        },
      };

      console.log('⚠️ Debounced update sending to API:', processedData);
      await mutateTheme.mutateAsync(processedData);
    }, 1000),
    [mutateTheme]
  );

  const handleThemeSelect = async theme => {
    setSelectedTheme(theme);
    setForceUpdate(prev => prev + 1); // Increment to force update

    // Log the theme palette to debug
    console.log(`Selected theme: ${theme.name}`, {
      palette: theme.palette,
      embedColor: theme.palette[4],
    });

    // Explicitly extract all colors from theme with strict fallbacks
    const background = theme.palette[0] || DEFAULT_BACKGROUND;
    const secondary = theme.palette[1] || DEFAULT_SECONDARY;
    const text = theme.palette[2] || DEFAULT_TEXT;
    const accent = theme.palette[3] || DEFAULT_ACCENT;
    const embedBackground = theme.palette[4] || '#FFFFFF'; // Explicitly default to white

    console.log(`Setting colors from theme ${theme.name}:`, {
      background,
      secondary,
      text,
      accent,
      embedBackground,
    });

    // Force complete state update with all new colors
    setCustomColors({
      background,
      secondary,
      text,
      accent,
      embedBackground,
    });

    // Send to API
    await toast.promise(
      mutateTheme.mutateAsync({
        name: theme.name,
        customColors: {
          background,
          secondary,
          text,
          accent,
          embedBackground,
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

  const handleColorChange = (colorKey, value) => {
    // Debug log to track state changes
    console.log(`Color change: ${colorKey} → ${value}`, {
      before: customColors,
      incoming: value,
      isTransparent: value === 'transparent',
    });

    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);

    if (selectedTheme) {
      // Another debug log before calling the debounced update
      console.log(`Sending to API: ${colorKey} → ${value}`, newColors);

      debouncedThemeUpdate({
        name: selectedTheme.name, // Ensure name is preserved
        customColors: newColors,
      });
    }
  };

  const handleResetColors = async () => {
    if (selectedTheme) {
      const originalColors = {
        background: selectedTheme.palette[0] || DEFAULT_BACKGROUND,
        secondary: selectedTheme.palette[1] || DEFAULT_SECONDARY,
        text: selectedTheme.palette[2] || DEFAULT_TEXT,
        accent: selectedTheme.palette[3] || DEFAULT_ACCENT,
        embedBackground: selectedTheme.palette[4] || DEFAULT_EMBED_BACKGROUND, // Reset embed background to default
      };
      setCustomColors(originalColors);
      await mutateTheme.mutateAsync({
        name: selectedTheme.name, // Pass theme name
        customColors: originalColors,
      });
    }
  };

  return (
    <>
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Themes</h3>
        <div className="my-4 grid grid-cols-2 lg:grid-cols-3 rounded-2xl auto-rows-max gap-4 max-w-md md:gap-6 md:max-w-2xl lg:max-w-3xl p-4 mx-auto md:basis-3/5 w-full overflow-y-auto bg-white">
          {displayedThemes?.map(theme => (
            <div
              key={theme.name}
              className={`rounded-2xl overflow-hidden cursor-pointer relative z-0 duration-200 w-full border-2 ${
                selectedTheme === theme ? 'border-[2.5px] border-blue-500' : 'border-primary'
              }`}
              onClick={() => handleThemeSelect(theme)}
            >
              <div className="grid grid-cols-5 h-24 md:h-28">
                {theme.palette.map(color => (
                  <div key={color} className="h-full" style={{ background: color }} />
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
                key={`bg-${customColors.background}-${selectedTheme?.name}-${forceUpdate}`}
                label="Background Color"
                initialColor={customColors.background}
                onChange={color => handleColorChange('background', color)}
              />
              <ColorSpectrumSelector
                key={`sec-${customColors.secondary}-${selectedTheme?.name}-${forceUpdate}`}
                label="Secondary Color"
                initialColor={customColors.secondary}
                onChange={color => handleColorChange('secondary', color)}
              />
              <ColorSpectrumSelector
                key={`text-${customColors.text}-${selectedTheme?.name}-${forceUpdate}`}
                label="Text Color"
                initialColor={customColors.text}
                onChange={color => handleColorChange('text', color)}
              />
              <ColorSpectrumSelector
                key={`accent-${customColors.accent}-${selectedTheme?.name}-${forceUpdate}`}
                label="Accent Color"
                initialColor={customColors.accent}
                onChange={color => handleColorChange('accent', color)}
              />
              <ColorSpectrumSelector
                key={`embed-${customColors.embedBackground}-${selectedTheme?.name}-${forceUpdate}`}
                label="Embed Background Color (Behind Providers' Default)"
                initialColor={customColors.embedBackground}
                onChange={color => handleColorChange('embedBackground', color)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ThemesPicker;
