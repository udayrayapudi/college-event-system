import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const WelcomePoster = () => {
  const { role } = useContext(AuthContext);

  let title = "Discover Amazing Events";
  let description =
    "Join exciting hackathons, expos, and workshops. Build your skills and network with peers.";
  let welcomeText = "Student";

  if (role === "coordinator") {
    title = "Manage Your Events";
    description =
      "Create, update, and oversee all college events. Empower students and build a vibrant community.";
    welcomeText = "Coordinator";
  }

  return (
    <div className="welcome-poster">
      <div className="welcome-tag">
        <span role="img" aria-label="wave">
          👋
        </span>{" "}
        Welcome Back, {welcomeText}!
      </div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default WelcomePoster;
