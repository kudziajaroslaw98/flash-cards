import { cn } from '#/shared/utils/cn.util';
import * as m from 'motion/react-m';
import { useState } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  position?: Position;
  content: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Tooltip = ({
  position = 'top',
  content,
  children,
  className = '',
}: TooltipProps) => {
  const [show, setShow] = useState(false);

  //   const positionClasses = {
  //     top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  //     bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  //     left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  //     right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  //   };

  const variants = {
    top: {
      hidden: {
        opacity: 0,
        y: 10,
      },
      visible: {
        opacity: 1,
        y: 0,
      },
    },
    bottom: {
      hidden: {
        opacity: 0,
        y: -10,
      },
      visible: {
        opacity: 1,
        y: 0,
      },
    },
    left: {
      hidden: {
        top: '50%',
        left: 0,
        translateY: '-50%',
        opacity: 0,
        x: 10,
      },
      visible: {
        top: '50%',
        left: 0,
        translateY: '-50%',
        opacity: 1,
        x: 0,
      },
    },
    right: {
      hidden: {
        zIndex: -1,
        top: '50%',
        right: 0,
        translateY: '-50%',
        opacity: 0,
        x: -10,
      },
      visible: {
        top: '50%',
        zIndex: -1,
        right: 0,
        translateY: '-50%',
        opacity: 1,
        x: 0,
      },
    },
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className='contents'
      >
        {children}
      </div>

      {show && (
        <m.div
          className={`absolute z-50`}
          variants={variants[position]}
          initial={'hidden'}
          animate={'visible'}
          exit={'hidden'}
        >
          <div className='relative'>
            <div className='whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-sm text-white shadow-lg'>
              {content}
              <div
                className={cn([
                  'absolute h-2 w-2 rotate-45 transform bg-gray-800',
                  position === 'top' && '-bottom-1 left-1/2 -translate-x-1/2',
                  position === 'bottom' && '-top-1 left-1/2 -translate-x-1/2',
                  position === 'right' && '-left-1 top-1/2 -translate-y-1/2',
                  position === 'left' && '-right-1 top-1/2 -translate-y-1/2',
                ])}
              />
            </div>
          </div>
        </m.div>
      )}
    </div>
  );
};

export default Tooltip;
