'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGoals, createGoal, updateGoal } from '../../lib/api';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    setAdding(true);
    setError('');
    try {
      await createGoal({ goal: newGoal });
      setNewGoal('');
      fetchGoals();
      toast.success('Goal added successfully!');
    } catch (err) {
      toast.error('Could not add goal. Try again.');
      setError('Could not add goal. Try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateGoal(id, { status });
      fetchGoals();
      toast.success(`Goal marked as ${status}!`);
    } catch (err) {
      toast.error('Could not update goal.');
      setError('Could not update goal.');
    }
  };

  const statusColor = {
    active: '#7c3aed',
    completed: '#10b981',
    paused: '#f59e0b',
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
      maxWidth: '700px',
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
          My Goals
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

      {/* Add Goal */}
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
          marginBottom: '16px',
          color: 'var(--text-primary)'
        }}>
          Add New Goal
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="e.g. Complete this project in 9 weeks"
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAddGoal}
            disabled={adding}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: adding ? 'not-allowed' : 'pointer',
              opacity: adding ? 0.7 : 1,
            }}
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>
            {error}
          </p>
        )}
      </div>

      {/* Goals List */}
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
          All Goals
        </h2>

        {goals.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            No goals yet. Add your first goal above.
          </p>
        ) : (
          goals.map(goal => (
            <div key={goal.id} style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              marginBottom: '12px',
              borderLeft: `3px solid ${statusColor[goal.status]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  {goal.goal}
                </p>
                <span style={{
                  fontSize: '12px',
                  color: statusColor[goal.status],
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {goal.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {goal.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateStatus(goal.id, 'completed')}
                    style={{
                      padding: '6px 12px',
                      background: '#10b98120',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      color: '#10b981',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Complete
                  </button>
                )}
                {goal.status !== 'paused' && goal.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateStatus(goal.id, 'paused')}
                    style={{
                      padding: '6px 12px',
                      background: '#f59e0b20',
                      border: '1px solid #f59e0b',
                      borderRadius: '6px',
                      color: '#f59e0b',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Pause
                  </button>
                )}
                {goal.status !== 'active' && (
                  <button
                    onClick={() => handleUpdateStatus(goal.id, 'active')}
                    style={{
                      padding: '6px 12px',
                      background: '#7c3aed20',
                      border: '1px solid #7c3aed',
                      borderRadius: '6px',
                      color: '#7c3aed',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}