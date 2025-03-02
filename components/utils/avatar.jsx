import * as Avatar from '@radix-ui/react-avatar';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { CloudinaryImage } from '@/components/shared/cloudinary-image';
import { CircleFrame } from '@/components/core/profile-frames/frame-templates/circle-frame';
import { PolaroidClassicFrame } from '@/components/core/profile-frames/frame-templates/polaroid-classic-frame';
import { PolaroidPatternFrame } from '@/components/core/profile-frames/frame-templates/polaroid-pattern-frame';
import { RoundedCornersFrame } from '@/components/core/profile-frames/frame-templates/rounded-corners-frame';
import { getFrameAnimationProps } from '@/components/core/profile-frames/frame-animations';

const renderFrame = (template, props) => {
  // Log the template and props for debugging
  console.log('renderFrame:', { template, props });

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

const getFrameSpecificStyles = (template, thickness, props = {}) => {
  const baseStyles = {
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
        transform: `scale(${(100 - thickness) / 100})`,
      };
    case 'polaroid-pattern':
      return {
        ...baseStyles,
        borderRadius: '1px',
        overflow: 'hidden',
        transform: `scale(${(100 - thickness) / 100})`,
      };
    case 'rounded-corners': {
      // For rounded corners, we don't need to apply border-radius to the image container
      // since the SVG frame will handle the corner styling
      return {
        ...baseStyles,
        overflow: 'hidden',
      };
    }
    default:
      return baseStyles;
  }
};

const getRotationStyles = rotation => ({
  transform: `rotate(${rotation}deg)`,
  transition: 'transform 0.3s ease',
});

/**
 * UserAvatar component for preview panels
 * Uses dynamic sizing based on profileImageSize setting
 */
export const UserAvatar = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  const size = fetchedUser?.profileImageSize || 70;

  // For no frame, just show the raw image
  if (!fetchedUser?.frameTemplate || fetchedUser.frameTemplate === 'none') {
    return (
      <CloudinaryImage
        src={fetchedUser?.image}
        alt="avatar"
        width={size}
        height={size}
        className="object-cover"
      />
    );
  }

  // Calculate image size based on frame type and thickness
  const thickness = fetchedUser.frameThickness || 2;
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

  const frameStyles = getFrameSpecificStyles(fetchedUser.frameTemplate, thickness, frameProps);

  // Show framed image for other frame types
  return (
    <div
      className="frame-container relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Frame layer */}
      <div className="absolute inset-0 z-10" style={getRotationStyles(frameRotation)}>
        {renderFrame(fetchedUser.frameTemplate, {
          size,
          color: fetchedUser.frameColor || '#000000',
          thickness,
          rotation: 0,
          name: fetchedUser.name || '',
          animation: fetchedUser.frameAnimation || {
            type: null,
            enabled: false,
            config: {},
          },
          ...frameProps, // Add rounded corners properties
        })}
      </div>

      {/* Image layer */}
      <div className="absolute inset-0 z-0" style={getRotationStyles(pictureRotation)}>
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="image-container relative"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
              ...frameStyles,
            }}
          >
            <CloudinaryImage
              src={fetchedUser?.image}
              alt="avatar"
              width={imageSize}
              height={imageSize}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * UserAvatarSetting component for the settings page and preview panels
 * @param {Object} props - Component props
 * @param {boolean} [props.isPreview=false] - Whether the avatar is being shown in a preview panel
 * @param {string} [props.handle] - Optional handle for public view
 * Uses fixed 100px size in settings view and dynamic sizing in preview mode
 */
export const UserAvatarSetting = ({ isPreview = false, handle }) => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(handle || currentUser?.handle);

  const size = isPreview ? fetchedUser?.profileImageSize || 100 : 100;

  // For no frame, just show the raw image
  if (!fetchedUser?.frameTemplate || fetchedUser.frameTemplate === 'none') {
    return (
      <div className="relative" style={{ zIndex: 5 }}>
        <CloudinaryImage
          src={fetchedUser?.image}
          alt="avatar"
          width={size}
          height={size}
          className="object-cover"
          priority={!isPreview}
        />
      </div>
    );
  }

  // Calculate image size based on frame type and thickness
  const thickness = fetchedUser.frameThickness || 2;
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

  const frameStyles = getFrameSpecificStyles(fetchedUser.frameTemplate, thickness, frameProps);

  // Show framed image for other frame types
  return (
    <div
      className="frame-container relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        zIndex: 5,
      }}
    >
      {/* Frame layer */}
      <div className="absolute inset-0 z-10" style={getRotationStyles(frameRotation)}>
        {renderFrame(fetchedUser.frameTemplate, {
          size,
          color: fetchedUser.frameColor || '#000000',
          thickness,
          rotation: 0,
          name: fetchedUser.name || '',
          animation: fetchedUser.frameAnimation || {
            type: null,
            enabled: false,
            config: {},
          },
          ...frameProps, // Add rounded corners properties
        })}
      </div>

      {/* Image layer */}
      <div className="absolute inset-0 z-0" style={getRotationStyles(pictureRotation)}>
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="image-container relative"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
              ...frameStyles,
            }}
          >
            <CloudinaryImage
              src={fetchedUser?.image}
              alt="avatar"
              width={imageSize}
              height={imageSize}
              className="h-full w-full object-cover"
              priority={!isPreview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
