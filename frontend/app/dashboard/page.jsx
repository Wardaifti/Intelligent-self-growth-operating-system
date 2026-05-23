'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSummary, getEntries, getGoals } from '../../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, entriesRes, goalsRes] = await Promise.all([
        getSummary(),
        getEntries(),
        getGoals(),
      ]);
      setSummary(summaryRes.data);
      setEntries(entriesRes.data);
      setGoals(goalsRes.data);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)'
    }}>
      Loading...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AI OS Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
  <button
    onClick={() => router.push('/analytics')}
    style={{
      padding: '10px 20px',
      background: 'transparent',
      border: '1px solid #06b6d4',
      borderRadius: '8px',
      color: '#06b6d4',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    }}
  >
    Analytics
  </button>
  <button
    onClick={() => router.push('/goals')}
    style={{
      padding: '10px 20px',
      background: 'transparent',
      border: '1px solid #7c3aed',
      borderRadius: '8px',
      color: '#7c3aed',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    }}
  >
    Goals
  </button>
  <button
    onClick={() => router.push('/journal')}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + New Entry
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard label="Total Entries" value={summary.total_entries} color="#7c3aed" />
          <StatCard label="Current Streak" value={`${summary.current_streak} days`} color="#06b6d4" />
          <StatCard label="Avg Mood (7d)" value={`${summary.avg_mood_7d}/10`} color="#10b981" />
          <StatCard label="Avg Energy (7d)" value={`${summary.avg_energy_7d}/10`} color="#f59e0b" />
        </div>
      )}

      {/* Burnout Warning */}
      {summary?.burnout_warning && (
        <div style={{
          background: '#ef444420',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#ef4444',
          fontSize: '14px',
        }}>
          ⚠️ Burnout warning — your mood and energy have been low. Consider taking a rest day.
        </div>
      )}

      {/* Goals */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Active Goals
        </h2>
        {goals.filter(g => g.status === 'active').length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            No active goals. <a href="/goals" style={{ color: 'var(--accent-cyan)' }}>Add one</a>
          </p>
        ) : (
          goals.filter(g => g.status === 'active').map(goal => (
            <div key={goal.id} style={{
              padding: '12px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              marginBottom: '8px',
              fontSize: '14px',
              color: 'var(--text-primary)',
              borderLeft: '3px solid #7c3aed'
            }}>
              {goal.goal}
            </div>
          ))
        )}
      </div>

      {/* Recent Entries */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Recent Journal Entries
        </h2>
        {entries.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            No entries yet. Click "New Entry" to start.
          </p>
        ) : (
          entries.slice(0, 5).map(entry => (
            <div key={entry.id} style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              marginBottom: '12px',
              borderLeft: '3px solid #06b6d4'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#10b981' }}>
                    Mood: {entry.mood}/10
                  </span>
                  <span style={{ fontSize: '13px', color: '#f59e0b' }}>
                    Energy: {entry.energy_level}/10
                  </span>
                </div>
              </div>
              {entry.ai_response && (
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '8px',
                  marginTop: '8px'
                }}>
                  🤖 {entry.ai_response.response}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
        {label}
      </p>
      <p style={{ fontSize: '28px', fontWeight: '700', color }}>
        {value}
      </p>
    </div>
  );
}