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
      <h4 className="ticket-title">{ticket.title}</h4>
      {ticket.description && <p className="ticket-desc">{ticket.description}</p>}
      
      <div className="ticket-footer">
        <div className="ticket-meta">
          <small>By: {ticket.createdBy?.username}</small>
        </div>
        <button className="btn-icon" onClick={fetchActivities} title="View Activity">
          ⏱️
        </button>
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
