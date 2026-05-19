import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="app-header">
      <div className="header-logo">
        <div className="logo-icon"></div>
        <h1>CollabBoard</h1>
      </div>
      <div className="header-actions">
        <div className="user-info">
          <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <span>{user?.username}</span>
        </div>
        <button className="btn-secondary" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
