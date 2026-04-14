import { useState } from 'react';
import { api } from '../lib/api';
import type { Course } from '../lib/types';

interface TutorCoursesPageProps {
  courses: Course[];
  onSaved: () => Promise<void>;
}

export function TutorCoursesPage({ courses, onSaved }: TutorCoursesPageProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const save = async () => {
    const names = input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (names.length === 0) {
      setError('Add at least one course name, separated by commas if needed.');
      return;
    }

    try {
      setError('');
      setMessage('');
      await api.saveTutorCourses(names);
      setInput('');
      setMessage('Courses saved.');
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save courses.');
    }
  };

  return (
    <section className="stack-lg">
      <div className="card stack-md">
        <div className="section-header">
          <div>
            <span className="eyebrow">Tutor</span>
            <h2>Manage tutor courses</h2>
          </div>
        </div>
        <p className="muted">
          Your backend does not expose a public <code>/api/courses</code> endpoint yet, so this screen saves new course names only.
        </p>
        <label>
          New course names
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Algorithms, Databases, Operating Systems"
          />
        </label>
        <div className="button-row">
          <button className="primary-button" onClick={() => void save()}>Save courses</button>
        </div>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
      </div>

      <div className="card stack-md">
        <h3>My current courses</h3>
        {courses.length === 0 ? (
          <p className="muted">No tutor courses returned yet.</p>
        ) : (
          <div className="pill-row">
            {courses.map((course) => (
              <span className="pill" key={course.id}>{course.name}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
