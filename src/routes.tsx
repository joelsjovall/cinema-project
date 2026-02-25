import type { RouteObject } from "react-router-dom";
import Home from "./pages/Home";
import Kiosk from "./pages/Kiosk";
import Kommande from "./pages/Kommande";
import Login from "./pages/Login";
import Createaccount from "./pages/Createaccount";

const routes: RouteObject[] = [
    { index: true, element: <Home /> },
    { path: "kommande_Filmer", element: <Kommande /> },
    { path: "kiosk", element: <Kiosk /> },
    { path: "login", element: <Login /> },
    { path: "*", element: <div>404 - Sidan finns inte</div> },
    { path: "/Createaccount", element: <Createaccount /> },
];

export default routes;
