import { useState } from 'react';
import { api } from '../lib/api';
import type { LearningPlace } from '../lib/types';

interface PlacesPageProps {
  initialPlaces: LearningPlace[];
}

export function PlacesPage({ initialPlaces }: PlacesPageProps) {
  const [places, setPlaces] = useState<LearningPlace[]>(initialPlaces);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');

  const search = async () => {
    try {
      setError('');
      const data = await api.getLearningPlaces(city || undefined, type || undefined);
      setPlaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load learning places.');
    }
  };

  return (
    <section className="stack-lg">
      <div className="card stack-md">
        <div className="section-header">
          <div>
            <span className="eyebrow">Learning places</span>
            <h2>Libraries, cafés and study spots</h2>
          </div>
        </div>
        <div className="grid-3">
          <label>
            City
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All</option>
              {['BERLIN', 'COLOGNE', 'DORTMUND', 'HAMBURG', 'MUNICH'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              {['LIBRARY', 'CAFE', 'UNIVERSITY', 'COWORKING'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <div className="button-row align-end">
            <button className="primary-button" onClick={() => void search()}>Apply filters</button>
          </div>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="cards-grid">
        {places.map((place) => (
          <article key={place.id} className="card stack-sm">
            <h3>{place.name}</h3>
            <p>{place.address}</p>
            <div className="pill-row">
              <span className="pill">{place.city}</span>
              <span className="pill">{place.type}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
