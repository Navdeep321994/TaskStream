import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import api from '../api';

export default function TicketCard({ ticket, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket._id,
  });
  const [showActivities, setShowActivities] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDescription, setEditDescription] = useState(ticket.description || '');
  const [editPriority, setEditPriority] = useState(ticket.priority);
  const [isUpdating, setIsUpdating] = useState(false);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const fetchActivities = async () => {
    if (showActivities) {
      setShowActivities(false);
      return;
    }
    
    setLoadingActivities(true);
    setShowActivities(true);
    try {
      const res = await api.get(`/activities/${ticket._id}`);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${ticket._id}`);
    } catch (err) {
      console.error('Failed to delete ticket', err);
      alert('Failed to delete ticket');
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await api.patch(`/tickets/${ticket._id}`, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        __v: ticket.__v
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update ticket', err);
      if (err.response?.status === 409) {
        alert(err.response.data.message);
      } else {
        alert('Failed to update ticket');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const priorityColor = {
    'Low': 'priority-low',
    'Medium': 'priority-medium',
    'High': 'priority-high'
  };

  return (
    <div 
      className={`ticket-card ${isDragging ? 'dragging' : ''} ${isOverlay ? 'overlay' : ''}`}
      ref={setNodeRef} 
      style={style} 
    >
      <div className="ticket-header" {...listeners} {...attributes}>
        <span className={`priority-badge ${priorityColor[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      {isEditing ? (
        <div className="edit-ticket-form">
          <input 
            type="text" 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)} 
            placeholder="Title" 
            className="edit-input"
          />
          <textarea 
            value={editDescription} 
            onChange={(e) => setEditDescription(e.target.value)} 
            placeholder="Description" 
            className="edit-input"
          />
          <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="edit-input">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <div className="edit-actions">
            <button className="btn-secondary btn-small" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn-primary btn-small" onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="ticket-title">{ticket.title}</h4>
          {ticket.description && <p className="ticket-desc">{ticket.description}</p>}
        </>
      )}
      
      <div className="ticket-footer">
        <div className="ticket-meta">
          <small>By: {ticket.createdBy?.username}</small>
        </div>
        <div className="ticket-actions-group">
          {!isEditing && (
            <>
              <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit Ticket">✏️</button>
              <button className="btn-icon delete-icon" onClick={handleDelete} title="Delete Ticket">🗑️</button>
            </>
          )}
          <button className="btn-icon" onClick={fetchActivities} title="View Activity">⏱️</button>
        </div>
      </div>

      {showActivities && (
        <div className="activities-timeline">
          <h5>Activity Timeline</h5>
          {loadingActivities ? (
            <small>Loading...</small>
          ) : activities.length > 0 ? (
            <ul>
              {activities.map(act => (
                <li key={act._id}>
                  <strong>{act.user}</strong> {act.action} <br />
                  <span className="timestamp">{format(new Date(act.createdAt), 'MMM d, h:mm a')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <small>No activity yet.</small>
          )}
        </div>
      )}
    </div>
  );
}
