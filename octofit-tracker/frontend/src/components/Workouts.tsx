import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = { title: string; focus: string; minutes: number; difficulty: string; reason?: string };

export default function Workouts() {
  const [userEmail, setUserEmail] = useState('mona@example.com');
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (email: string) => {
    setLoading(true);
    setError(null);
    setWorkouts(null);
    try {
      const data = await getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent(email)}`);
      setWorkouts(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions(userEmail);
  }, [userEmail]);

  if (error) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Workout Suggestions</h2>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter user email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <p role="alert" className="text-danger">{error}</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Workout Suggestions</h2>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter user email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <p role="status">Loading suggestions...</p>
        </div>
      </section>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Workout Suggestions</h2>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter user email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <p>No workout suggestions available for this user.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout Suggestions</h2>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Enter user email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </div>
        <ul className="list-unstyled">
          {workouts.map((workout, idx) => (
            <li key={idx} className="mb-3 p-2 border rounded">
              <strong>{workout.title}</strong>
              <div className="small text-muted">
                <div>Focus: {workout.focus}</div>
                <div>Duration: {workout.minutes} minutes</div>
                <div>Difficulty: {workout.difficulty}</div>
                {workout.reason && <div>Reason: {workout.reason}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
