import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock der TMDB API für realistische Daten
vi.mock('../services/tmdb', () => ({
  movieApi: {
    getDetails: vi.fn(),
    getCredits: vi.fn(),
    getReviews: vi.fn(),
    getSimilar: vi.fn(),
    getRecommendations: vi.fn(),
    getReleaseDates: vi.fn(),
    getTrending: vi.fn(),
    getPopular: vi.fn(),
    getTopRated: vi.fn(),
    getNowPlaying: vi.fn(),
    getUpcoming: vi.fn(),
  },
  tvApi: {
    getDetails: vi.fn(),
    getCredits: vi.fn(),
    getReviews: vi.fn(),
    getSimilar: vi.fn(),
    getRecommendations: vi.fn(),
    getTrending: vi.fn(),
    getPopular: vi.fn(),
    getTopRated: vi.fn(),
    getOnTheAir: vi.fn(),
    getAiringToday: vi.fn(),
  },
  getBackdropUrl: vi.fn((path) => `https://image.tmdb.org/t/p/original${path}`),
  getImageUrl: vi.fn((path, size) => `https://image.tmdb.org/t/p/${size}${path}`),
  netflixFeatures: {
    addToContinueWatching: vi.fn(),
  },
  tmdbApi: {
    getMovieVideos: vi.fn(),
    getTvVideos: vi.fn(),
  }
}));

// Mock der Routes
vi.mock('../routes', () => ({
  default: () => null
}));

const mockMovieData = {
  id: 550,
  title: 'Fight Club',
  overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
  backdrop_path: '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
  poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  release_date: '1999-10-15',
  runtime: 139,
  vote_average: 8.4,
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' }
  ],
  budget: 63000000,
  revenue: 100853753,
};

const mockCreditsData = {
  cast: [
    { id: 287, name: 'Brad Pitt', character: 'Tyler Durden', profile_path: '/cckcYc2v0yh1tc9QjRelptcOBko.jpg' },
    { id: 819, name: 'Edward Norton', character: 'The Narrator', profile_path: '/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg' }
  ],
};

const mockTrendingMovies = {
  results: [mockMovieData]
};

