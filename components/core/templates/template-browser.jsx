import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TemplatePreview from './template-preview';
import CloudinaryImage from '@/components/shared/cloudinary-image';
import { signalIframe } from '@/utils/helpers';

const TemplateBrowser = ({ templates, onApplyTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

  const filteredTemplates = templates?.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyTemplate = async () => {
    try {
      await onApplyTemplate(selectedTemplate.id);
      setShowConfirmDialog(false);
      setSelectedTemplate(null);
      signalIframe();
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const handleImageError = (templateId) => {
    setFailedImages((prev) => new Set([...prev, templateId]));
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTemplates?.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-[9/19] relative">
              {template.thumbnailUrl && !failedImages.has(template.id) ? (
                <div className="w-full h-full relative">
                  <CloudinaryImage
                    src={template.thumbnailUrl}
                    alt={template.name}
                    width={500}
                    height={1056}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(template.id)}
                    loading="eager"
                    quality={100}
                  />
                  <div
                    className="absolute inset-0 bg-gray-100 animate-pulse"
                    style={{
                      opacity: 0,
                      animation: 'fadeOut 0.1s ease-in-out',
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400">No thumbnail</p>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-medium text-base mb-3 text-center">
                {template.name}
              </h3>
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowConfirmDialog(true);
                  }}
                  className="flex items-center gap-1 text-xs"
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
              <Button
                onClick={() => setSelectedTemplate(null)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                variant="default"
              >
                Apply Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Apply Template</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to apply this template? This will update
              your page appearance and layout.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleApplyTemplate} variant="default">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBrowser;
