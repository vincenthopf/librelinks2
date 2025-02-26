import React from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TemplateBrowser from '@/components/core/templates/template-browser';
import TemplateLoading from '@/components/core/templates/template-loading';

const TemplatesUser = () => {
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await axios.get('/api/templates');
      return data;
    },
  });

  // Apply template mutation
  const applyMutation = useMutation({
    mutationFn: async (templateId) => {
      await axios.post('/api/templates/apply', { templateId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Template applied successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to apply template');
    },
  });

  return (
    <>
      <Head>
        <title>Librelinks | Templates</title>
      </Head>
      <Layout>
        <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-auto">
          <div className="max-w-[690px] mx-auto my-10">
            <h1 className="text-2xl font-bold mb-6">Templates</h1>
            <p className="text-gray-600 mb-8">
              Browse and apply templates to your profile. Choose from a variety
              of pre-designed layouts and styles.
            </p>

            {isLoading ? (
              <TemplateLoading />
            ) : (
              <TemplateBrowser
                templates={templates}
                onApplyTemplate={(id) => applyMutation.mutateAsync(id)}
              />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TemplatesUser;
