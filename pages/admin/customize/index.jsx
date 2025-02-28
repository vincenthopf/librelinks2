import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Footer from '@/components/layout/footer/footer';
import ButtonSelector from '@/components/core/custom-buttons/buttons-selector';
import ThemesPicker from '@/components/core/custom-page-themes/themes-picker';
import FontSizeSelector from '@/components/core/custom-font-sizes/font-size-selector';
import FontSelector from '@/components/core/custom-fonts/font-selector';
import ImageSizeSelector from '@/components/core/custom-image-sizes/image-size-selector';
import SizeSelector from '@/components/core/custom-sizes/size-selector';
import BackgroundImageSelector from '@/components/core/background-images/background-image-selector';
import Head from 'next/head';

const Customize = () => {
  const [activeTab, setActiveTab] = useState('themes');

  return (
    <>
      <Head>
        <title>Librelinks | Customize</title>
      </Head>
      <Layout>
        <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-auto">
          <div className="max-w-[690px] mx-auto my-10">
            <h1 className="text-2xl font-bold mb-6">Customize</h1>

            {/* Tab Navigation */}
            <div className="flex border-b mb-8 flex-wrap">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'themes'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('themes')}
              >
                Themes
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
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'buttons'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('buttons')}
              >
                Buttons
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'fonts'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('fonts')}
              >
                Fonts
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'sizes'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('sizes')}
              >
                Sizes
              </button>
            </div>

            {/* Themes Tab */}
            {activeTab === 'themes' && (
              <div className="space-y-8">
                <ThemesPicker />
              </div>
            )}

            {/* Background Images Tab */}
            {activeTab === 'backgrounds' && (
              <div className="space-y-8">
                <BackgroundImageSelector />
              </div>
            )}

            {/* Buttons Tab */}
            {activeTab === 'buttons' && (
              <div className="space-y-8">
                <ButtonSelector />
              </div>
            )}

            {/* Fonts Tab */}
            {activeTab === 'fonts' && (
              <div className="space-y-8">
                <FontSelector />
              </div>
            )}

            {/* Sizes Tab */}
            {activeTab === 'sizes' && (
              <div className="space-y-8">
                <SizeSelector />
              </div>
            )}
          </div>
          <Footer />
        </div>
      </Layout>
    </>
  );
};

export default Customize;
