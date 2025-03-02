import { useRouter } from 'next/router';
import Preview from '../shared/profile-preview/preview';
import PreviewBtn from '../shared/profile-preview/preview-btn';
import Navbar from './navbar/navbar';
import FrameRefreshHandler from '../utils/frame-refresh-handler';

const Layout = ({ children }) => {
  const router = useRouter();

  return (
    <>
      <section className="min-h-screen flex flex-col">
        <Navbar showName={false} isHomePage={false} />
        <main className="bg-[#F9FAFB] flex flex-row flex-1">
          {children}
          {router.pathname != '/admin/analytics' && (
            <div className="hidden lg:my-auto lg:block lg:basis-2/5 pl-4">
              <Preview />
            </div>
          )}

          <PreviewBtn />

          <FrameRefreshHandler />
        </main>
      </section>
    </>
  );
};

export default Layout;
