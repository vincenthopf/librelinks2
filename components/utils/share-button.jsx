import { Share2, GithubIcon } from 'lucide-react';
import Link from 'next/link';
import useMediaQuery from '@/hooks/use-media-query';

const ShareButton = () => {
  return (
    <>
      <div className="flex items-center gap-2">
        <button className="flex bg-white items-center gap-2 border-2 border-slate-300 text-black rounded-lg py-2 px-2 lg:px-4 hover:bg-gray-100 hover:border-slate-300">
          <Share2 size={17} />
          <h3 className="text-sm">Share</h3>
        </button>
      </div>
    </>
  );
};

export default ShareButton;
