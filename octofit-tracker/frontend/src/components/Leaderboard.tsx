import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then(data => setEntries(data.leaderboard))
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load leaderboard'));
  }, []);

  if (error) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Leaderboard</h2>
          <p role="alert" className="text-danger">{error}</p>
        </div>
      </section>
    );
  }

  if (entries === null) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Leaderboard</h2>
          <p role="status">Loading leaderboard...</p>
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Leaderboard</h2>
          <p>No rankings yet. Create teams and activities to see the leaderboard.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <ol className="list-group list-group-numbered">
          {entries.map((entry) => (
            <li key={entry.rank} className="list-group-item d-flex justify-content-between align-items-center">
              <strong>{entry.teamName}</strong>
              <span className="badge bg-primary rounded-pill">{entry.totalPoints} points</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
