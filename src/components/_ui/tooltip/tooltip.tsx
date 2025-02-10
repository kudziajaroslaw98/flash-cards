import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { cn } from '#/shared/utils/cn.util';
import { useAnimate } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  position?: Position;
  content: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  show?: boolean;
}

const Tooltip = ({
  position = 'top',
  content,
  children,
  className = '',
  show = true,
}: TooltipProps) => {
  const [scope, animate] = useAnimate();
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef(null);

  const hiddenBase = {
    opacity: 0,
    transitionEnd: {
      zIndex: -1,
    },
    scale: 0.9,
  };
  const visibleBase = {
    zIndex: 50,
    opacity: 1,
    scale: 1,
    cursor: 'pointer',
  };

  const variants = {
    top: {
      hidden: {
        top: 10,
        y: '-100%',
        x: '-50%',
        ...hiddenBase,
      },
      visible: {
        left: '50%',
        top: 0,
        x: '-50%',
        y: '-110%',
        ...visibleBase,
      },
    },
    bottom: {
      hidden: {
        left: '50%',
        bottom: 10,
        x: '-50%',
        y: '90%',
        ...hiddenBase,
      },
      visible: {
        left: '50%',
        bottom: 0,
        x: '-50%',
        y: '100%',
        ...visibleBase,
      },
    },
    left: {
      hidden: {
        top: '50%',
        left: 0,
        y: '-50%',
        x: '-100%',
        ...hiddenBase,
      },
      visible: {
        top: '50%',
        left: 0,
        y: '-50%',
        x: '-110%',
        ...visibleBase,
      },
    },
    right: {
      hidden: {
        top: '50%',
        right: 10,
        y: '-50%',
        x: '100%',
        ...hiddenBase,
      },
      visible: {
        top: '50%',
        right: 0,
        y: '-50%',
        x: '110%',
        ...visibleBase,
      },
    },
  };

  useEffect(() => {
    if (show) {
      animate(scope.current, variants[position].hidden);
    }
  }, [scope.current]);

  const handleOnHoverStart = () => {
    if (show) {
      setIsVisible(true);
      animate(scope.current, variants[position].visible, {
        duration: 0.2,
      });
    }
  };

  const handleOnHoverEnd = () => {
    if (show) {
      setIsVisible(false);
      animate(scope.current, variants[position].hidden, {
        duration: 0.2,
      });
    }
  };

  const handleOnTap = () => {
    if (show) {
      setIsVisible(true);
      animate(scope.current, variants[position].visible, {
        duration: 0.2,
      });
    }
  };

  useOutsideAlerter(wrapperRef, () => {
    if (show && isVisible) {
      setIsVisible(false);
      animate(scope.current, variants[position].hidden, {
        duration: 0.2,
      });
    }
  });

  return (
    <m.div
      onHoverStart={handleOnHoverStart}
      onHoverEnd={handleOnHoverEnd}
      onTap={handleOnTap}
      className='relative'
      ref={wrapperRef}
    >
      <m.div className='contents'>{children}</m.div>

      <m.div
        className={cn(['absolute', className])}
        animate={variants[position].hidden}
        initial={variants[position].hidden}
        transition={{
          duration: 2000,
        }}
        ref={scope}
      >
        <div className='relative'>
          <div className='rounded-md bg-slate-900 px-3 py-2 text-xs text-gray-200 shadow-sm dark:bg-slate-200 dark:text-gray-800'>
            {content}
            <div
              className={cn([
                'absolute h-2 w-2 rotate-45 transform bg-slate-900 dark:bg-gray-200',
                position === 'top' && '-bottom-1 left-1/2 -translate-x-1/2',
                position === 'bottom' && '-top-1 left-1/2 -translate-x-1/2',
                position === 'right' && '-left-1 top-1/2 -translate-y-1/2',
                position === 'left' && '-right-1 top-1/2 -translate-y-1/2',
              ])}
            />
          </div>
        </div>
      </m.div>
    </m.div>
  );
};

export default Tooltip;
