import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; mascot?: string; members: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then(data => setTeams(data.teams))
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load teams'));
  }, []);

  if (error) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Teams</h2>
          <p role="alert" className="text-danger">{error}</p>
        </div>
      </section>
    );
  }

  if (teams === null) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Teams</h2>
          <p role="status">Loading teams...</p>
        </div>
      </section>
    );
  }

  if (teams.length === 0) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Teams</h2>
          <p>No teams yet. Create one to get started.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <ul className="list-unstyled">
          {teams.map((team, idx) => (
            <li key={idx} className="mb-2">
              <strong>{team.name}</strong> {team.mascot && `(${team.mascot})`}
              {team.members.length > 0 && (
                <div className="ms-3 small text-muted">
                  Members: {team.members.join(', ')}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
