import * as Avatar from '@radix-ui/react-avatar';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { CloudinaryImage } from '@/components/shared/cloudinary-image';
import { CircleFrame } from '@/components/core/profile-frames/frame-templates/circle-frame';
import { PolaroidClassicFrame } from '@/components/core/profile-frames/frame-templates/polaroid-classic-frame';
import { PolaroidPatternFrame } from '@/components/core/profile-frames/frame-templates/polaroid-pattern-frame';
import {
  RoundedCornersFrame,
  getFramePathForClipping,
} from '@/components/core/profile-frames/frame-templates/rounded-corners-frame';
import { getFrameAnimationProps } from '@/components/core/profile-frames/frame-animations';
import { useEffect, useState, useRef } from 'react';
import { checkAndRefreshFrames } from './frame-refresh';

const renderFrame = (template, props) => {
  // Log the template and props for debugging
  console.log('HeaderAvatar renderFrame:', {
    template,
    props,
    size: props.size,
    color: props.color,
    thickness: props.thickness,
    rotation: props.rotation,
    cornerStyle: props.cornerStyle,
    borderRadius: props.borderRadius,
    allCorners: props.allCorners,
    topLeftRadius: props.topLeftRadius,
    topRightRadius: props.topRightRadius,
    bottomLeftRadius: props.bottomLeftRadius,
    bottomRightRadius: props.bottomRightRadius,
    width: props.width,
    height: props.height,
  });

  switch (template) {
    case 'circle':
      return <CircleFrame {...props} />;
    case 'polaroid-classic':
      return <PolaroidClassicFrame {...props} />;
    case 'polaroid-pattern':
      return <PolaroidPatternFrame {...props} />;
    case 'rounded-corners':
      return <RoundedCornersFrame {...props} />;
    default:
      return null;
  }
};

const getFrameSpecificStyles = (template, thickness, pictureRotation, props = {}) => {
  const baseStyles = {
    transform: pictureRotation ? `rotate(${pictureRotation}deg)` : undefined,
    transition: 'transform 0.3s ease',
  };

  switch (template) {
    case 'circle':
      return {
        ...baseStyles,
        borderRadius: '50%',
        overflow: 'hidden',
      };
    case 'polaroid-classic':
      return {
        ...baseStyles,
        borderRadius: '20px',
        overflow: 'hidden',
        // Adjust container to account for frame thickness
        transform: `${baseStyles.transform || ''} scale(${(100 - thickness) / 100})`.trim(),
      };
    case 'polaroid-pattern':
      return {
        ...baseStyles,
        borderRadius: '1px',
        overflow: 'hidden',
        transform: `${baseStyles.transform || ''} scale(${(100 - thickness) / 100})`.trim(),
      };
    case 'rounded-corners': {
      // For rounded corners, we'll use SVG clipping instead of CSS border-radius
      return {
        ...baseStyles,
        overflow: 'hidden',
      };
    }
    default:
      return baseStyles;
  }
};

// Generate a unique ID for SVG clip paths
const generateClipId = (template, props, frameWidth, frameHeight) => {
  if (template !== 'rounded-corners') return null;

  const {
    cornerStyle,
    borderRadius,
    allCorners,
    topLeftRadius,
    topRightRadius,
    bottomLeftRadius,
    bottomRightRadius,
  } = props;

  return `header-clip-${template}-${cornerStyle}-${borderRadius}-${allCorners ? 'all' : 'custom'}-${topLeftRadius}-${topRightRadius}-${bottomLeftRadius}-${bottomRightRadius}-${frameWidth}-${frameHeight}`;
};

/**
 * HeaderAvatar component specifically for the navigation header
 * Uses fixed sizing and maintains existing styling
 */
