'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSummary, getPatterns } from '../../lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [patterns, setPatterns] = useState(null);
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
      const [summaryRes, patternsRes] = await Promise.all([
        getSummary(),
        getPatterns(),
      ]);
      setSummary(summaryRes.data);
      setPatterns(patternsRes.data);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
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
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '24px',
      maxWidth: '900px',
      margin: '0 auto'
    }}>

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
          Analytics
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
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
          ← Dashboard
        </button>
      </div>

      {/* Mood Chart */}
      {summary && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'var(--text-primary)'
          }}>
            Mood & Energy — Last 7 Days
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.mood_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis
                domain={[0, 10]}
                stroke="#94a3b8"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a2e',
                  border: '1px solid #2d2d3f',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avg_mood"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: '#7c3aed' }}
                name="Mood"
              />
              <Line
                type="monotone"
                dataKey="avg_energy"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4' }}
                name="Energy"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Patterns */}
      {patterns && !patterns.message && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              marginBottom: '8px'
            }}>
              Best Day of Week
            </p>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#10b981'
            }}>
              {patterns.best_day_of_week}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              marginBottom: '8px'
            }}>
              Worst Day of Week
            </p>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ef4444'
            }}>
              {patterns.worst_day_of_week}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              marginBottom: '8px'
            }}>
              Highest Mood Entry
            </p>
            <p style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#10b981',
              marginBottom: '4px'
            }}>
              {patterns.highest_mood_entry.mood}/10
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              {patterns.highest_mood_entry.date}
            </p>
            <p style={{
              color: 'var(--text-primary)',
              fontSize: '13px',
              marginTop: '8px'
            }}>
              {patterns.highest_mood_entry.progress}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              marginBottom: '8px'
            }}>
              Lowest Mood Entry
            </p>
            <p style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#ef4444',
              marginBottom: '4px'
            }}>
              {patterns.lowest_mood_entry.mood}/10
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              {patterns.lowest_mood_entry.date}
            </p>
            <p style={{
              color: 'var(--text-primary)',
              fontSize: '13px',
              marginTop: '8px'
            }}>
              {patterns.lowest_mood_entry.struggle}
            </p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            Overall Summary
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <StatItem label="Total Entries" value={summary.total_entries} color="#7c3aed" />
            <StatItem label="Current Streak" value={`${summary.current_streak}d`} color="#06b6d4" />
            <StatItem label="Avg Mood" value={`${summary.avg_mood_7d}/10`} color="#10b981" />
            <StatItem label="Avg Energy" value={`${summary.avg_energy_7d}/10`} color="#f59e0b" />
            <StatItem label="Active Goals" value={summary.active_goals} color="#7c3aed" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontSize: '24px',
        fontWeight: '700',
        color,
        marginBottom: '4px'
      }}>
        {value}
      </p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
        {label}
      </p>
    </div>
  );
}