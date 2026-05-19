import React, { useState, useEffect, useContext } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { AuthContext, socket } from '../context/AuthContext';
import api from '../api';
import Column from './Column';
import TicketCard from './TicketCard';

const STAGES = ['Backlog', 'In Progress', 'Review', 'Done'];

export default function Board() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTickets();

    socket.on('ticketCreated', (ticket) => {
      setTickets((prev) => [...prev, ticket]);
    });

    socket.on('ticketUpdated', (updatedTicket) => {
      setTickets((prev) => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
    });

    socket.on('ticketDeleted', (ticketId) => {
      setTickets((prev) => prev.filter(t => t._id !== ticketId));
    });

    return () => {
      socket.off('ticketCreated');
      socket.off('ticketUpdated');
      socket.off('ticketDeleted');
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const ticket = tickets.find(t => t._id === active.id);
    setActiveTicket(ticket);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTicket(null);
    
    if (!over) return;

    const ticketId = active.id;
    const newStage = over.id;

    const ticket = tickets.find(t => t._id === ticketId);
    if (!ticket || ticket.stage === newStage) return;

    const oldStage = ticket.stage;

    // Optimistic UI update
    setTickets(prev => prev.map(t => 
      t._id === ticketId ? { ...t, stage: newStage } : t
    ));

    try {
      await api.patch(`/tickets/${ticketId}`, { 
        stage: newStage,
        __v: ticket.__v 
      });
    } catch (error) {
      // Revert on failure
      setTickets(prev => prev.map(t => 
        t._id === ticketId ? { ...t, stage: oldStage } : t
      ));
      
      if (error.response?.status === 409) {
        setErrorMsg(error.response.data.message);
        setTimeout(() => setErrorMsg(''), 5000);
        fetchTickets(); // Refresh stale data
      } else {
        setErrorMsg('Failed to update ticket stage.');
        setTimeout(() => setErrorMsg(''), 3000);
      }
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const description = e.target.description.value;
    const priority = e.target.priority.value;
    if (!title) return;
    
    try {
      await api.post('/tickets', { title, description, priority, stage: 'Backlog' });
      e.target.reset();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (priorityFilter === '' || t.priority === priorityFilter)
  );

  if (loading) return <div className="loading">Loading board...</div>;

  return (
    <div className="board-container">
      {errorMsg && <div className="error-toast">{errorMsg}</div>}
      
      <div className="board-controls">
        <div className="filters">
          <input 
            type="text" 
            placeholder="Search tickets..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <form className="create-ticket-form" onSubmit={createTicket}>
          <input type="text" name="title" placeholder="New ticket title" required />
          <input type="text" name="description" placeholder="Description (optional)" />
          <select name="priority">
            <option value="Low">Low</option>
            <option value="Medium" selected>Medium</option>
            <option value="High">High</option>
          </select>
          <button type="submit" className="btn-primary">Create Ticket</button>
        </form>
      </div>

      <DndContext 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {STAGES.map(stage => (
            <Column 
              key={stage} 
              title={stage} 
              tickets={filteredTickets.filter(t => t.stage === stage)} 
            />
          ))}
        </div>
        <DragOverlay>
          {activeTicket ? <TicketCard ticket={activeTicket} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
