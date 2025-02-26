import React from 'react';
import { useSession } from 'next-auth/react';
import Preview from '@/components/shared/profile-preview/preview';

const TemplatePreview = ({ template }) => {
  const { data: session } = useSession();

  // Create a temporary user object with template settings
  const previewUser = {
    ...session?.user,
    links: template.links,
    linksLocation: template.linksLocation,
    themePalette: template.themePalette,
    buttonStyle: template.buttonStyle,
    profileNameFontSize: template.profileNameFontSize,
    bioFontSize: template.bioFontSize,
    linkTitleFontSize: template.linkTitleFontSize,
    profileImageSize: template.profileImageSize,
    socialIconSize: template.socialIconSize,
    faviconSize: template.faviconSize,
    frameTemplate: template.frameTemplate,
    frameColor: template.frameColor,
    frameThickness: template.frameThickness,
    frameRotation: template.frameRotation,
    pictureRotation: template.pictureRotation,
    syncRotation: template.syncRotation,
    frameAnimation: template.frameAnimation,
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-medium mb-2">Preview</h2>
        <p className="text-gray-600 text-sm mb-4">
          This is how your profile will look with this template applied.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Preview user={previewUser} />
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
