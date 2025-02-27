import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/core/templates/template-list';
import TemplateLoading from '@/components/core/templates/template-loading';
import UploadThumbnailDialog from '@/components/core/templates/upload-thumbnail-dialog';
import BackgroundImageUploader from '@/components/core/background-images/background-image-uploader';
import BackgroundImageList from '@/components/core/background-images/background-image-list';

const TemplatesAdmin = () => {
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'backgrounds'

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await axios.get('/api/templates');
      return data;
    },
  });

  // Fetch background images
  const { data: backgroundImages, isLoading: backgroundsLoading } = useQuery({
    queryKey: ['backgroundImages'],
    queryFn: async () => {
      const { data } = await axios.get('/api/background-images');
      return data;
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId) => {
      await axios.delete(`/api/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete template');
    },
  });

  const handleUpload = (templateId) => {
    setSelectedTemplateId(templateId);
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = () => {
    queryClient.invalidateQueries(['templates']);
    setUploadDialogOpen(false);
    setSelectedTemplateId(null);
  };

  return (
    <>
      <Head>
        <title>Librelinks | Templates Admin</title>
      </Head>
      <Layout>
        <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-auto">
          <div className="max-w-[690px] mx-auto my-10">
            <h1 className="text-2xl font-bold mb-6">Templates Admin</h1>

            {/* Tab Navigation */}
            <div className="flex border-b mb-8">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'templates'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('templates')}
              >
                Templates
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'backgrounds'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('backgrounds')}
              >
                Background Images
              </button>
            </div>

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <>
                <p className="text-gray-600 mb-8">
                  Create and manage templates that users can apply to their
                  profiles.
                </p>

                {templatesLoading ? (
                  <TemplateLoading />
                ) : (
                  <>
                    <TemplateList
                      templates={templates}
                      onDelete={(id) => deleteMutation.mutateAsync(id)}
                      onUpload={handleUpload}
                    />
                    <UploadThumbnailDialog
                      templateId={selectedTemplateId}
                      open={uploadDialogOpen}
                      onOpenChange={setUploadDialogOpen}
                      onUploadComplete={handleUploadComplete}
                    />
                  </>
                )}
              </>
            )}

            {/* Background Images Tab */}
            {activeTab === 'backgrounds' && (
              <>
                <p className="text-gray-600 mb-8">
                  Upload and manage background images that users can apply to
                  their profiles. These images will be available for all users
                  to select in the Customize section.
                </p>

                <BackgroundImageUploader />

                {backgroundsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Loading background images...
                    </p>
                  </div>
                ) : (
                  <BackgroundImageList backgroundImages={backgroundImages} />
                )}
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TemplatesAdmin;
