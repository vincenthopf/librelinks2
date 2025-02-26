import React from 'react';
import { useRouter } from 'next/router';
import { Edit2, Trash2, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const TemplateList = ({ templates, onDelete, onDuplicate }) => {
  const router = useRouter();

  const handleEdit = (templateId) => {
    router.push(`/admin/templates-admin/${templateId}`);
  };

  const handlePreview = (templateId) => {
    router.push(`/admin/templates-admin/${templateId}/preview`);
  };

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

  const handleDuplicate = async (templateId) => {
    try {
      await onDuplicate(templateId);
      toast.success('Template duplicated successfully');
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
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
                onClick={() => handlePreview(template.id)}
                className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                variant="ghost"
                size="sm"
              >
                <Eye size={16} />
                Preview
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleEdit(template.id)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  variant="ghost"
                  size="sm"
                >
                  <Edit2 size={16} />
                  Edit
                </Button>

                <Button
                  onClick={() => handleDuplicate(template.id)}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700"
                  variant="ghost"
                  size="sm"
                >
                  <Copy size={16} />
                  Duplicate
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
        </div>
      ))}
    </div>
  );
};

export default TemplateList;
