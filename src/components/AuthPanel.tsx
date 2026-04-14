import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { RegisterRequest, University } from '../lib/types';

interface AuthPanelProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: RegisterRequest) => Promise<void>;
}

const degreePrograms = [
  'Computer Science',
  'Business Administration',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Psychology',
  'Mathematics',
  'Data Science',
];

const initialRegister: RegisterRequest = {
  email: 'r@gmail.com',
  password: '123',
  name: 'Ramy',
  universityId: 0,
  city: 'BERLIN',
  degreeProgram: degreePrograms[0],
  semester: 1,
  bio: 'Hallo Leute',
  language: 'English',
  availableTime: 'Evenings',
  studyMode: 'BOTH',
  learningStyle: 'GROUP',
  learningGoal: 'EXAM_PREPARATION',
  studyFrequency: 'TWICE_A_WEEK',
  userType: 'STUDENT',
};

export function AuthPanel({ onLogin, onRegister }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [universities, setUniversities] = useState<University[]>([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterRequest>(initialRegister);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getUniversities();
        setUniversities(data);

        if (data[0]) {
          setRegisterData((current) => ({
            ...current,
            universityId: data[0].id,
          }));
        }
      } catch {
        setError('Could not load universities. Start the backend first.');
      }
    };

    void load();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (mode === 'login') {
        await onLogin(loginData.email, loginData.password);
      } else {
        await onRegister(registerData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '24px',
      }}
    >
      <section
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
          backgroundColor:'#def3ffff', 
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <span className="eyebrow">Backend connected</span>
          <h2 style={{ marginTop: '8px' }}>
            {mode === 'login' ? 'Login to your account' : 'Create a new account'}
          </h2>

          <div className="info-box" style={{ marginTop: '16px' }}>
            <strong>Test flow</strong>
            <p>Register a new user, then open chats, browse learning places, and test tutor courses.</p>
          </div>
        </div>

        <form onSubmit={submit} className="stack-md">
          {error && <div className="alert error">{error}</div>}

          {mode === 'register' && (
            <>
              <label>
                Name
                <input
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </label>

              <label>
                University
                <select
                  value={registerData.universityId}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, universityId: Number(e.target.value) })
                  }
                >
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid-2">
                <label>
                  City
                  <select
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                  >
                    {['BERLIN', 'COLOGNE', 'DORTMUND', 'HAMBURG', 'MUNICH'].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Semester
                  <input
                    type="number"
                    min="1"
                    value={registerData.semester}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, semester: Number(e.target.value) })
                    }
                    required
                  />
                </label>
              </div>

              <label>
                Degree Program
                <select
                  value={registerData.degreeProgram}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, degreeProgram: e.target.value })
                  }
                >
                  {degreePrograms.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Bio
                <textarea
                  value={registerData.bio}
                  onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                  rows={3}
                />
              </label>

              <div className="grid-2">
                <label>
                  Role
                  <select
                    value={registerData.userType}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        userType: e.target.value as RegisterRequest['userType'],
                      })
                    }
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TUTOR">Tutor</option>
                  </select>
                </label>

                <label>
                  Study Mode
                  <select
                    value={registerData.studyMode}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        studyMode: e.target.value as RegisterRequest['studyMode'],
                      })
                    }
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="BOTH">Both</option>
                  </select>
                </label>
              </div>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              value={mode === 'login' ? loginData.email : registerData.email}
              onChange={(e) =>
                mode === 'login'
                  ? setLoginData({ ...loginData, email: e.target.value })
                  : setRegisterData({ ...registerData, email: e.target.value })
              }
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={mode === 'login' ? loginData.password : registerData.password}
              onChange={(e) =>
                mode === 'login'
                  ? setLoginData({ ...loginData, password: e.target.value })
                  : setRegisterData({ ...registerData, password: e.target.value })
              }
              required
            />
          </label>

          <button className="primary-button" disabled={busy} type="submit">
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
          </button>

          <button
            className="text-button"
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </form>
      </section>
    </div>
  );
}