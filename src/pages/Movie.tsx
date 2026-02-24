import { Link, useParams } from "react-router-dom";

export default function Movie() {
  const { id } = useParams();

  return (
    <div className="container py-4">
      <Link to="/" className="btn btn-outline-secondary mb-3">
        {/* Tillbaka till startsidan */}← Tillbaka
      </Link>

      <h2 className="mb-0">
        {/* Visar bara id just nu */}
        MovieId: {id}
      </h2>
    </div>
  );
}