export const HeaderAvatar = ({ onClick }) => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);
  const [key, setKey] = useState(Date.now());
  const prevDimensionsRef = useRef({ width: 0, height: 0 });
  const size = 45;

  // Force re-render when frame dimensions change
  useEffect(() => {
    if (fetchedUser) {
      // Check if dimensions have actually changed significantly
      const prevWidth = prevDimensionsRef.current.width;
      const prevHeight = prevDimensionsRef.current.height;
      const currentWidth = fetchedUser.frameWidth || 512;
      const currentHeight = fetchedUser.frameHeight || 512;

      if (
        Math.abs(currentWidth - prevWidth) > 5 ||
        Math.abs(currentHeight - prevHeight) > 5 ||
        prevWidth === 0 ||
        prevHeight === 0 // First render
      ) {
        console.log('HeaderAvatar: Dimensions changed significantly', {
          prevWidth,
          currentWidth,
          prevHeight,
          currentHeight,
        });

        // Update the stored dimensions
        prevDimensionsRef.current = {
          width: currentWidth,
          height: currentHeight,
        };

        // Update key to force re-render
        setKey(Date.now());

        // Check if we need to refresh iframes
        if (fetchedUser.frameWidth && fetchedUser.frameHeight) {
          checkAndRefreshFrames(fetchedUser.frameWidth, fetchedUser.frameHeight);
        }
      }
    }
  }, [fetchedUser?.frameWidth, fetchedUser?.frameHeight]);

  // For no frame, just show the raw image
  if (!fetchedUser?.frameTemplate || fetchedUser.frameTemplate === 'none') {
    return (
      <div onClick={onClick} className="transition-transform hover:scale-110">
        <CloudinaryImage
          src={fetchedUser?.image}
          alt="avatar"
          width={size}
          height={size}
          className={`h-[80px] w-[80px] object-cover rounded-full ${!fetchedUser?.image && 'hidden'}`}
          loading="eager"
          priority={true}
        />
      </div>
    );
  }

  // Calculate image size based on frame type and thickness
  const thickness = fetchedUser.frameThickness || 2;
  const imageScale = 1; // Fill entire container
  const imageSize = size;
  const frameRotation = fetchedUser.frameRotation || 0;
  const pictureRotation = fetchedUser.syncRotation
    ? frameRotation
    : fetchedUser.pictureRotation || 0;

  // Create props object for rounded corners
  const frameProps = {
    cornerStyle: fetchedUser?.frameCornerStyle || 'squircle',
    borderRadius: fetchedUser?.frameBorderRadius || 20,
    allCorners: fetchedUser?.frameAllCorners ?? true,
    topLeftRadius: fetchedUser?.frameTopLeftRadius || 20,
    topRightRadius: fetchedUser?.frameTopRightRadius || 20,
    bottomLeftRadius: fetchedUser?.frameBottomLeftRadius || 20,
    bottomRightRadius: fetchedUser?.frameBottomRightRadius || 20,
  };

  const frameWidth = fetchedUser?.frameWidth || 512;
  const frameHeight = fetchedUser?.frameHeight || 512;

  const frameStyles = getFrameSpecificStyles(
    fetchedUser.frameTemplate,
    thickness,
    pictureRotation,
    frameProps
  );

  const clipId = generateClipId(fetchedUser.frameTemplate, frameProps, frameWidth, frameHeight);

  // For rounded corners, create an SVG mask for the image
  const renderImageWithMask = () => {
    if (fetchedUser.frameTemplate !== 'rounded-corners') {
      return (
        <CloudinaryImage
          src={fetchedUser?.image}
          alt="avatar"
          width={imageSize}
          height={imageSize}
          className={`h-[40px] w-[40px] object-cover rounded-full ${!fetchedUser?.image && 'hidden'}`}
          loading="eager"
          priority={true}
        />
      );
    }

    // For rounded corners, use an SVG with a clip path
    const aspectRatio = frameWidth / frameHeight;

    // Determine if we need to adjust for non-square aspect ratio
    let svgWidth = imageSize;
    let svgHeight = imageSize;

    // Adjust SVG dimensions to maintain aspect ratio within the size constraint
    if (aspectRatio > 1) {
      // Wider than tall
      svgHeight = imageSize / aspectRatio;
    } else if (aspectRatio < 1) {
      // Taller than wide
      svgWidth = imageSize * aspectRatio;
    }

    // Use a fixed viewBox width and calculate height based on aspect ratio
    const viewBoxWidth = 100;
    const viewBoxHeight = viewBoxWidth / aspectRatio;

    // Log SVG viewBox parameters for debugging
    console.log('HeaderAvatar SVG viewBox:', {
      frameWidth,
      frameHeight,
      aspectRatio,
      svgWidth,
      svgHeight,
      viewBoxWidth,
      viewBoxHeight,
      viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    });

    // Generate a unique key that includes all relevant properties
    // This ensures the SVG is re-rendered when any of these properties change
    const svgKey = `header-svg-${frameWidth}-${frameHeight}-${key}-${fetchedUser?.image?.split('/').pop() || 'noimage'}`;

    return (
      <svg
        width={svgWidth}
        height={svgHeight}
        className="h-full w-full"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        key={svgKey}
      >
        <defs>
          <clipPath id={clipId}>
            <path
              d={getFramePathForClipping(
                frameProps.cornerStyle,
                size,
                thickness,
                frameProps.allCorners,
                frameProps.borderRadius,
                frameProps.topLeftRadius,
                frameProps.topRightRadius,
                frameProps.bottomLeftRadius,
                frameProps.bottomRightRadius,
                frameWidth,
                frameHeight
              )}
              transform={`translate(${thickness / 2}, ${thickness / 2})`}
            />
          </clipPath>
        </defs>
        <image
          href={fetchedUser?.image}
          x="0"
          y="0"
          width={viewBoxWidth}
          height={viewBoxHeight}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
          priority={true}
        />
      </svg>
    );
  };

  // Show framed image for other frame types
  return (
    <div
      onClick={onClick}
      className="frame-container relative transition-transform hover:scale-110"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${frameRotation}deg)`,
        transition: 'transform 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible', // Allow frame to overflow if needed
      }}
      key={`header-avatar-container-${key}`}
    >
      {/* Frame layer */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {renderFrame(fetchedUser.frameTemplate, {
          size,
          color: fetchedUser.frameColor || '#000000',
          thickness,
          rotation: 0, // Remove rotation from frame since container handles it
          name: fetchedUser.name || '',
          animation: fetchedUser.frameAnimation || {
            type: null,
            enabled: false,
            config: {},
          },
          ...frameProps, // Add rounded corners properties
          width: frameWidth,
          height: frameHeight,
        })}
      </div>

      {/* Image layer */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          className="image-container relative flex items-center justify-center"
          style={{
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            ...frameStyles,
          }}
        >
          {renderImageWithMask()}
        </div>
      </div>
    </div>
  );
};
