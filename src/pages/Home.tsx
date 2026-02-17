import Header from '../partials/Header.tsx';   // sökväg beror på var filen ligger

export default function Home() {
    return (
        <div>
            <Header />           {/* ← kallar på den här */}

            <h1>Välkommen till startsidan</h1>
            <p>Resten av innehållet...</p>
        </div>
    );
}