import React, { useState } from 'react';
import { Search, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TemplatePreview from './template-preview';
import CloudinaryImage from '@/components/shared/cloudinary-image';
import { signalIframe } from '@/utils/helpers';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

// Define the sections that can be applied
const APPLY_SECTIONS = {
  PROFILE_INFO: 'Profile Info (Name, Bio, Handle)',
  STYLING: 'Styling (Theme, Buttons, Fonts, Frame, Padding)',
  PROFILE_IMAGE: 'Profile Image',
  BACKGROUND_IMAGE: 'Background Image',
  LINKS: 'Links (Only if you have no existing links)',
  PHOTO_BOOK: 'Photo Book Images (Replaces existing)',
};

const TemplateBrowser = ({ templates, onApplyTemplate }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [isApplying, setIsApplying] = useState(false);
  // State to manage selected sections for application
  const [selectedApplySections, setSelectedApplySections] = useState(
    new Set(Object.keys(APPLY_SECTIONS)) // Default to all selected
  );

  const filteredTemplates = templates?.filter(
    template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle selection for a section
  const handleSectionToggle = sectionKey => {
    setSelectedApplySections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const handleApplyTemplate = async () => {
    setIsApplying(true);
    const loadingToast = toast.loading('Applying selected template sections...');

    try {
      const sectionsToApply = Array.from(selectedApplySections);
      console.log('Applying template:', selectedTemplate.id, 'Sections:', sectionsToApply);

      await onApplyTemplate(selectedTemplate.id, sectionsToApply);

      toast.dismiss(loadingToast);
      toast.success('Template sections applied successfully. Reloading page...');

      setShowConfirmDialog(false);
      setSelectedTemplate(null);
      setSelectedApplySections(new Set(Object.keys(APPLY_SECTIONS))); // Reset selections

      signalIframe();

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error applying template:', error);
      toast.error(
        `Failed to apply template: ${error.response?.data?.details || error.message || 'Unknown error'}`
      );
      setIsApplying(false); // Ensure loading state stops on error
    }
  };

  const handleImageError = templateId => {
    setFailedImages(prev => new Set([...prev, templateId]));
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTemplates?.map(template => (
          <div
            key={template.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-[9/19] relative bg-gray-100">
              {template.thumbnailUrl && !failedImages.has(template.id) ? (
                <CloudinaryImage
                  src={template.thumbnailUrl}
                  alt={template.name}
                  layout="fill"
                  objectFit="cover"
                  className="w-full h-full"
                  onError={() => handleImageError(template.id)}
                  loading="lazy"
                  quality={80}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  {template.thumbnailUrl ? 'Error loading thumbnail' : 'No thumbnail'}
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="font-medium text-sm sm:text-base mb-2 text-center truncate">
                {template.name}
              </h3>
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowConfirmDialog(true);
                    setSelectedApplySections(new Set(Object.keys(APPLY_SECTIONS)));
                  }}
                  className="flex items-center gap-1 text-xs sm:text-sm"
                  variant="default"
                  size="sm"
                >
                  Apply Template
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && !showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">{selectedTemplate.name}</h2>
              <p className="text-gray-600">{selectedTemplate.description}</p>
            </div>
            {selectedTemplate.thumbnailUrl && (
              <div className="p-4 border-b">
                <CloudinaryImage
                  src={selectedTemplate.thumbnailUrl}
                  alt={selectedTemplate.name}
                  width={360}
                  height={760}
                  className="w-full h-auto mx-auto"
                />
              </div>
            )}
            <div className="p-4">
              <TemplatePreview template={selectedTemplate} />
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button onClick={() => setSelectedTemplate(null)} variant="outline">
                Close
              </Button>
              <Button onClick={() => setShowConfirmDialog(true)} variant="default">
                Apply Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Apply Template Sections</h2>
            <p className="text-gray-700 mb-1">
              Select which parts of the &quot;
              <span className="font-medium">{selectedTemplate.name}</span>&quot; template to apply:
            </p>
            <p className="text-xs text-gray-500 mb-5">
              Applying sections like Profile Info or Photo Book will overwrite your current content
              in those areas.
            </p>

            <div className="space-y-3 mb-6">
              {Object.entries(APPLY_SECTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedApplySections.has(key)}
                    onChange={() => handleSectionToggle(key)}
                    disabled={isApplying}
                  />
                  {selectedApplySections.has(key) ? (
                    <CheckSquare size={20} className="text-blue-600 flex-shrink-0" />
                  ) : (
                    <Square size={20} className="text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${isApplying ? 'text-gray-500' : 'text-gray-800'}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedTemplate(null);
                }}
                variant="outline"
                disabled={isApplying}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyTemplate}
                variant="default"
                disabled={isApplying || selectedApplySections.size === 0}
              >
                {isApplying ? 'Applying...' : `Apply Selected (${selectedApplySections.size})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBrowser;
