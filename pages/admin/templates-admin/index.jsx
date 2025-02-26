import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/core/templates/template-list';
import TemplateLoading from '@/components/core/templates/template-loading';
import UploadThumbnailDialog from '@/components/core/templates/upload-thumbnail-dialog';

const TemplatesAdmin = () => {
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await axios.get('/api/templates');
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
            <p className="text-gray-600 mb-8">
              Create and manage templates that users can apply to their
              profiles.
            </p>

            {isLoading ? (
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
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TemplatesAdmin;
