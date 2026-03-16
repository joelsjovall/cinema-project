import type { RouteObject } from "react-router-dom";
import Home from "./pages/Home";
import Kiosk from "./pages/Kiosk";
import Kommande from "./pages/Kommande_Filmer";
import OmBiografen from "./pages/OmBiografen";
import Login from "./pages/Login";
import Createaccount from "./pages/Createaccount";
import Movie from "./pages/Movie";
import Seats from "./pages/Seats";
import MinaSidor from "./pages/MinaSidor";
import BokningsBF from "./pages/BokningsBF";

const routes: RouteObject[] = [
  { index: true, element: <Home /> },
  { path: "kommande_Filmer", element: <Kommande /> },
  { path: "om-biografen", element: <OmBiografen /> },
  { path: "movie/:id", element: <Movie /> },
  { path: "kiosk", element: <Kiosk /> },
  { path: "login", element: <Login /> },
  { path: "mina-sidor", element: <MinaSidor /> },
  { path: "*", element: <div>404 - Sidan finns inte</div> },
  { path: "/Createaccount", element: <Createaccount /> },
  { path: "/Seats", element: <Seats /> },
  { path: "/BokningsBF", element: <BokningsBF /> },
];

export default routes;
