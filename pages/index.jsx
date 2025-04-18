/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { ArrowRight } from 'lucide-react';
import LazyLottieLoader from '@/components/utils/lazy-lottie-loader';

// Updated pageMeta
const pageMeta = {
  title: 'Idly.pro | Your space, beautifully designed.',
  description:
    'Craft your stunning link-in-bio page with Idly.pro. Connect your socials, content, and more in one beautiful place. Get started for free.',
};

const Home = () => {
  const session = useSession();
  const isAuthenticated = session.status === 'authenticated';

  return (
    <>
      <Head>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
        <meta property="og:title" content="Idly.pro | Your space, beautifully designed." />
        <meta property="og:description" content={pageMeta.description} />
        <meta property="og:url" content="https://idly.pro/" />
        <meta property="og:site_name" content="Idly.pro" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image-new.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Idly.pro | Your space, beautifully designed." />
        <meta name="twitter:description" content={pageMeta.description} />
        <meta name="twitter:image" content="/twitter-image-new.png" />
        <meta
          name="keywords"
          content="link in bio, bio link, linktree alternative, bento alternative, bio site alternative, personal landing page, creator page, free link in bio"
        />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 font-sans overflow-x-hidden">
        <header className="absolute top-0 left-0 right-0 z-10 py-4 px-6 md:px-10">
          <div className="container mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="font-bold text-2xl text-gray-900 hover:text-blue-600 transition-colors"
            >
              Idly.pro
            </Link>
            <Link
              className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              href={isAuthenticated ? '/admin' : '/login'}
            >
              {isAuthenticated ? 'Dashboard' : 'Login'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="relative flex flex-col items-center justify-center min-h-[70vh] md:min-h-[60vh] pt-32 pb-16 text-center">
          <div className="relative z-1 container mx-auto px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
              Your link in bio. <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Rich and Beautiful.
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-600 mb-8">
              Create a personal page to showcase everything you are and create. Effortlessly connect
              your audience to all your content.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-base md:text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Your Page - It&apos;s Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div>
            <LazyLottieLoader
              path={'/lotties/Letters.json'}
              loop={true}
              autoplay={true}
              className="relative left-1/2 -translate-x-1/2 w-[100vw] lg:w-[80vw] max-w-none h-auto"
            />
          </div>
          <div className="mt-16 md:mt-24">
            <LazyLottieLoader
              path={'/lotties/Scene (2).json'}
              loop={true}
              autoplay={true}
              className="relative left-1/2 -translate-x-1/2 w-[150vw] lg:w-[120vw] max-w-none h-auto"
            />
          </div>
          <div className="mt-16 md:mt-24">
            <LazyLottieLoader
              path={'/lotties/Social-Media-Icons-[remix].json'}
              loop={true}
              autoplay={true}
              className="relative left-1/2 -translate-x-1/2 w-[120vw] lg:w-[100vw] max-w-none h-auto"
            />
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to build your corner of the internet?
            </h2>
            <p className="max-w-xl mx-auto text-lg text-gray-300 mb-8">
              Join thousands of creators building their beautiful link-in-bio pages.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-gray-900 bg-white rounded-full shadow-lg hover:bg-gray-200 transform hover:-translate-y-0.5 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Get Started For Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <footer className="py-8 bg-white">
          <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Idly.pro. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
