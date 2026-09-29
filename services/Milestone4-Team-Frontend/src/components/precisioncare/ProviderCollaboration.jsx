import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import { getTeam, getActivity, postActivityMessage, getTasks, toggleTask } from '../../api/precisionCareService'

function initialsOf(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function timeAgo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  return new Date(iso).toLocaleDateString()
}

function ProviderCollaboration({ patientId }) {
  const { user } = useAuth()
  const [team, setTeam] = useState([])
  const [activity, setActivity] = useState([])
  const [tasks, setTasks] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [teamData, activityData, taskData] = await Promise.all([
        getTeam(patientId),
        getActivity(patientId),
        getTasks(patientId),
      ])
      setTeam(teamData)
      setActivity(activityData)
      setTasks(taskData)
    } catch (err) {
      setError(err.displayMessage || 'Failed to load provider collaboration data.')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const notify = (text) => {
    setToast(text)
    window.setTimeout(() => setToast(''), 2200)
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    try {
      await postActivityMessage(patientId, {
        senderName: user?.name || 'Care team member',
        senderRole: user?.role || 'Staff',
        recipient: 'Care Team',
        message: message.trim(),
      })
      setMessage('')
      const updated = await getActivity(patientId)
      setActivity(updated)
      notify('Message posted to shared activity')
    } catch (err) {
      notify(err.displayMessage || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleToggleTask = async (id) => {
    try {
      const updated = await toggleTask(id)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      notify(err.displayMessage || 'Failed to update task')
    }
  }

  if (loading) return <section className="m4-section m4-collaboration-section"><Loader label="Loading care team…" /></section>
  if (error) return <section className="m4-section m4-collaboration-section"><div className="pc-error-banner">{error}</div></section>

  const openTasks = tasks.filter((t) => !t.done).length

  return (
    <section className="m4-section m4-collaboration-section">
      <div className="m4-section-title-row">
        <div>
          <div className="m4-section-kicker"><i className="bi bi-people-fill" /> CARE TEAM</div>
          <h2 className="m4-section-heading">Provider Collaboration</h2>
          <p className="m4-section-subheading">Coordinate clinical decisions, tasks and patient communication in one shared workspace.</p>
        </div>
        <span className="m4-live-badge"><i className="bi bi-circle-fill" /> {team.filter((m) => m.presenceStatus === 'online').length} providers active</span>
      </div>

      <div className="m4-collab-summary">
        <div><span>Care team</span><strong>{team.length}</strong><small>Assigned providers</small></div>
        <div><span>Open tasks</span><strong>{openTasks}</strong><small>of {tasks.length} total</small></div>
        <div><span>Messages</span><strong>{activity.length}</strong><small>Shared activity log</small></div>
      </div>

      <div className="m4-collab-grid">
        <div className="m4-collab-team m4-elevated-card">
          <div className="m4-card-title-row"><div><h3>Care team</h3><p>Current members and recent activity</p></div></div>
          {team.length === 0 && <EmptyState icon="bi-people" title="No care team assigned yet" />}
          {team.map((member) => (
            <div key={member.id} className="m4-team-member">
              <div className="m4-avatar m4-avatar-initials">{member.initials || initialsOf(member.name)}<span className={`m4-status-dot status-${member.presenceStatus}`} /></div>
              <div className="m4-member-info">
                <div className="m4-member-top"><div><div className="m4-member-name">{member.name}</div><div className="m4-member-role">{member.role}</div></div><span className={`m4-presence presence-${member.presenceStatus}`}>{member.presenceStatus}</span></div>
                <div className="m4-member-action"><i className="bi bi-check2-circle" /> {member.lastAction}</div>
                <div className="m4-member-time">{member.lastActionTime}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="m4-collab-messages m4-elevated-card">
          <div className="m4-card-title-row"><div><h3>Shared activity</h3><p>Latest communication for this patient</p></div></div>
          <div className="m4-activity-feed">
            {activity.length === 0 && <EmptyState icon="bi-chat" title="No activity yet" />}
            {activity.map((item) => (
              <div className="m4-activity" key={item.id}>
                <span className="m4-activity-icon blue"><i className="bi bi-chat-left-text" /></span>
                <div>
                  <strong>{item.senderName} <em>→ {item.recipient}</em></strong>
                  <p>{item.message}</p>
                  <small>{timeAgo(item.createdAt)}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="m4-tasks-list">
            {tasks.map((task) => (
              <label key={task.id} className={`m4-task-item ${task.done ? 'done' : ''}`}>
                <input type="checkbox" checked={task.done} onChange={() => handleToggleTask(task.id)} />
                <span className="m4-task-title">{task.title}</span>
                <span className="m4-task-meta">{task.assignee} · {task.dueLabel}</span>
              </label>
            ))}
          </div>

          <div className="m4-collab-actions">
            <input
              type="text"
              className="m4-message-input"
              placeholder="Post an update for the care team…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button type="button" className="m4-collab-btn primary" disabled={sending} onClick={handleSend}>
              <i className="bi bi-send" /> Send message
            </button>
          </div>
        </div>
      </div>
      {toast && <div className="m4-toast"><i className="bi bi-check-circle-fill" /> {toast}</div>}
    </section>
  )
}

export default ProviderCollaboration
