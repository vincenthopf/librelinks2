import React from 'react';
import Layout from '@/components/layout/Layout';
import Footer from '@/components/layout/footer/footer';
import ButtonSelector from '@/components/core/custom-buttons/buttons-selector';
import ThemesPicker from '@/components/core/custom-page-themes/themes-picker';
import FontSizeSelector from '@/components/core/custom-font-sizes/font-size-selector';
import ImageSizeSelector from '@/components/core/custom-image-sizes/image-size-selector';
import Head from 'next/head';

const Customize = () => {
  return (
    <>
      <Head>
        <title>Librelinks | Customize</title>
      </Head>
      <Layout>
        <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-auto">
          <ThemesPicker />
          <ButtonSelector />
          <FontSizeSelector />
          <ImageSizeSelector />
          <Footer />
        </div>
      </Layout>
    </>
  );
};

export default Customize;
