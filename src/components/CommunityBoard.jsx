import React from 'react';

export default function CommunityBoard({ messages }) {
  return (
    <div className="community-board">
      <h3>Tablón de la Comunidad 💬</h3>
      <p className="board-subtitle" style={{ textAlign: 'center', marginBottom: '2rem', color: '#665b54' }}>
        Comentarios recientes de otros dueños de Beagles:
      </p>
      
      <div id="messages-container" className="messages-container">
        {messages.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#888', fontStyle: 'italic' }}>
            Aún no hay comentarios.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message-post">
              <div className="message-header">
                <span 
                  className="message-name"
                  dangerouslySetInnerHTML={{ __html: msg.name }}
                ></span>
                <span className="message-date">{msg.date}</span>
              </div>
              <p className="message-body">
                "
                <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
                "
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
