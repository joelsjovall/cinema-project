// src/App.tsx
import { Outlet } from 'react-router-dom';
import Main from './partials/Main.tsx';   // din header

export default function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Main />   {/* din header med logo och nav */}

      <div style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        border: '2px dashed #ccc'   // för att se var innehållet hamnar
      }}>
        <Outlet />   {/* här ska sidorna visas */}
      </div>
    </div>
  );
}