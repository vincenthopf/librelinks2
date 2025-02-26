import React from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/core/templates/template-list';
import TemplateLoading from '@/components/core/templates/template-loading';

const TemplatesAdmin = () => {
  const queryClient = useQueryClient();

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
    },
  });

  // Duplicate template mutation
  const duplicateMutation = useMutation({
    mutationFn: async (templateId) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const { data } = await axios.post('/api/templates', {
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
    },
  });

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
              <TemplateList
                templates={templates}
                onDelete={(id) => deleteMutation.mutateAsync(id)}
                onDuplicate={(id) => duplicateMutation.mutateAsync(id)}
              />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TemplatesAdmin;
