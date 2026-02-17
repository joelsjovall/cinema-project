import type { RouteObject } from "react-router-dom";
import Home from "./pages/Home";
import Kiosk from "./pages/Kiosk";
import Kommande from "./pages/Kommande";
import Login from "./pages/Login";

const routes: RouteObject[] = [
    { path: "/", element: <Home /> },
    { path: "/kommande", element: <Kommande /> },
    { path: "/kiosk", element: <Kiosk /> },
    { path: "/login", element: <Login /> },
    { path: "*", element: <div>404 - Sidan finns inte</div> },
];

export default routes;