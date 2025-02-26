import React from 'react';
import { Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import CloudinaryImage from '@/components/shared/cloudinary-image';

const TemplateList = ({ templates, onDelete, onUpload }) => {
  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await onDelete(templateId);
        toast.success('Template deleted successfully');
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete template');
      }
    }
  };

  const handleUpload = async (templateId) => {
    try {
      await onUpload(templateId);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Failed to upload thumbnail');
    }
  };

  if (!templates?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          No templates found. Create your first template to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="aspect-[9/19] relative">
            {template.thumbnailUrl ? (
              <CloudinaryImage
                src={template.thumbnailUrl}
                alt={template.name}
                width={360}
                height={760}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400">No thumbnail</p>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium text-lg mb-1">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {template.description || 'No description provided'}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Used {template.usageCount} times</span>
              <span>{template.isPublic ? 'Public' : 'Private'}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                onClick={() => handleUpload(template.id)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                variant="ghost"
                size="sm"
              >
                <Upload size={16} />
                {template.thumbnailUrl ? 'Change' : 'Upload'}
              </Button>

              <Button
                onClick={() => handleDelete(template.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                variant="ghost"
                size="sm"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateList;
