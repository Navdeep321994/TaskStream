import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TicketCard from './TicketCard';

export default function Column({ title, tickets }) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
  });

  return (
    <div className={`column ${isOver ? 'column-over' : ''}`} ref={setNodeRef}>
      <div className="column-header">
        <h3>{title}</h3>
        <span className="ticket-count">{tickets.length}</span>
      </div>
      <div className="column-content">
        {tickets.map(ticket => (
          <TicketCard key={ticket._id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
