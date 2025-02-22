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
        <main className="bg-[#F9FAFB] flex flex-row flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          {router.pathname != '/admin/analytics' && (
            <div className="hidden lg:block lg:w-[450px] overflow-auto border-l">
              <div className="sticky top-0 p-4">
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
