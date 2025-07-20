import { RouterProvider } from 'react-router-dom';
import { CountryProvider } from './contexts/CountryContext';
import router from './routes';

function App() {
  return (
    <CountryProvider>
      <RouterProvider router={router} />
    </CountryProvider>
  );
}

export default App; 