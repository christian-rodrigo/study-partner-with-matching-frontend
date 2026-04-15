import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Edit3, Save, X, GraduationCap, MapPin, Languages, Clock3, Camera } from 'lucide-react';
import { api } from '../lib/api';

import type {
  RegisterRequest,
  University,
  User,
  City,
} from '../lib/types';
import {
  STUDY_MODE_VALUES,
  LEARNING_STYLE_VALUES,
  LEARNING_GOAL_VALUES,
  STUDY_FREQUENCY_VALUES,
} from '../lib/types';
import { formatLabel } from '../lib/utils';

interface ProfilePageProps {
  onProfileUpdated: () => Promise<void>;
}

type ProfileForm = {
  name: string;
  universityId?: number;
  city?: City;
  degreeProgram: string;
  semester?: number;
  bio: string;
  language: string;
  availableTime: string;
  studyMode?: RegisterRequest['studyMode'];
  learningStyle?: RegisterRequest['learningStyle'];
  learningGoal?: RegisterRequest['learningGoal'];
  studyFrequency?: RegisterRequest['studyFrequency'];
  avatarSeed?: string;
};

const cities: City[] = ['BERLIN', 'COLOGNE', 'DORTMUND', 'HAMBURG', 'MUNICH'];

const degreePrograms = [
  'Computer Science',
  'Business Administration',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Psychology',
  'Mathematics',
  'Data Science',
];

const emptyForm: ProfileForm = {
  name: '',
  universityId: undefined,
  city: undefined,
  degreeProgram: '',
  semester: undefined,
  bio: '',
  language: '',
  availableTime: '',
  studyMode: undefined,
  learningStyle: undefined,
  learningGoal: undefined,
  studyFrequency: undefined,
};

function buildForm(user: User): ProfileForm {
  return {
    name: user.name ?? '',
    universityId: user.universityId,
    city: user.city as City | undefined,
    degreeProgram: user.degreeProgram ?? '',
    semester: user.semester,
    bio: user.bio ?? '',
    language: user.language ?? '',
    availableTime: user.availableTime ?? '',
    studyMode: user.studyMode,
    learningStyle: user.learningStyle,
    learningGoal: user.learningGoal,
    studyFrequency: user.studyFrequency,
    avatarSeed: user.avatarSeed,
  };
}

