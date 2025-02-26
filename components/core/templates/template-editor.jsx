import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ThemesPicker from '@/components/core/custom-page-themes/themes-picker';
import ButtonSelector from '@/components/core/custom-buttons/buttons-selector';
import FontSizeSelector from '@/components/core/custom-font-sizes/font-size-selector';
import ImageSizeSelector from '@/components/core/custom-image-sizes/image-size-selector';
import SizeSelector from '@/components/core/custom-sizes/size-selector';

const TemplateEditor = ({ template, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: template || {
      name: '',
      description: '',
      isPublic: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      // TODO: Add API call to save template
      await onSave(data);
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name
          </label>
          <Input
            {...register('name', { required: 'Template name is required' })}
            placeholder="Enter template name"
            className="w-full"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            {...register('description')}
            placeholder="Enter template description"
            className="w-full"
            rows={3}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('isPublic')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Make template public</span>
          </label>
        </div>
      </div>

      <div className="space-y-8">
        <div className="border-t pt-8">
          <h3 className="text-lg font-medium mb-4">Style Settings</h3>
          <ThemesPicker />
          <ButtonSelector />
          <SizeSelector />
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-medium mb-4">Links</h3>
          {/* TODO: Add link management interface */}
          <p className="text-gray-600">
            Link management interface coming soon...
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </form>
  );
};

export default TemplateEditor;
