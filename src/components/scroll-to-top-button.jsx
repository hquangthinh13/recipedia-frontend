// src/components/scroll-to-top-button.jsx
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200); // show after user scrolls 200px
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed  top-1/2 -translate-y-1/2 w-full pointer-events-none">
      <div className="mx-auto max-w-6xl px-6 py-4 justify-end flex">
        <Button
          size="icon-lg"
          className="rounded-full shadow-md cursor-pointer pointer-events-auto"
          variant="outline"
          onClick={scrollToTop}
        >
          <ArrowUp />
        </Button>
      </div>
    </div>
  );
};

export default ScrollToTopButton;
