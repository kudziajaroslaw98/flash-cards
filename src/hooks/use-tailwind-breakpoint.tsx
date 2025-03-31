import { useEffect, useState } from 'react';

/**
 * React hook that returns the current Tailwind CSS breakpoint based on window width
 * @returns {string} Current breakpoint: 'mobile', 'sm', 'md', 'lg', 'xl', or '2xl'
 */
const useTailwindBreakpoint = () => {
  // Default to 'mobile' for SSR
  const [breakpoint, setBreakpoint] = useState('mobile');

  useEffect(() => {
    // Function to determine the current breakpoint
    const calculateBreakpoint = () => {
      const width = window.innerWidth;

      // Tailwind default breakpoints
      if (width < 640) return 'mobile'; // below sm
      if (width < 768) return 'sm'; // sm: 640px
      if (width < 1024) return 'md'; // md: 768px
      if (width < 1280) return 'lg'; // lg: 1024px
      if (width < 1536) return 'xl'; // xl: 1280px
      return '2xl'; // 2xl: 1536px+
    };

    // Set the initial breakpoint
    setBreakpoint(calculateBreakpoint());

    // Add event listener for window resize
    const handleResize = () => {
      setBreakpoint(calculateBreakpoint());
    };

    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoint;
};

export default useTailwindBreakpoint;
