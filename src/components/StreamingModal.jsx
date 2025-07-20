import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaRedo, FaExpand } from 'react-icons/fa';
import PropTypes from 'prop-types';

const StreamingModal = ({ movieId, tvId, isOpen, onClose, title, subtitle }) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1); // force reload on open
  }, [isOpen, movieId, tvId]);

  useEffect(() => {
    if (!isOpen) return;
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
              get() { return null; },
              set() {},
              configurable: true,
            },
          });
          setTimeout(() => {
            iframeWindow.dispatchEvent(new Event('resize'));
          }, 100);
        } catch {
          // Cross-origin, ignore
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
  }, [isOpen, retryKey]);

  if (!isOpen || (!movieId && !tvId)) return null;

  const isMovie = !!movieId;
  const id = movieId || tvId;
  const iframeSrc = isMovie
    ? `https://vidsrc.cc/v2/embed/movie/${id}`
    : `https://vidsrc.cc/v2/embed/tv/${id}`;
  const modalTitle = isMovie ? 'Film wird abgespielt' : 'Serie wird abgespielt';

  // Vollbild-Logik
  const handleFullscreen = () => {
    const el = iframeRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-2 py-8 overflow-y-auto" data-testid="streaming-modal">
      <div className="relative w-full max-w-5xl bg-black rounded-2xl flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-6 z-20 text-gray-300 hover:text-white bg-black/60 rounded-full p-2 transition focus:outline-none"
          title="Schliessen"
          data-testid="close-button"
        >
          <FaTimes size={28} />
        </button>
        {/* Header */}
        <div className="w-full flex flex-col items-center justify-center pt-8 pb-2 px-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-white text-2xl md:text-3xl font-extrabold tracking-tight" data-testid="modal-title">{modalTitle}</span>
            <span className="px-2 py-0.5 bg-[#e50914] text-xs md:text-sm rounded font-bold animate-pulse ml-1" data-testid="live-indicator">LIVE</span>
          </div>
          {title && (
            <div className="text-center text-white text-xl md:text-2xl font-bold mb-1 px-2 truncate max-w-[90vw]" title={title}>{title}</div>
          )}
          {subtitle && (
            <div className="text-center text-white text-base md:text-lg font-medium mb-1 px-2 truncate max-w-[90vw] opacity-80" title={subtitle}>{subtitle}</div>
          )}
        </div>
        {/* Player-Container */}
        <div className="relative w-full flex justify-center items-center px-2 pb-8">
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black">
            {loading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10 rounded-xl">
                <div className="text-white animate-pulse text-lg md:text-2xl font-semibold tracking-wide">Lade Stream...</div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 z-20 rounded-xl">
                <div className="text-red-500 text-lg md:text-2xl font-bold mb-2">Fehler beim Laden</div>
                <div className="text-white mb-4">Der VidPlay-Server konnte nicht erreicht werden.</div>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2 bg-[#e50914] text-white rounded hover:bg-red-700 transition font-bold"
                  data-testid="retry-button"
                >
                  <FaRedo /> Erneut versuchen
                </button>
              </div>
            )}
            <iframe
              key={retryKey}
              ref={iframeRef}
              src={iframeSrc}
              allowFullScreen
              title="VidPlay Video Player"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              referrerPolicy="no-referrer"
              className="absolute top-0 left-0 w-full h-full rounded-xl"
              style={{ pointerEvents: 'auto', userSelect: 'none', background: '#000' }}
              data-testid="video-iframe"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
            {/* Vollbild-Button unten rechts im Player */}
            <button
              onClick={handleFullscreen}
              className="absolute bottom-4 right-4 z-20 text-white bg-black/70 rounded-full p-2 hover:bg-[#e50914] hover:text-white focus:outline-none border border-[#e50914] transition"
              title="Vollbild"
              data-testid="fullscreen-button"
              style={{ backdropFilter: 'blur(2px)' }}
            >
              <FaExpand />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

StreamingModal.propTypes = {
  movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tvId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export default StreamingModal;
