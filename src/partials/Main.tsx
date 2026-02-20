import { Outlet } from "react-router-dom";

function Main() {
  return (
    <main className="main-content">
      { /* dina routes eller innehåll */}
       <Outlet />
    </main>

  );
}

export default Main;
