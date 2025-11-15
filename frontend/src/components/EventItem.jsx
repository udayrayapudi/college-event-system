import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const EventItem = ({ event, onDelete, onRegister }) => {
  const { role, user } = useContext(AuthContext);

  const eventDate = new Date(event.date).toLocaleString();

  const placeholderImg = "https://via.placeholder.com/400x200.png?text=Event";

  return (
    <div className="event-item">
      <img
        src={event.imageUrl || placeholderImg}
        alt={event.title}
        className="event-image"
      />

      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>
        <strong>Date:</strong> {eventDate}
      </p>
      <p>
        <strong>Registered:</strong> {event.registeredStudents.length}
      </p>

      <div className="event-actions">
        {role === "student" && (
          <button
            onClick={() => onRegister(event._id)}
            className="btn btn-register"
          >
            Register
          </button>
        )}

        {role === "coordinator" && user.id === event.coordinator._id && (
          <button
            onClick={() => onDelete(event._id)}
            className="btn btn-delete"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default EventItem;
