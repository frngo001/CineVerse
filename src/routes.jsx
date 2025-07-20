import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import NewAndPopular from './pages/NewAndPopular';
import MovieDetails from './pages/MovieDetails';
import TvDetails from './pages/TvDetails';
import PersonDetails from './pages/PersonDetails';
import Search from './pages/Search';
import MyNetflix from './pages/MyNetflix';
import NotFound from './pages/NotFound';
import Watch from './pages/Watch';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'movies',
        element: <Movies />,
      },
      {
        path: 'series',
        element: <Series />,
      },
      {
        path: 'new-and-popular',
        element: <NewAndPopular />,
      },
      {
        path: 'movie/:id',
        element: <MovieDetails />,
      },
      {
        path: 'tv/:id',
        element: <TvDetails />,
      },
      {
        path: 'person/:id',
        element: <PersonDetails />,
      },
      {
        path: 'search',
        element: <Search />,
      },
      {
        path: 'my-netflix',
        element: <MyNetflix />,
      },
      {
        path: 'watch/movie/:id',
        element: <Watch type="movie" />,
      },
      {
        path: 'watch/tv/:id',
        element: <Watch type="tv" />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router; 