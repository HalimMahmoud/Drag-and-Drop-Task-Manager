import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <div>
        <h1>Horizontal Task Board</h1>
        <p>Drag tasks to any hour slot · Resize with handles · Drag rows to reorder</p>
      </div>
      <div className="legend">
        <span>⟷ Drag to any hour</span>
        <span>↕ Move between rows</span>
        <span>⟺ Resize edges</span>
      </div>
    </header>
  );
}
