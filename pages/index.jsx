/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

const pageMeta = {
  title: 'Idly.pro',
  description:
    'Idly.pro is an opensource link in bio tool that helps you easily manage your links, transforming your online presence.',
};

const Home = () => {
  const session = useSession();
  const isAuthenticated = session.status === 'authenticated' ? true : false;

  return (
    <>
      <Head>
        <title>Idly.pro | A free & opensource link in bio tool</title>
        <meta name="description" content={pageMeta.description} />
        <meta property="og:url" content="https://librelinks.vercel.app/" />
        <meta property="og:url" content="https://librelinks.me/" />
        <meta property="og:url" content="https://www.librelinks.me/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Idly.pro - The free & opensource link in bio tool" />
        <meta property="og:title" content="Idly.pro" />
        <meta property="og:description" content={pageMeta.description} />
        <meta property="og:image" itemProp="image" content="https://librelinks.vercel.app/og.png" />
        <meta property="og:image" itemProp="image" content="https://librelinks.me/og.png" />
        <meta property="og:image" itemProp="image" content="https://www.librelinks.me/og.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@urdadx" />
        <meta name="twitter:creator" content="@urdadx" />
        <meta property="twitter:domain" content="https://librelinks.vercel.app/" />
        <meta property="twitter:domain" content="https://librelinks.me/" />
        <meta property="twitter:domain" content="https://www.librelinks.me/" />
        <meta property="twitter:url" content="https://librelinks.vercel.app/" />
        <meta
          property="twitter:title"
          content="Idly.pro - The free & opensource link in bio tool"
        />
        <meta name="twitter:description" content={pageMeta.description} />
        <meta name="twitter:image" content="https://librelinks.vercel.app/og.png" />
        <meta name="twitter:image" content="https://librelinks.me/og.png" />
        <meta name="twitter:image" content="https://www.librelinks.me/og.png" />
        <meta
          data-rh="true"
          name="twitter:image:alt"
          content="Idly.pro is an opensource link in bio tool that helps you easily manage your links, transforming your online presence."
        />

        <meta property="og:linkedin:image" content="https://librelinks.vercel.app/og.png" />
        <meta property="og:linkedin:image" content="https://librelinks.me/og.png" />
        <meta property="og:linkedin:image" content="https://www.librelinks.me/og.png" />
        <meta property="og:linkedin:title" content="Idly.pro" />
        <meta
          property="og:linkedin:description"
          content="Idly.pro is an opensource link in bio tool that helps you easily manage your links, transforming your online presence."
        />

        <meta property="og:facebook:image" content="https://librelinks.vercel.app/og.png" />
        <meta property="og:facebook:image" content="https://librelinks.me/og.png" />
        <meta property="og:facebook:image" content="https://www.librelinks.me/og.png" />
        <meta property="og:facebook:title" content="Idly.pro" />
        <meta property="og:facebook:description" content={pageMeta.description} />

        <meta property="og:instagram:image" content="https://librelinks.vercel.app/og.png" />
        <meta property="og:instagram:image" content="https://librelinks.me/og.png" />
        <meta property="og:instagram:image" content="https://www.librelinks.me/og.png" />
        <meta property="og:instagram:title" content="Idly.pro" />
        <meta property="og:instagram:description" content={pageMeta.description} />

        <meta property="og:pinterest:image" content="https://librelinks.vercel.app/og.png" />
        <meta property="og:pinterest:image" content="https://librelinks.me/og.png" />
        <meta property="og:pinterest:image" content="https://www.librelinks.me/og.png" />
        <meta property="og:pinterest:title" content="Idly.pro" />
        <meta property="og:pinterest:description" content={pageMeta.description} />

        <meta name="keywords" content="linktree, linktree alternative" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="relative overflow-hidden">
          <div className="absolute inset-y-0 w-full h-full" aria-hidden="true"></div>
          <div className="relative pt-6 pb-8 sm:pb-12">
            <div className="px-4 mx-auto max-w-7xl sm:px-6">
              <nav
                className="relative flex items-center justify-between md:justify-start"
                aria-label="Global"
              >
                <Link className="flex items-center gap-2 font-bold text-xl" href="/">
                  <h3 className="lg:block">Idly.pro</h3>
                </Link>

                <div className="relative items-center w-28 z-10 md:absolute md:inset-y-0 md:right-0">
                  <Link
                    className="group inline-flex items-center gap-2 px-4 text-sm  bg-slate-900 border rounded-3xl text-white w-[116px] h-[35px] justify-center font-semibold transition-colors hover:bg-slate-700"
                    rel="noopener noreferrer"
                    href="/admin"
                  >
                    {isAuthenticated ? 'Admin' : 'Login'}
                  </Link>
                </div>
              </nav>
            </div>
            <div className="px-4 mx-auto mt-24 max-w-7xl sm:mt-16 sm:px-6">
              <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">The free & opensource</span>
                  <span className="hero-title block ">link in bio tool</span>
                </h1>
                <p className="max-w-md mx-auto mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Idly.pro is an opensource link in bio tool that helps you easily manage your
                  links, transforming your online presence.
                </p>
              </div>
              <div className="flex justify-center mt-6">
                <div className="flex flex-col items-center">
                  <span className="inline-flex rounded-xl shadow">
                    <Link legacyBehavior href="/register">
                      <a className="inline-flex items-center px-4 py-2 font-medium text-lg gradient-btn border border-transparent rounded-xl text-white w-[190px] h-[50px] justify-center hover:shadow-lg">
                        Get started
                      </a>
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex flex-col" aria-hidden="true">
              <div className="flex-1" />
              <div className="flex-1 w-full bg-slate-900 " />
            </div>
            <div className="px-4 mx-auto max-w-7xl sm:px-6">
              <Image
                className="relative rounded-lg shadow-lg"
                src="/assets/new_shot.png"
                alt="App screenshot"
                height={700}
                width={1200}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
