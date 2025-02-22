import {useRouter} from 'next/router';
import Preview from '../shared/profile-preview/preview';
import PreviewBtn from '../shared/profile-preview/preview-btn';
import Navbar from './navbar/navbar';

const Layout = ({children}) => {
  const router = useRouter();

  return (
    <>
      <section className="fixed inset-0 flex flex-col">
        <Navbar showName={false} isHomePage={false} />
        <main className="flex flex-row flex-1 overflow-hidden bg-[#F9FAFB]">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          {router.pathname != '/admin/analytics' && (
            <div className="hidden lg:block lg:w-[450px] h-full border-l">
              <div className="h-full p-4">
                <Preview />
              </div>
            </div>
          )}
          <PreviewBtn />
        </main>
      </section>
    </>
  );
};

export default Layout;
