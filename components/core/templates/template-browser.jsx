import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TemplatePreview from './template-preview';

const TemplateBrowser = ({ templates, onApplyTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
    } catch (error) {
      console.error('Error applying template:', error);
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates?.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <h3 className="font-medium text-lg mb-1">{template.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description || 'No description provided'}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Used {template.usageCount} times</span>
                <span>Rating: {template.rating.toFixed(1)}/5</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex items-center gap-1"
                  variant="outline"
                  size="sm"
                >
                  Preview
                </Button>

                <Button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowConfirmDialog(true);
                  }}
                  className="flex items-center gap-1"
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

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-medium mb-4">Apply Template</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to apply this template? Your current links
              will be preserved, but all styling settings will be replaced.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedTemplate(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleApplyTemplate} variant="default">
                Apply Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBrowser;
