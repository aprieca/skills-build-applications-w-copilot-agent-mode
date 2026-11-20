import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then(data => setActivities(data.activities))
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load activities'));
  }, []);

  if (error) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Activities</h2>
          <p role="alert" className="text-danger">{error}</p>
        </div>
      </section>
    );
  }

  if (activities === null) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Activities</h2>
          <p role="status">Loading activities...</p>
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Activities</h2>
          <p>No activities yet. Create one to get started.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <ul className="list-unstyled">
          {activities.map((activity, idx) => (
            <li key={idx} className="mb-2">
              <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
