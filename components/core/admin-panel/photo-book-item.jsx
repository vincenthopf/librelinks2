import { useState } from 'react';
import {
  GripVertical,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PhotoBookTab from '@/components/core/photo-book/photo-book-tab';
import { AnimatePresence, motion } from 'framer-motion';

const PhotoBookItem = ({ id }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id, // Use a special ID to represent the photo book
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleExpand = (e) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg drop-shadow-md my-5 overflow-hidden"
    >
      {/* Header section */}
      <div className="flex items-center p-2">
        <div
          className="text-gray-400 text-sm hover:bg-blue-100 rounded-sm p-[3px]"
          {...attributes}
          {...listeners}
        >
          <GripVertical color="grey" size={17} />
        </div>
        {/* Photo Book Icon */}
        <div className="h-10 w-10 flex justify-center items-center bg-blue-100 rounded-full">
          <ImageIcon size={20} color="#4F46E5" />
        </div>
        <div className="flex-1 p-2 h-full relative">
          <div className="flex">
            <div className="w-full pr-3">
              <div className="grid mb-1 w-full grid-cols-[minmax(0,_90%)] items-baseline">
                <div className="w-full row-start-1 col-start-1 items-center">
                  <div className="flex items-center max-w-full rounded-[2px] outline-offset-2 outline-2 gap-2 lg:gap-4">
                    <p className="w-fit text-gray-900 font-semibold">
                      Photo Book
                    </p>
                  </div>
                </div>

                <div className="">
                  <div className="row-start-1 col-start-1 inline-flex">
                    <p className="text-gray-500 text-sm">
                      Your collection of photos displayed in your chosen layout
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleExpand}
                className="group rounded-full bg-gray-100 p-1.5 transition-all duration-75 hover:scale-105 hover:bg-blue-100 active:scale-95"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable content section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t"
          >
            <div className="p-4">
              <PhotoBookTab embedded={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoBookItem;
