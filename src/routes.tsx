import type { RouteObject } from "react-router-dom";
import Home from "./pages/Home";
import Kiosk from "./pages/Kiosk";
import Kommande from "./pages/Kommande_Filmer";
import Login from "./pages/Login";
import Createaccount from "./pages/Createaccount";
import Seats from "./pages/Seats";

const routes: RouteObject[] = [
    { index: true, element: <Home /> },
    { path: "kommande", element: <Kommande /> },
    { path: "kiosk", element: <Kiosk /> },
    { path: "login", element: <Login /> },
    { path: "*", element: <div>404 - Sidan finns inte</div> },
    { path: "/Createaccount", element: <Createaccount /> },
    { path: "/Seats", element: <Seats /> }
];

export default routes;
