import { useState, useEffect } from 'react';
import { Grid, LayoutGrid, Rows } from 'lucide-react';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import PhotoUpload from './photo-upload';
import PortfolioLayout from './layouts/portfolio-layout';
import MasonryLayout from './layouts/masonry-layout';
import GridLayout from './layouts/grid-layout';
import CarouselLayout from './layouts/carousel-layout';
import { Button } from '@/components/ui/button';
import { signalIframe } from '@/utils/helpers';

const PhotoBookTab = ({ embedded = false }) => {
  const {
    photos,
    isLoadingPhotos,
    photosError,
    photoBookLayout,
    updateLayout,
    isUpdatingLayout,
  } = usePhotoBook();

  const [activeLayout, setActiveLayout] = useState(photoBookLayout || 'grid');

  // Update activeLayout when photoBookLayout changes
  useEffect(() => {
    if (photoBookLayout) {
      setActiveLayout(photoBookLayout);
    }
  }, [photoBookLayout]);

  const handleLayoutChange = async (layout) => {
    setActiveLayout(layout);
    try {
      await updateLayout(layout);
      // Signal iframe to refresh after layout change
      signalIframe();
    } catch (error) {
      console.error('Failed to update layout:', error);
      // Revert to previous layout if update fails
      setActiveLayout(photoBookLayout);
    }
  };

  const renderLayoutContent = () => {
    if (isLoadingPhotos) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (photosError) {
      return (
        <div className="text-center p-4 text-red-500">
          Error loading photos. Please try again.
        </div>
      );
    }

    if (!photos || photos.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">
            No photos yet. Upload your first photo!
          </p>
        </div>
      );
    }

    switch (activeLayout) {
      case 'portfolio':
        return <PortfolioLayout photos={photos} />;
      case 'masonry':
        return <MasonryLayout photos={photos} />;
      case 'carousel':
        return <CarouselLayout photos={photos} />;
      case 'grid':
      default:
        return <GridLayout photos={photos} />;
    }
  };

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      <div className="flex flex-col space-y-4">
        {!embedded && <h3 className="text-xl font-semibold">Photo Book</h3>}

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-gray-500">
              Upload photos to create your photo book
            </p>

            {/* Layout Style Options */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Layout Style</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLayoutChange('portfolio')}
                  className={`flex flex-col items-center border rounded-lg px-4 py-2 transition-all ${
                    activeLayout === 'portfolio'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isUpdatingLayout}
                >
                  <div className="border-2 w-16 h-12 mb-1 overflow-hidden bg-white flex flex-wrap p-0.5">
                    <div className="w-1/2 h-1/2 bg-gray-300"></div>
                    <div className="w-1/2 h-1/2 bg-gray-200"></div>
                    <div className="w-1/2 h-1/2 bg-gray-200"></div>
                    <div className="w-1/2 h-1/2 bg-gray-300"></div>
                  </div>
                  <span className="text-xs mt-1">Portfolio</span>
                </button>

                <button
                  onClick={() => handleLayoutChange('masonry')}
                  className={`flex flex-col items-center border rounded-lg px-4 py-2 transition-all ${
                    activeLayout === 'masonry'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isUpdatingLayout}
                >
                  <div className="border-2 w-16 h-12 mb-1 overflow-hidden bg-white flex p-0.5">
                    <div className="w-1/3 flex flex-col space-y-0.5">
                      <div className="w-full h-4 bg-gray-300"></div>
                      <div className="w-full h-6 bg-gray-200"></div>
                    </div>
                    <div className="w-1/3 mx-0.5 flex flex-col space-y-0.5">
                      <div className="w-full h-6 bg-gray-200"></div>
                      <div className="w-full h-4 bg-gray-300"></div>
                    </div>
                    <div className="w-1/3 flex flex-col space-y-0.5">
                      <div className="w-full h-3 bg-gray-300"></div>
                      <div className="w-full h-7 bg-gray-200"></div>
                    </div>
                  </div>
                  <span className="text-xs mt-1">Masonry</span>
                </button>

                <button
                  onClick={() => handleLayoutChange('grid')}
                  className={`flex flex-col items-center border rounded-lg px-4 py-2 transition-all ${
                    activeLayout === 'grid'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isUpdatingLayout}
                >
                  <div className="border-2 w-16 h-12 mb-1 overflow-hidden bg-white grid grid-cols-3 grid-rows-2 gap-0.5 p-0.5">
                    <div className="bg-gray-300"></div>
                    <div className="bg-gray-200"></div>
                    <div className="bg-gray-300"></div>
                    <div className="bg-gray-200"></div>
                    <div className="bg-gray-300"></div>
                    <div className="bg-gray-200"></div>
                  </div>
                  <span className="text-xs mt-1">Grid</span>
                </button>

                <button
                  onClick={() => handleLayoutChange('carousel')}
                  className={`flex flex-col items-center border rounded-lg px-4 py-2 transition-all ${
                    activeLayout === 'carousel'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isUpdatingLayout}
                >
                  <div className="border-2 w-16 h-12 mb-1 overflow-hidden bg-white flex flex-col p-0.5">
                    <div className="flex-1 bg-gray-200 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-300 mx-auto"></div>
                    </div>
                    <div className="h-2 flex items-center justify-center space-x-0.5 mt-0.5">
                      <div className="w-4 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-xs mt-1">Carousel</span>
                </button>
              </div>
            </div>
          </div>

          <PhotoUpload />
        </div>
      </div>

      <div className={embedded ? 'mt-4' : 'mt-6'}>{renderLayoutContent()}</div>
    </div>
  );
};

export default PhotoBookTab;
