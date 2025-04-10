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

      // Ensure JSON fields are properly parsed
      return data.map(template => {
        // Convert string JSON to objects if needed
        try {
          if (template.themePalette && typeof template.themePalette === 'string') {
            template.themePalette = JSON.parse(template.themePalette);
          }

          if (template.frameAnimation && typeof template.frameAnimation === 'string') {
            template.frameAnimation = JSON.parse(template.frameAnimation);
          }

          if (template.linkExpansionStates && typeof template.linkExpansionStates === 'string') {
            template.linkExpansionStates = JSON.parse(template.linkExpansionStates);
          }

          if (template.photoBookImageData && typeof template.photoBookImageData === 'string') {
            template.photoBookImageData = JSON.parse(template.photoBookImageData);
          }
        } catch (e) {
          console.error('Error parsing template JSON fields:', e, { templateId: template.id });
        }

        return template;
      });
    },
  });

  // Apply template mutation
  const applyMutation = useMutation({
    mutationFn: async ({ templateId, sectionsToApply }) => {
      console.log('Applying template mutation:', { templateId, sectionsToApply });
      const response = await axios.post('/api/templates/apply', {
        templateId,
        sectionsToApply,
      });
      console.log('Template application response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
    },
    onError: error => {
      console.error('Template application mutation error:', error.response?.data || error.message);
    },
  });

  return (
    <Layout>
      <Head>
        <title>Idly.pro | Templates</title>
      </Head>
      <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-auto">
        <div className="max-w-[640px] mx-auto my-10">
          <h1 className="text-2xl font-bold mb-6">Templates</h1>
          <p className="text-gray-600 mb-8">
            Browse and apply templates to your profile. Choose from a variety of pre-designed
            layouts and styles.
          </p>

          {isLoading ? (
            <TemplateLoading />
          ) : (
            <TemplateBrowser
              templates={templates}
              onApplyTemplate={(id, sections) =>
                applyMutation.mutateAsync({ templateId: id, sectionsToApply: sections })
              }
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TemplatesUser;
