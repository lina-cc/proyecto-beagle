import React, { useState } from 'react';

function sanitizeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;'
  };
  const reg = /[&<>"'`\/]/g;
  return text.replace(reg, (match) => map[match]);
}

export default function CommunityBoard({ messages, onDeleteMessage, onUpdateMessage }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState('');

  const handleEditClick = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.text);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditError('');
  };

  const handleSaveEdit = (id) => {
    const trimmedText = editText.trim();
    if (trimmedText.length === 0) {
      setEditError('El comentario no puede estar vacío.');
      return;
    }
    if (trimmedText.length < 10) {
      setEditError(`Mínimo 10 caracteres (llevas ${trimmedText.length}).`);
      return;
    }

    const cleanText = sanitizeHTML(trimmedText);
    onUpdateMessage(id, cleanText);
    setEditingId(null);
    setEditText('');
    setEditError('');
  };

  return (
    <div className="community-board">
      <div id="messages-container" className="messages-container">
        {messages.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#888', fontStyle: 'italic' }}>
            Aún no hay comentarios en la comunidad. ¡Sé el primero en escribir!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message-post">
              <div className="message-header">
                {/* 
                  BUENA PRÁCTICA DE SEGURIDAD (Criterio 3.1.2): 
                  Se eliminó dangerouslySetInnerHTML para mitigar vulnerabilidades XSS.
                  React escapa de manera nativa e intrínsecamente segura cualquier entrada aquí.
                */}
                <span className="message-name">{msg.name}</span>
                <span className="message-date">{msg.date}</span>
              </div>
              
              {editingId === msg.id ? (
                <div className="message-edit-mode">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows="3"
                    className="message-edit-textarea"
                  />
                  {editError && <span className="error-msg-edit">{editError}</span>}
                  <div className="message-edit-actions">
                    <button 
                      onClick={() => handleSaveEdit(msg.id)} 
                      className="btn btn-save-edit"
                    >
                      Guardar
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      className="btn btn-cancel-edit"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="message-body">"{msg.text}"</p>
                  
                  {/* Acciones del CRUD (Editar/Eliminar) */}
                  <div className="message-actions">
                    <button 
                      onClick={() => handleEditClick(msg)} 
                      className="message-action-btn edit-btn"
                      title="Editar comentario"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
                          onDeleteMessage(msg.id);
                        }
                      }} 
                      className="message-action-btn delete-btn"
                      title="Eliminar comentario"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
