import LinksEditor from '../../components/core/admin-panel/links-editor';
import Layout from '@/components/layout/Layout';
import useMediaQuery from '@/hooks/use-media-query';
import Head from 'next/head';

const Admin = () => {
  const { isMobile } = useMediaQuery();

  return (
    <>
      <Head>
        <title>Idly.pro | Admin</title>
      </Head>
      <Layout>
        <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-auto">
          <LinksEditor />
        </div>
      </Layout>
    </>
  );
};

export default Admin;