function getAvatarUrl(user?: User | null) {
  if (!user) return '';
  const seed = user.avatarSeed || `${user.id}-${user.name}`;
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&t=${Date.now()}`;
}

function InfoCard({
  title,
  value,
  icon,
}: {
  title: string;
  value?: string | number | null;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.74)',
        border: '1px solid rgba(255,255,255,0.35)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: '22px',
        padding: '18px',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',

      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          color: '#64748b',
          fontSize: '14px',
          fontWeight: 700,

        }}
      >
        {icon}
        <span>{title}</span>
      </div>

      <div
        style={{
          color: '#172554',
          fontSize: '18px',
          fontWeight: 800,
          lineHeight: 1.35,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '10px 14px',
        borderRadius: '999px',
        background: 'rgba(224, 242, 254, 0.85)',
        color: '#0f4c81',
        fontWeight: 700,
        fontSize: '14px',
        border: '1px solid rgba(186, 230, 253, 0.95)',
      }}
    >
      {children}
    </span>
  );
}

export function ProfilePage({ onProfileUpdated }: ProfilePageProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [originalForm, setOriginalForm] = useState<ProfileForm | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const avatarUrl = getAvatarUrl(
    editing && profile ? { ...profile, avatarSeed: form.avatarSeed } : profile
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [me, universityData] = await Promise.all([api.me(), api.getUniversities()]);
        const loadedForm = buildForm(me);

        setProfile(me);
        setUniversities(universityData);
        setForm(loadedForm);
        setOriginalForm(loadedForm);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleCancel = () => {
    if (!profile) return;

    const resetForm = buildForm(profile);
    setForm(resetForm);
    setOriginalForm(resetForm);
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!originalForm) return;

    setBusy(true);
    setError('');

    try {
      const payload: Partial<Record<keyof ProfileForm, any>> = {};
      for (const key of Object.keys(form) as (keyof ProfileForm)[]) {
        if (form[key] !== originalForm[key]) {
          payload[key] = form[key];
        }
      }

      if (Object.keys(payload).length === 0) {
        setEditing(false);
        return;
      }

      await api.updateMyProfile(payload);

      const me = await api.me();
      const updatedForm = buildForm(me);

      setProfile(me);
      setForm(updatedForm);
      setOriginalForm(updatedForm);
      setEditing(false);

      await onProfileUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="card">Loading profile…</div>;
  }

  if (!profile) {
    return <div className="card">Profile could not be loaded.</div>;
  }

  return (
    <section className="stack-lg">
      {error && <div className="alert error">{error}</div>}

      <div
        style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '28px',
          padding: '24px',
          boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(255,255,255,0.35)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr auto',
            gap: '20px',
            alignItems: 'center',
          }}
        >

          <div
            style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              borderRadius: '28px',
              backgroundImage: `url(${avatarUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 18px 34px rgba(59, 130, 246, 0.18)',
              border: '4px solid rgba(255,255,255,0.7)',
              backgroundColor: '#e6ceffff',
            }}
          >
            {editing && (
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    avatarSeed: crypto.randomUUID(),
                  }))
                }
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Camera size={18} color="white" />
              </button>
            )}
          </div>

          <div>
            <span className="eyebrow">Profile</span>
            <h1
              style={{
                margin: '8px 0 8px 0',
                fontSize: '38px',
                lineHeight: 1.1,
                color: '#172554',
              }}
            >
              {profile.name}
            </h1>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <Tag>{profile.universityName}</Tag>
              <Tag>{profile.degreeProgram}</Tag>
              <Tag>Semester {profile.semester}</Tag>
            </div>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '15px',
                maxWidth: '760px',
                lineHeight: 1.6,
              }}
            >
              {profile.bio}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignSelf: 'start' }}>
            {!editing ? (
              <>
                <button
                  className="secondary-button"
                  onClick={() => setEditing(true)}
                  style={{
                    height: '44px',
                    borderRadius: '14px',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <button
                  className="secondary-button"
                  onClick={handleCancel}
                  disabled={busy}
                  style={{
                    height: '44px',
                    borderRadius: '14px',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={() => void handleSave()}
                  disabled={busy}
                  style={{
                    height: '44px',
                    borderRadius: '14px',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Save size={16} />
                  {busy ? 'Saving…' : 'Save'}
                </button>


              </>
            )}
          </div>
        </div>
      </div>

      {!editing ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 380px) 1fr',
            gap: '18px',
          }}
        >
          <div style={{ display: 'grid', gap: '16px' }}>
            <InfoCard title="Email" value={profile.email} />
            <InfoCard
              title="University"
              value={profile.universityName}
              icon={<GraduationCap size={16} />}
            />
            <InfoCard title="Degree Program" value={profile.degreeProgram} />
            <InfoCard title="Semester" value={profile.semester} />
          </div>

          <div style={{ display: 'grid', gap: '18px' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.74)',
                border: '1px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: '22px',
                padding: '18px',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                Bio
              </div>

              <div
                style={{
                  color: '#172554',
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: 1.6,
                  minHeight: '84px',
                }}
              >
                {profile.bio}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.74)',
                border: '1px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: '22px',
                padding: '18px',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '14px',
                }}
              >
                Preferences
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <Tag>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    {profile.city}
                  </span>
                </Tag>

                {profile.language && (
                  <Tag>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Languages size={14} />
                      {profile.language}
                    </span>
                  </Tag>
                )}

                {profile.availableTime && (
                  <Tag>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Clock3 size={14} />
                      {profile.availableTime}
                    </span>
                  </Tag>
                )}

                {profile.studyMode && <Tag>{formatLabel(profile.studyMode)}</Tag>}
                {profile.learningStyle && <Tag>{formatLabel(profile.learningStyle)}</Tag>}
                {profile.learningGoal && <Tag>{formatLabel(profile.learningGoal)}</Tag>}
                {profile.studyFrequency && <Tag>{formatLabel(profile.studyFrequency)}</Tag>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: '24px',
            padding: '22px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid rgba(255,255,255,0.35)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
                placeholder="Enter your name"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>University</span>
              <select
                value={form.universityId ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    universityId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                style={inputStyle}
              >
                <option value="">Select university</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>City</span>
              <select
                value={form.city ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value ? (e.target.value as City) : undefined,
                  })
                }
                style={inputStyle}
              >
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {formatLabel(city)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Semester</span>
              <input
                type="number"
                min="1"
                value={form.semester ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    semester: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                style={inputStyle}
                placeholder="Enter semester"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Degree Program</span>
              <select
                value={form.degreeProgram}
                onChange={(e) => setForm({ ...form, degreeProgram: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select degree program</option>
                {degreePrograms.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Language</span>
              <input
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                style={inputStyle}
                placeholder="Enter language"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Available Time</span>
              <input
                value={form.availableTime}
                onChange={(e) => setForm({ ...form, availableTime: e.target.value })}
                style={inputStyle}
                placeholder="Enter available time"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Study Mode</span>
              <select
                value={form.studyMode ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    studyMode: e.target.value
                      ? (e.target.value as RegisterRequest['studyMode'])
                      : undefined,
                  })
                }
                style={inputStyle}
              >
                <option value="">Select study mode</option>
                {STUDY_MODE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Learning Style</span>
              <select
                value={form.learningStyle ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    learningStyle: e.target.value
                      ? (e.target.value as RegisterRequest['learningStyle'])
                      : undefined,
                  })
                }
                style={inputStyle}
              >
                <option value="">Select learning style</option>
                {LEARNING_STYLE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Learning Goal</span>
              <select
                value={form.learningGoal ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    learningGoal: e.target.value
                      ? (e.target.value as RegisterRequest['learningGoal'])
                      : undefined,
                  })
                }
                style={inputStyle}
              >
                <option value="">Select learning goal</option>
                {LEARNING_GOAL_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Study Frequency</span>
              <select
                value={form.studyFrequency ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    studyFrequency: e.target.value
                      ? (e.target.value as RegisterRequest['studyFrequency'])
                      : undefined,
                  })
                }
                style={inputStyle}
              >
                <option value="">Select study frequency</option>
                {STUDY_FREQUENCY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                gridColumn: '1 / -1',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Bio</span>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={5}
                style={{
                  ...inputStyle,
                  height: 'auto',
                  minHeight: '120px',
                  padding: '14px',
                  resize: 'vertical',
                }}
                placeholder="Tell others about yourself"
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  height: '46px',
  fontSize: '15px',
  padding: '0 14px',
  borderRadius: '14px',
  border: '1px solid #cbd5e1',
  background: 'rgba(255,255,255,0.88)',
  outline: 'none',
};

