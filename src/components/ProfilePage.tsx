import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { User, University } from "../lib/types";
import { formatLabel } from "../lib/utils";

interface ProfilePageProps {
  onProfileUpdated?: () => Promise<void> | void;
}
function toForm(user: User) {
  return {
    name: user.name ?? "",
    universityId: user.universityId ?? 0,
    city: user.city ?? "",
    degreeProgram: user.degreeProgram ?? "",
    semester: user.semester ?? 1,
    bio: user.bio ?? "",
    language: user.language ?? "",
    availableTime: user.availableTime ?? "",
    studyMode: user.studyMode ?? "",
    learningStyle: user.learningStyle ?? "",
    learningGoal: user.learningGoal ?? "",
    studyFrequency: user.studyFrequency ?? "",
  };
}
const STUDY_MODE_OPTIONS = ["ONLINE", "OFFLINE", "BOTH"];
const LEARNING_STYLE_OPTIONS = ["SOLO", "GROUP", "MIXED"];
const LEARNING_GOAL_OPTIONS = ["EXAM_PREPARATION", "REGULAR_STUDY", "HOMEWORK_SUPPORT"];
const STUDY_FREQUENCY_OPTIONS = ["DAILY", "WEEKLY", "TWICE_A_WEEK", "WEEKENDS"];

export function ProfilePage({ onProfileUpdated }: ProfilePageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    universityId: 0,
    city: "",
    degreeProgram: "",
    semester: 1,
    bio: "",
    language: "",
    availableTime: "",
    studyMode: "",
    learningStyle: "",
    learningGoal: "",
    studyFrequency: "",
  });

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [profile, universityList] = await Promise.all([
        api.me(),
        api.getUniversities(),
      ]);

      setUser(profile);
      setUniversities(universityList);

      setForm(toForm(profile));
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "semester" || name === "universityId"
          ? Number(value)
          : value,
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);

      console.log("PROFILE PAYLOAD", form);

      await api.updateMyProfile(form);

      await loadData();
      setEditMode(false);

      if (onProfileUpdated) {
        await onProfileUpdated();
      }
    } catch (e) {
      console.error("Failed to save profile", e);
      alert(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!user) return;

    setForm(toForm(user));
    setEditMode(false);
  }

  if (!user) {
    return <div className="center-screen">Loading profile...</div>;
  }

  return (
    <section className="card stack-lg">
      <div className="section-header">
        <div>
          <span className="eyebrow">Profile</span>
          <h2>{user.name}</h2>
        </div>

        {!editMode && (
          <button
            type="button"
            className="button primary"
            onClick={() => {
              if (user) {
                setForm(toForm(user));
              }
              setEditMode(true);
            }}
          >
            Edit Profile
          </button>
        )}
      </div>
      {editMode ? (
        <div className="stack-md">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
          />

          <select
            name="universityId"
            value={form.universityId}
            onChange={handleChange}
          >
            <option value={0}>Select university</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
          />

          <input
            name="degreeProgram"
            value={form.degreeProgram}
            onChange={handleChange}
            placeholder="Degree Program"
          />

          <input
            type="number"
            name="semester"
            value={form.semester}
            onChange={handleChange}
            placeholder="Semester"
          />

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Bio"
          />

          <input
            name="language"
            value={form.language}
            onChange={handleChange}
            placeholder="Language"
          />

          <input
            name="availableTime"
            value={form.availableTime}
            onChange={handleChange}
            placeholder="Available Time"
          />

          <select
            name="studyMode"
            value={form.studyMode}
            onChange={handleChange}
          >
            <option value="">Select study mode</option>
            {STUDY_MODE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>

          <select
            name="learningStyle"
            value={form.learningStyle}
            onChange={handleChange}
          >
            <option value="">Select learning style</option>
            {LEARNING_STYLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>

          <select
            name="learningGoal"
            value={form.learningGoal}
            onChange={handleChange}
          >
            <option value="">Select learning goal</option>
            {LEARNING_GOAL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>

          <select
            name="studyFrequency"
            value={form.studyFrequency}
            onChange={handleChange}
          >
            <option value="">Select study frequency</option>
            {STUDY_FREQUENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>

          <div className="button-row">
            <button
              type="button"
              className="button primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              className="button secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-grid">
          <div className="stack-sm">
            <div className="stat-card">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div className="stat-card">
              <span>University</span>
              <strong>{user.universityName || "—"}</strong>
            </div>

            <div className="stat-card">
              <span>Degree Program</span>
              <strong>{user.degreeProgram || "—"}</strong>
            </div>

            <div className="stat-card">
              <span>Semester</span>
              <strong>{user.semester || "—"}</strong>
            </div>
          </div>

          <div className="stack-md">
            <div className="card nested">
              <h3>Bio</h3>
              <p>{user.bio || "No bio yet."}</p>
            </div>

            <div className="pill-row">
              <span className="pill">{user.city || "Unknown city"}</span>
              <span className="pill">{user.language || "No language set"}</span>
              <span className="pill">{formatLabel(user.studyMode)}</span>
              <span className="pill">{formatLabel(user.learningStyle)}</span>
              <span className="pill">{formatLabel(user.learningGoal)}</span>
              <span className="pill">{formatLabel(user.studyFrequency)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}