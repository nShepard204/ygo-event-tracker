import "./App.css";
import axios from "axios";
import { useState } from "react";
import hero from "./assets/hero.png";

const distanceSelectors = [10, 50, 100, 150, 200, 250, 300];

interface EventVenue {
  id: number;
  name: string | null;
  address: string | null;
  state: string | null;
  country: string | null;
}

interface EventHost {
  id: number;
  name: string | null;
}

interface NearbyEvent {
  id: number;
  date: string | null;
  startTime: string | null;
  eventType: string | null;
  genesys: boolean | null;
  dragonDuels: boolean | null;
  venue: EventVenue;
  host: EventHost;
}

function App() {
  const [events, setEvents] = useState<NearbyEvent[] | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [userDistance, setUserDistance] = useState(distanceSelectors[0]);
  const [isLoading, setIsLoading] = useState(false);

  function handleSearchNearbyEvents(addr: string, dist: number) {
    const requestUrl = `${import.meta.env.VITE_BACKEND_URL}/events/search-nearby`;

    setIsLoading(true);
    axios
      .get<NearbyEvent[]>(requestUrl, {
        params: {
          address: addr,
          distance: dist,
        },
      })
      .then((response) => {
        setEvents(response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="page">
      <header className="hero">
        <img className="hero-logo" src={hero} alt="" />
        <h1>Terraforming</h1>
        <p className="tagline">Find nearby Yu-Gi-Oh! events</p>
      </header>

      <section className="search-card">
        <div className="field">
          <label htmlFor="user-address">Address</label>
          <input
            id="user-address"
            type="text"
            placeholder="Enter your address"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="user-distance">Distance (mi)</label>
          <select
            id="user-distance"
            value={userDistance}
            onChange={(e) => setUserDistance(parseInt(e.target.value))}
          >
            {distanceSelectors.map((distance) => (
              <option key={distance} value={distance}>
                {distance}
              </option>
            ))}
          </select>
        </div>
        <button
          className={`search-button${isLoading ? " loading" : ""}`}
          onClick={() => handleSearchNearbyEvents(userAddress, userDistance)}
          disabled={userAddress === "" || isLoading}
        >
          {isLoading ? (
            <span className="spinner" aria-label="Loading" />
          ) : (
            "Find Events"
          )}
        </button>
      </section>

      {events !== null && (
        <section className="results">
          {events.length === 0 ? (
            <p className="empty-state">
              No events found. Try a wider search distance.
            </p>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>Event Type</th>
                    <th>Venue</th>
                    <th>Address</th>
                    <th>Host</th>
                    <th>Genesys</th>
                    <th>Dragon Duels</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>{event.date ?? "-"}</td>
                      <td>{event.startTime ?? "-"}</td>
                      <td>{event.eventType ?? "-"}</td>
                      <td>{event.venue.name ?? "-"}</td>
                      <td>{event.venue.address ?? "-"}</td>
                      <td>{event.host.name ?? "-"}</td>
                      <td>
                        <span
                          className={`badge ${event.genesys ? "badge-yes" : "badge-no"}`}
                        >
                          {event.genesys ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${event.dragonDuels ? "badge-yes" : "badge-no"}`}
                        >
                          {event.dragonDuels ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
