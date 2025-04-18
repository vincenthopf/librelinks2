import React from 'react';
import Head from 'next/head';
import Link from 'next/link'; // Optional: If you want a back button

const TemplatesPage = () => {
  return (
    <>
      <Head>
        <title>Explore Templates | Idly.pro</title>
        <meta name="description" content="Browse stunning templates for your Idly.pro page." />
      </Head>

      {/* Basic Layout */}
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button (Optional) */}
          {/* 
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:underline">
              &larr; Back to Home
            </Link>
          </div> 
          */}

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Templates</h1>
          <p className="text-lg text-gray-600 mb-8">
            Explore our collection of templates. More coming soon!
          </p>

          {/* Placeholder for template gallery */}
          <div className="border-dashed border-2 border-gray-300 rounded-lg p-12 text-center text-gray-500">
            Template gallery will go here.
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplatesPage;
