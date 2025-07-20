import { useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';

const VideoPlayer = ({ movieId }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const originalWindowOpen = window.open;
    window.open = () => null;

    const currentIframe = iframeRef.current;

    const disableContextMenu = (event) => event.preventDefault();

    const preventIframeRedirects = () => {
      if (currentIframe?.contentWindow) {
        try {
          const iframeWindow = currentIframe.contentWindow;
          Object.defineProperties(iframeWindow, {
            open: { value: () => null, configurable: true },
            location: {
              get() {
                return null;
              },
              set() {},
              configurable: true,
            },
          });
          // Trigger a resize event to make sure the embedded content scales correctly
          setTimeout(() => {
            iframeWindow.dispatchEvent(new Event('resize'));
          }, 100); // slight delay
        } catch {
          console.warn(
            'Cross-origin restrictions prevented iframe modifications'
          );
        }
      }
    };

    const handleClickEvent = (event) => {
      if (currentIframe?.contains(event.target)) {
        event.stopPropagation();
      }
    };

    const handleWindowBlur = () => {
      requestAnimationFrame(() => {
        if (document.activeElement instanceof HTMLIFrameElement) {
          window.focus();
        }
      });
    };

    window.addEventListener('contextmenu', disableContextMenu);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('click', handleClickEvent, true);
    currentIframe?.addEventListener('load', preventIframeRedirects);

    return () => {
      window.open = originalWindowOpen;
      window.removeEventListener('contextmenu', disableContextMenu);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('click', handleClickEvent, true);
      currentIframe?.removeEventListener('load', preventIframeRedirects);
    };
  }, []);

  if (!movieId) return null;

  const iframeSrc = `https://vidsrc.dev/embed/movie/${movieId}`;

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        allowFullScreen
        title="Series Stream"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        referrerPolicy="no-referrer"
        className="absolute top-0 left-0   w-full h-[50vh] sm:h-[30vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] rounded shadow-lg mb-3"
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      />
    </div>
  );
};

VideoPlayer.propTypes = {
  movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default memo(VideoPlayer); 