import { useContext, useEffect, useState } from "react";
import EventForm from "../components/EventForm";
import EventItem from "../components/EventItem";
import WelcomePoster from "../components/WelcomePoster";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const DashboardPage = () => {
  const { role } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/events");
        setEvents(res.data);
      } catch (err) {
        console.error(err);
        setMessage(err.response?.data?.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
    setMessage("Event created successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      setMessage("Registered successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`/events/${eventId}`);
        setEvents(events.filter((event) => event._id !== eventId));
        setMessage("Event deleted successfully!");
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to delete event");
      }
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <WelcomePoster />

      {message && <p className="message success">{message}</p>}

      {role === "coordinator" && (
        <EventForm onEventCreated={handleEventCreated} />
      )}

      <h2>Available Events</h2>
      <div className="event-list-container">
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => (
            <EventItem
              key={event._id}
              event={event}
              onDelete={handleDelete}
              onRegister={handleRegister}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