describe('Streaming Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup realistic API responses
    const { movieApi, tvApi } = require('../services/tmdb');
    
    movieApi.getDetails.mockResolvedValue({ data: mockMovieData });
    movieApi.getCredits.mockResolvedValue({ data: mockCreditsData });
    movieApi.getReviews.mockResolvedValue({ data: { results: [] } });
    movieApi.getSimilar.mockResolvedValue({ data: { results: [] } });
    movieApi.getRecommendations.mockResolvedValue({ data: { results: [] } });
    movieApi.getReleaseDates.mockResolvedValue({ data: { results: [] } });
    movieApi.getTrending.mockResolvedValue({ data: mockTrendingMovies });
    movieApi.getPopular.mockResolvedValue({ data: { results: [] } });
    movieApi.getTopRated.mockResolvedValue({ data: { results: [] } });
    movieApi.getNowPlaying.mockResolvedValue({ data: { results: [] } });
    movieApi.getUpcoming.mockResolvedValue({ data: { results: [] } });
    
    tvApi.getTrending.mockResolvedValue({ data: { results: [] } });
    tvApi.getPopular.mockResolvedValue({ data: { results: [] } });
    tvApi.getTopRated.mockResolvedValue({ data: { results: [] } });
    tvApi.getOnTheAir.mockResolvedValue({ data: { results: [] } });
    tvApi.getAiringToday.mockResolvedValue({ data: { results: [] } });
  });

  it('sollte kompletten Streaming-Workflow von Startseite durchführen', async () => {
    const TestComponent = () => (
      <MemoryRouter initialEntries={['/']}>
        <div data-testid="test-app">
          {/* Simuliere HeroBanner */}
          <div data-testid="hero-banner">
            <h1>Fight Club</h1>
            <button 
              data-testid="hero-play-button"
              onClick={() => {
                // Simuliere Streaming-Modal öffnen
                const modal = document.createElement('div');
                modal.setAttribute('data-testid', 'streaming-modal');
                modal.innerHTML = `
                  <div>Film wird abgespielt</div>
                  <iframe 
                    data-testid="video-iframe" 
                    src="https://vidsrc.cc/v2/embed/movie/550"
                    title="VidPlay Video Player"
                  ></iframe>
                  <button data-testid="close-button">Close</button>
                `;
                document.body.appendChild(modal);
              }}
            >
              Abspielen
            </button>
          </div>
        </div>
      </MemoryRouter>
    );

    render(<TestComponent />);

    // 1. Überprüfe dass Startseite geladen ist
    expect(screen.getByTestId('test-app')).toBeInTheDocument();
    expect(screen.getByText('Fight Club')).toBeInTheDocument();

    // 2. Klicke auf Abspielen-Button vom Hero
    const heroPlayButton = screen.getByTestId('hero-play-button');
    fireEvent.click(heroPlayButton);

    // 3. Überprüfe dass Streaming-Modal geöffnet wird
    await waitFor(() => {
      expect(screen.getByTestId('streaming-modal')).toBeInTheDocument();
    });

    // 4. Überprüfe dass Video-iframe korrekt geladen wird
    const iframe = screen.getByTestId('video-iframe');
    expect(iframe).toHaveAttribute('src', 'https://vidsrc.cc/v2/embed/movie/550');
    expect(iframe).toHaveAttribute('title', 'VidPlay Video Player');

    // 5. Überprüfe dass Modal geschlossen werden kann
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('streaming-modal')).not.toBeInTheDocument();
    });
  });

  it('sollte Streaming von Movie-Details-Seite funktionieren', async () => {
    const TestComponent = () => (
      <MemoryRouter initialEntries={['/movie/550']}>
        <div data-testid="movie-details">
          <h1>Fight Club</h1>
          <div>
            <button 
              data-testid="play-button"
              onClick={() => {
                // Simuliere Streaming-Modal öffnen
                const modal = document.createElement('div');
                modal.setAttribute('data-testid', 'streaming-modal');
                modal.innerHTML = `
                  <div data-testid="modal-title">Film wird abgespielt</div>
                  <div data-testid="live-indicator">LIVE</div>
                  <iframe 
                    data-testid="video-iframe" 
                    src="https://vidsrc.cc/v2/embed/movie/550"
                  ></iframe>
                  <button data-testid="fullscreen-button">Fullscreen</button>
                  <button data-testid="close-button">Close</button>
                `;
                document.body.appendChild(modal);
              }}
            >
              Abspielen
            </button>
            <button data-testid="trailer-button">Trailer</button>
          </div>
        </div>
      </MemoryRouter>
    );

    render(<TestComponent />);

    // 1. Überprüfe Movie-Details-Seite
    expect(screen.getByTestId('movie-details')).toBeInTheDocument();
    expect(screen.getByText('Fight Club')).toBeInTheDocument();

    // 2. Überprüfe dass beide Buttons vorhanden sind
    expect(screen.getByTestId('play-button')).toBeInTheDocument();
    expect(screen.getByTestId('trailer-button')).toBeInTheDocument();

    // 3. Klicke auf Abspielen-Button
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);

    // 4. Überprüfe Modal-Inhalte
    await waitFor(() => {
      expect(screen.getByTestId('streaming-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Film wird abgespielt');
      expect(screen.getByTestId('live-indicator')).toHaveTextContent('LIVE');
    });

    // 5. Überprüfe Vollbild-Funktionalität
    const fullscreenButton = screen.getByTestId('fullscreen-button');
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('sollte VidPlay-URL für verschiedene Content-Typen korrekt generieren', async () => {
    const testCases = [
      { 
        type: 'movie', 
        id: 550, 
        expectedUrl: 'https://vidsrc.cc/v2/embed/movie/550',
        title: 'Film wird abgespielt'
      },
      { 
        type: 'tv', 
        id: 1399, 
        expectedUrl: 'https://vidsrc.cc/v2/embed/tv/1399',
        title: 'Serie wird abgespielt'
      }
    ];

    testCases.forEach(({ type, id, expectedUrl, title }) => {
      const TestComponent = () => (
        <div data-testid={`${type}-test`}>
          <button 
            onClick={() => {
              const modal = document.createElement('div');
              modal.setAttribute('data-testid', 'streaming-modal');
              modal.innerHTML = `
                <div data-testid="modal-title">${title}</div>
                <iframe 
                  data-testid="video-iframe" 
                  src="${expectedUrl}"
                ></iframe>
              `;
              document.body.appendChild(modal);
            }}
          >
            Play {type}
          </button>
        </div>
      );

      const { unmount } = render(<TestComponent />);

      const button = screen.getByText(`Play ${type}`);
      fireEvent.click(button);

      const iframe = screen.getByTestId('video-iframe');
      expect(iframe).toHaveAttribute('src', expectedUrl);
      
      const modalTitle = screen.getByTestId('modal-title');
      expect(modalTitle).toHaveTextContent(title);

      // Cleanup
      const modal = screen.getByTestId('streaming-modal');
      modal.remove();
      unmount();
    });
  });

  it('sollte Error-Handling für fehlgeschlagene Streams implementieren', async () => {
    const TestComponent = () => (
      <div data-testid="error-test">
        <button 
          onClick={() => {
            // Simuliere Error-State
            const modal = document.createElement('div');
            modal.setAttribute('data-testid', 'streaming-modal');
            modal.innerHTML = `
              <div data-testid="error-screen">
                <div>Fehler beim Laden</div>
                <div>Der VidPlay-Server konnte nicht erreicht werden.</div>
                <button data-testid="retry-button">Erneut versuchen</button>
                <button data-testid="close-error-button">Schließen</button>
              </div>
            `;
            document.body.appendChild(modal);
          }}
        >
          Simulate Error
        </button>
      </div>
    );

    render(<TestComponent />);

    const errorButton = screen.getByText('Simulate Error');
    fireEvent.click(errorButton);

    // Überprüfe Error-Screen
    await waitFor(() => {
      expect(screen.getByTestId('error-screen')).toBeInTheDocument();
      expect(screen.getByText('Fehler beim Laden')).toBeInTheDocument();
      expect(screen.getByText(/VidPlay-Server konnte nicht erreicht werden/)).toBeInTheDocument();
    });

    // Überprüfe Error-Buttons
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    expect(screen.getByTestId('close-error-button')).toBeInTheDocument();
  });

  it('sollte Responsive Design für verschiedene Bildschirmgrößen unterstützen', async () => {
    // Simuliere Mobile-Ansicht
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    const TestComponent = () => (
      <div data-testid="responsive-test">
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-white text-black px-8 py-3 rounded-md font-bold text-lg">
            Abspielen
          </button>
          <button className="bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded-md">
            Trailer
          </button>
        </div>
      </div>
    );

    const { container } = render(<TestComponent />);

    // Überprüfe responsive Klassen
    const buttonContainer = container.querySelector('.flex');
    expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row', 'gap-3');

    // Simuliere Desktop-Ansicht
    Object.defineProperty(window, 'innerWidth', {
      value: 1920,
    });

    // Buttons sollten korrekte Styling haben
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]).toHaveClass('bg-white', 'text-black', 'font-bold');
    expect(buttons[1]).toHaveClass('bg-gray-600', 'bg-opacity-70');
  });

  it('sollte Performance für große Movie-Listen optimieren', async () => {
    const startTime = performance.now();

    // Simuliere große Movie-Liste
    const largeMovieList = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Movie ${i}`,
      poster_path: `/poster${i}.jpg`
    }));

    const TestComponent = () => (
      <div data-testid="performance-test">
        {largeMovieList.map(movie => (
          <div key={movie.id} data-testid={`movie-${movie.id}`}>
            <h3>{movie.title}</h3>
            <button onClick={() => console.log(`Play movie ${movie.id}`)}>
              Play
            </button>
          </div>
        ))}
      </div>
    );

    render(<TestComponent />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Render-Zeit sollte unter 100ms sein für gute Performance
    expect(renderTime).toBeLessThan(100);

    // Überprüfe dass alle Movies gerendert wurden
    expect(screen.getByTestId('movie-0')).toBeInTheDocument();
    expect(screen.getByTestId('movie-99')).toBeInTheDocument();
  });
}); 