import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter } from "react-router-dom"; // Залишаємо тільки RouterProvider та createBrowserRouter
import { AuthProvider } from './contexts/authContext';
import { Home } from './pages/Home/Home';
import { Auth } from './components/Auth/Auth';
import { Layout } from './components/Layout/Layout';
import { AlbumPage } from './components/AlbumPage/AlbumPage';

// Налаштовуємо маршрути
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      { path: "auth", element: <Auth /> },
      { path: "album/:albumName", element: <AlbumPage /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендеримо RouterProvider в index.js, без BrowserRouter
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} /> {/* Використовуємо тільки RouterProvider */}
    </AuthProvider>
  </React.StrictMode>
);
