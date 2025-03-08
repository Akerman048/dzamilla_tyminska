import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Footer } from "./components/Footer/Footer";
import { MainSection } from "./components/MainSection/MainSection";
import "./index.css";
import { Home } from "./pages/Home/Home";
import { Layout } from "./components/Layout/Layout";
import { Auth } from "./components/Auth/Auth";
import { AlbumPage } from "./components/AlbumPage/AlbumPage";

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
      { path: "/album/:albumName", element: <AlbumPage /> },
    ],
  },
]);

function App() {
  return (
    <div className='App'>
      <div className='container'>
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
