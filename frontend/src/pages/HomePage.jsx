import { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Welcome to the College Event Hub</h1>
        <p>
          Your one-stop platform for discovering, registering for, and managing
          all college events.
        </p>

        <div className="home-cta-buttons">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
      </div>

      <div className="home-features">
        <h2>Features</h2>
        <ul>
          <li>
            <strong>For Students:</strong> Browse all upcoming events, read
            details, and register with a single click.
          </li>
          <li>
            <strong>For Coordinators:</strong> Easily create new events, manage
            descriptions, and see who's attending.
          </li>
          <li>
            <strong>Stay Updated:</strong> Never miss an important workshop,
            seminar, or competition again.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
