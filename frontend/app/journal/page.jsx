'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEntry } from '../../lib/api';

export default function JournalPage() {
  const router = useRouter();
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [progress, setProgress] = useState('');
  const [struggle, setStruggle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await createEntry({
        mood,
        energy_level: energy,
        progress_text: progress,
        struggle_text: struggle,
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '48px',
        width: '100%',
        maxWidth: '560px',
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Daily Check-in
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          marginBottom: '32px'
        }}>
          How are you feeling today?
        </p>

        {/* Mood Slider */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            marginBottom: '8px'
          }}>
            <span>Mood</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>{mood}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#7c3aed' }}
          />
        </div>

        {/* Energy Slider */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            marginBottom: '8px'
          }}>
            <span>Energy Level</span>
            <span style={{ color: '#f59e0b', fontWeight: '600' }}>{energy}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#06b6d4' }}
          />
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            marginBottom: '6px'
          }}>
            What did you progress on today?
          </label>
          <textarea
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder="I completed..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>

        {/* Struggle */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            marginBottom: '6px'
          }}>
            What did you struggle with?
          </label>
          <textarea
            value={struggle}
            onChange={(e) => setStruggle(e.target.value)}
            placeholder="I struggled with..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p style={{
            color: 'var(--accent-red)',
            fontSize: '13px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              flex: 1,
              padding: '14px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 2,
              padding: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Submit & Get AI Response'}
          </button>
        </div>
      </div>
    </div>
  );
}