import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Mascotas iniciales por defecto para no mostrar una pantalla vacía
const INITIAL_MASCOTAS = [
  {
    id: 'toby-123',
    nombre: 'Toby',
    raza: 'Beagle',
    edad: 3,
    sexo: 'Macho',
    foto: 'https://cdn.pixabay.com/photo/2020/06/27/21/03/beagle-5347232_1280.jpg',
    records: [
      {
        id: 'rec-1',
        tipo: 'Vacuna',
        nombre: 'Antirrábica Anual',
        fecha: '2026-06-10',
        notas: 'Dosis aplicada por Dr. Morales. Próxima fecha: Junio 2027.'
      },
      {
        id: 'rec-2',
        tipo: 'Desparasitación',
        nombre: 'Pill Antiparásitos Octoplus',
        fecha: '2026-07-01',
        notas: 'Control mensual ordinario.'
      }
    ]
  }
];

export default function MascotasPanel({ onShowToast }) {
  // Carga inicial y persistencia en Local Storage (Criterio: CRUD Local Storage)
  const [mascotas, setMascotas] = useState(() => {
    const localData = localStorage.getItem('beagle_mascotas');
    return localData ? JSON.parse(localData) : INITIAL_MASCOTAS;
  });

  useEffect(() => {
    localStorage.setItem('beagle_mascotas', JSON.stringify(mascotas));
  }, [mascotas]);

  // Estados de control de UI y sincronización
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Token único del navegador para asociar la propiedad de las mascotas
  const [ownerToken] = useState(() => {
    let token = localStorage.getItem('beagle_owner_token');
    if (!token) {
      token = `owner-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
      localStorage.setItem('beagle_owner_token', token);
    }
    return token;
  });

  // Sincronización bidireccional de mascotas con Supabase
  const handleSyncPets = async () => {
    if (!supabase) {
      if (onShowToast) onShowToast("Supabase no está configurado en las variables de entorno.", "error");
      return;
    }

    setIsSyncing(true);
    if (onShowToast) onShowToast("Sincronizando expedientes... 🔄", "success");

    try {
      // 1. Subir mascotas locales a Supabase (upsert)
      const petsToUpsert = mascotas.map(pet => ({
        id: pet.id,
        nombre: pet.nombre,
        raza: pet.raza,
        edad: pet.edad,
        sexo: pet.sexo,
        foto: pet.foto,
        records: pet.records || [],
        owner_token: pet.owner_token || ownerToken // Asegurar que tenga un token de creador
      }));

      if (petsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('beagle_mascotas')
          .upsert(petsToUpsert);

        if (upsertError) throw upsertError;
      }

      // 2. Descargar mascotas desde Supabase
      const { data: remotePets, error: fetchError } = await supabase
        .from('beagle_mascotas')
        .select('*');

      if (fetchError) throw fetchError;

      // 3. Combinar datos remotos con locales
      const mergedMascotas = [...mascotas];

      if (remotePets) {
        remotePets.forEach(remotePet => {
          const localIndex = mergedMascotas.findIndex(localPet => localPet.id === remotePet.id);
          if (localIndex === -1) {
            // Si no existe localmente, se añade con su token correspondiente
            mergedMascotas.push({
              id: remotePet.id,
              nombre: remotePet.nombre,
              raza: remotePet.raza,
              edad: remotePet.edad,
              sexo: remotePet.sexo,
              foto: remotePet.foto,
              records: remotePet.records || [],
              owner_token: remotePet.owner_token
            });
          } else {
            // Actualizar el token del dueño localmente si no existiera
            if (!mergedMascotas[localIndex].owner_token) {
              mergedMascotas[localIndex].owner_token = remotePet.owner_token;
            }
            // Fusionamos los records sin duplicados por ID de registro
            const localRecords = mergedMascotas[localIndex].records || [];
            const remoteRecords = remotePet.records || [];
            const mergedRecords = [...localRecords];

            remoteRecords.forEach(remRec => {
              const recExists = mergedRecords.some(locRec => locRec.id === remRec.id);
              if (!recExists) {
                mergedRecords.push(remRec);
              }
            });

            // Reordenar registros clínicos por fecha descendente
            mergedRecords.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            mergedMascotas[localIndex].records = mergedRecords;
          }
        });
      }

      setMascotas(mergedMascotas);
      if (onShowToast) onShowToast("¡Expedientes sincronizados! 🐾", "success");
    } catch (err) {
      console.error("Error en sincronización de mascotas:", err);
      if (onShowToast) {
         onShowToast(`Error de sincronización: ${err.message || 'Verifica la conexión.'}`, "error");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Estados de los Formularios de Mascotas
  const [petForm, setPetForm] = useState({ nombre: '', raza: 'Beagle', edad: '', sexo: 'Macho', foto: '' });
  const [petErrors, setPetErrors] = useState({});

  // Estados del CRUD Clínico (Historial Médico)
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [recordForm, setRecordForm] = useState({ tipo: 'Vacuna', nombre: '', fecha: '', notas: '' });
  const [recordErrors, setRecordErrors] = useState({});

  // Mascota seleccionada actualmente para el expediente clínico
  const activePet = mascotas.find(m => m.id === selectedPetId);
  const isOwner = !activePet || !activePet.owner_token || activePet.owner_token === ownerToken;

  // --- VALIDACIONES MASCOTAS ---
  const validatePetForm = () => {
    const errors = {};
    if (!petForm.nombre.trim()) {
      errors.nombre = 'El nombre de la mascota es obligatorio.';
    } else if (petForm.nombre.trim().length < 2) {
      errors.nombre = 'Debe tener al menos 2 caracteres.';
    }

    if (!petForm.edad || isNaN(petForm.edad) || parseInt(petForm.edad) < 0) {
      errors.edad = 'Ingresa una edad válida (0 o más).';
    }

    if (!petForm.foto.trim()) {
      errors.foto = 'La URL de la foto es obligatoria.';
    } else {
      try {
        new URL(petForm.foto);
      } catch (_) {
        errors.foto = 'Ingresa una URL válida (ej. https://...)';
      }
    }
    return errors;
  };

  // --- CRUD MASCOTAS (Create / Update / Delete) ---
  const handleSavePet = (e) => {
    e.preventDefault();
    const errors = validatePetForm();
    if (Object.keys(errors).length > 0) {
      setPetErrors(errors);
      return;
    }

    if (editingPetId) {
      // Update Mascota - verify ownerToken
      const targetPet = mascotas.find(m => m.id === editingPetId);
      if (targetPet && targetPet.owner_token && targetPet.owner_token !== ownerToken) {
        if (onShowToast) onShowToast("No tienes permisos para modificar esta mascota.", "error");
        setEditingPetId(null);
        return;
      }
      setMascotas(prev => prev.map(m => m.id === editingPetId ? { ...m, ...petForm, edad: parseInt(petForm.edad) } : m));
      setEditingPetId(null);
    } else {
      // Create Mascota
      const newPet = {
        id: `pet-${Date.now()}`,
        nombre: petForm.nombre.trim(),
        raza: petForm.raza,
        edad: parseInt(petForm.edad),
        sexo: petForm.sexo,
        foto: petForm.foto.trim(),
        records: [],
        owner_token: ownerToken
      };
      setMascotas(prev => [...prev, newPet]);
      setIsAddingPet(false);
    }
    setPetForm({ nombre: '', raza: 'Beagle', edad: '', sexo: 'Macho', foto: '' });
    setPetErrors({});
  };

  const handleEditPetClick = (pet) => {
    if (pet.owner_token && pet.owner_token !== ownerToken) {
      if (onShowToast) onShowToast("No eres el propietario de esta mascota.", "error");
      return;
    }
    setPetForm({ nombre: pet.nombre, raza: pet.raza, edad: pet.edad.toString(), sexo: pet.sexo, foto: pet.foto });
    setEditingPetId(pet.id);
    setIsAddingPet(true);
    setPetErrors({});
  };

  const handleDeletePet = async (id, nombre) => {
    const petToDelete = mascotas.find(m => m.id === id);
    if (petToDelete && petToDelete.owner_token && petToDelete.owner_token !== ownerToken) {
      if (onShowToast) onShowToast("No tienes permisos para eliminar esta mascota.", "error");
      return;
    }
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${nombre}? Se perderá también su historial clínico.`)) {
      if (supabase && petToDelete) {
        try {
          const { error } = await supabase
            .from('beagle_mascotas')
            .delete()
            .eq('id', id)
            .eq('owner_token', ownerToken);
          if (error) throw error;
        } catch (err) {
          console.error("Error al borrar mascota en la nube:", err);
        }
      }
      setMascotas(prev => prev.filter(m => m.id !== id));
      if (selectedPetId === id) setSelectedPetId(null);
    }
  };

  // --- VALIDACIONES HISTORIAL CLÍNICO ---
  const validateRecordForm = () => {
    const errors = {};
    if (!recordForm.nombre.trim()) {
      errors.nombre = 'El nombre de la vacuna o consulta es obligatorio.';
    }
    if (!recordForm.fecha) {
      errors.fecha = 'Selecciona una fecha válida.';
    }
    return errors;
  };

  // --- CRUD CLÍNICO (Create / Update / Delete) ---
  const handleSaveRecord = (e) => {
    e.preventDefault();
    const errors = validateRecordForm();
    if (Object.keys(errors).length > 0) {
      setRecordErrors(errors);
      return;
    }

    const isOwner = !activePet || !activePet.owner_token || activePet.owner_token === ownerToken;
    if (!isOwner) {
      if (onShowToast) onShowToast("No tienes permisos para modificar el expediente clínico.", "error");
      return;
    }

    setMascotas(prev => prev.map(m => {
      if (m.id !== selectedPetId) return m;

      let updatedRecords;
      if (editingRecordId) {
        // Update Record
        updatedRecords = m.records.map(r => r.id === editingRecordId ? { ...r, ...recordForm } : r);
        setEditingRecordId(null);
      } else {
        // Create Record
        const newRecord = {
          id: `rec-${Date.now()}`,
          ...recordForm
        };
        updatedRecords = [...m.records, newRecord];
        setIsAddingRecord(false);
      }

      // Ordenar registros por fecha descendente
      updatedRecords.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      return { ...m, records: updatedRecords };
    }));

    setRecordForm({ tipo: 'Vacuna', nombre: '', fecha: '', notas: '' });
    setRecordErrors({});
  };

  const handleEditRecordClick = (rec) => {
    const isOwner = !activePet || !activePet.owner_token || activePet.owner_token === ownerToken;
    if (!isOwner) {
      if (onShowToast) onShowToast("No tienes permisos para modificar este expediente clínico.", "error");
      return;
    }
    setRecordForm({ tipo: rec.tipo, nombre: rec.nombre, fecha: rec.fecha, notas: rec.notas });
    setEditingRecordId(rec.id);
    setIsAddingRecord(true);
    setRecordErrors({});
  };

  const handleDeleteRecord = (recId) => {
    const isOwner = !activePet || !activePet.owner_token || activePet.owner_token === ownerToken;
    if (!isOwner) {
      if (onShowToast) onShowToast("No tienes permisos para modificar este expediente clínico.", "error");
      return;
    }
    if (window.confirm('¿Deseas eliminar este registro médico?')) {
      setMascotas(prev => prev.map(m => {
        if (m.id !== selectedPetId) return m;
        return {
          ...m,
          records: m.records.filter(r => r.id !== recId)
        };
      }));
    }
  };

  return (
    <section id="mascotas-panel" className="content-section mascotas-section">
      {/* VISTA 1: EXPEDIENTE CLÍNICO DETALLADO DE UNA MASCOTA */}
      {selectedPetId && activePet ? (
        <div className="clinical-expediente-view fade-in">
          <button className="btn btn-secondary back-btn" onClick={() => { setSelectedPetId(null); setIsAddingRecord(false); setEditingRecordId(null); }}>
            ← Volver a Mis Mascotas
          </button>

          <div className="pet-profile-header-card">
            <img src={activePet.foto} alt={activePet.nombre} className="pet-header-avatar" />
            <div className="pet-header-details">
              <h2>Historial Clínico: {activePet.nombre}</h2>
              <p className="pet-meta-stats">
                <span><strong>Raza:</strong> {activePet.raza}</span> • 
                <span><strong>Edad:</strong> {activePet.edad} {activePet.edad === 1 ? 'año' : 'años'}</span> • 
                <span><strong>Sexo:</strong> {activePet.sexo}</span>
              </p>
            </div>
            {isOwner ? (
              <button className="btn btn-primary add-record-btn-top" onClick={() => {
                setIsAddingRecord(!isAddingRecord);
                setEditingRecordId(null);
                setRecordForm({ tipo: 'Vacuna', nombre: '', fecha: '', notas: '' });
                setRecordErrors({});
              }}>
                {isAddingRecord ? 'Cancelar' : '+ Agregar Registro Médico'}
              </button>
            ) : (
              <div className="readonly-badge-container" style={{ backgroundColor: 'rgba(210, 180, 140, 0.15)', borderLeft: '4px solid #d2b48c', padding: '0.8rem 1.2rem', borderRadius: '8px', fontSize: '0.95rem', color: '#665b54', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👁️ Modo Lectura</span>
              </div>
            )}
          </div>

          {/* Formulario de Historial Clínico (Create / Update) */}
          {isAddingRecord && (
            <form className="record-form animate-slide-down" onSubmit={handleSaveRecord}>
              <h3>{editingRecordId ? 'Editar Registro Clínico' : 'Nuevo Registro de Salud'}</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="rec-tipo">Tipo de Evento:</label>
                  <select
                    id="rec-tipo"
                    value={recordForm.tipo}
                    onChange={(e) => setRecordForm({ ...recordForm, tipo: e.target.value })}
                  >
                    <option value="Vacuna">💉 Vacuna</option>
                    <option value="Consulta">🩺 Consulta Médica</option>
                    <option value="Desparasitación">💊 Desparasitación</option>
                    <option value="Tratamiento">🩹 Tratamiento / Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rec-nombre">Nombre/Concepto:</label>
                  <input
                    type="text"
                    id="rec-nombre"
                    placeholder="Ej. Antirrábica, Chequeo Anual"
                    value={recordForm.nombre}
                    onChange={(e) => setRecordForm({ ...recordForm, nombre: e.target.value })}
                    className={recordErrors.nombre ? 'is-invalid' : ''}
                  />
                  {recordErrors.nombre && <span className="error-text">{recordErrors.nombre}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="rec-fecha">Fecha del Evento:</label>
                  <input
                    type="date"
                    id="rec-fecha"
                    value={recordForm.fecha}
                    onChange={(e) => setRecordForm({ ...recordForm, fecha: e.target.value })}
                    className={recordErrors.fecha ? 'is-invalid' : ''}
                  />
                  {recordErrors.fecha && <span className="error-text">{recordErrors.fecha}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="rec-notas">Notas / Instrucciones del Veterinario:</label>
                <textarea
                  id="rec-notes"
                  placeholder="Instrucciones especiales, peso del perro, medicamentos recetados, próxima dosis..."
                  rows="3"
                  value={recordForm.notas}
                  onChange={(e) => setRecordForm({ ...recordForm, notas: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-save">
                  {editingRecordId ? 'Guardar Cambios' : 'Registrar'}
                </button>
                <button type="button" className="btn btn-cancel" onClick={() => { setIsAddingRecord(false); setEditingRecordId(null); }}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Línea de tiempo de Registros Clínicos (Read) */}
          <div className="timeline-section">
            <h3>Línea de Tiempo Médica</h3>
            {activePet.records.length === 0 ? (
              <div className="empty-state-clinical">
                <p className="empty-icon">🩺</p>
                <h4>Expediente Clínico Vacío</h4>
                <p>No hay eventos médicos registrados para {activePet.nombre}. ¡Registra su primera vacuna para comenzar!</p>
              </div>
            ) : (
              <div className="clinical-timeline">
                {activePet.records.map((rec) => (
                  <div key={rec.id} className="timeline-item">
                    <div className="timeline-badge-icon">
                      {rec.tipo === 'Vacuna' && '💉'}
                      {rec.tipo === 'Consulta' && '🩺'}
                      {rec.tipo === 'Desparasitación' && '💊'}
                      {rec.tipo === 'Tratamiento' && '🩹'}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className={`timeline-type-label type-${rec.tipo.toLowerCase()}`}>
                          {rec.tipo}
                        </span>
                        <span className="timeline-date">{rec.fecha}</span>
                      </div>
                      <h4 className="timeline-title">{rec.nombre}</h4>
                      {rec.notas && <p className="timeline-notes">"{rec.notas}"</p>}
                      
                      {/* Acciones clínicas (Update / Delete) */}
                      {isOwner && (
                        <div className="timeline-actions">
                          <button className="timeline-action-btn edit" onClick={() => handleEditRecordClick(rec)}>
                            ✏️ Editar
                          </button>
                          <button className="timeline-action-btn delete" onClick={() => handleDeleteRecord(rec.id)}>
                            🗑️ Borrar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VISTA 2: LISTA DE MASCOTAS GENERAL Y REGISTRO */
        <div className="mascotas-grid-view fade-in">
          <div className="section-header-container">
            <h2>Gestor de Mascotas</h2>
            <p className="section-subtitle">
              Registra tus sabuesos de casa, edita sus datos y mantén al día su expediente clínico completo.
            </p>
            <div className="mascotas-actions-bar" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button className="btn btn-primary add-pet-btn" onClick={() => {
                setIsAddingPet(!isAddingPet);
                setEditingPetId(null);
                setPetForm({ nombre: '', raza: 'Beagle', edad: '', sexo: 'Macho', foto: '' });
                setPetErrors({});
              }}>
                {isAddingPet ? 'Cancelar Registro' : '🐾 Registrar Nueva Mascota'}
              </button>
              {supabase && (
                <button 
                  type="button"
                  className="btn btn-secondary sync-pets-btn" 
                  onClick={handleSyncPets}
                  disabled={isSyncing}
                >
                  {isSyncing ? '🔄 Sincronizando...' : '🔄 Sincronizar'}
                </button>
              )}
            </div>
          </div>

          {/* Formulario de Registro de Mascota (Create / Update) */}
          {isAddingPet && (
            <form className="pet-form animate-slide-down" onSubmit={handleSavePet}>
              <h3>{editingPetId ? 'Editar Perfil de Mascota' : 'Registrar Perro en la Comunidad'}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="pet-nombre">Nombre de la Mascota:</label>
                  <input
                    type="text"
                    id="pet-nombre"
                    placeholder="Ej. Toby, Canela"
                    value={petForm.nombre}
                    onChange={(e) => setPetForm({ ...petForm, nombre: e.target.value })}
                    className={petErrors.nombre ? 'is-invalid' : ''}
                  />
                  {petErrors.nombre && <span className="error-text">{petErrors.nombre}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pet-raza">Raza:</label>
                  <select
                    id="pet-raza"
                    value={petForm.raza}
                    onChange={(e) => setPetForm({ ...petForm, raza: e.target.value })}
                  >
                    <option value="Beagle">Beagle</option>
                    <option value="Basset Hound">Basset Hound</option>
                    <option value="Bloodhound">Bloodhound</option>
                    <option value="Foxhound">Foxhound</option>
                    <option value="Harrier">Harrier</option>
                    <option value="Coonhound">Coonhound</option>
                    <option value="Galgo">Galgo</option>
                    <option value="Otro">Otro Sabueso</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pet-edad">Edad (en años):</label>
                  <input
                    type="number"
                    id="pet-edad"
                    placeholder="Ej. 3"
                    value={petForm.edad}
                    onChange={(e) => setPetForm({ ...petForm, edad: e.target.value })}
                    className={petErrors.edad ? 'is-invalid' : ''}
                  />
                  {petErrors.edad && <span className="error-text">{petErrors.edad}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pet-sexo">Sexo:</label>
                  <select
                    id="pet-sexo"
                    value={petForm.sexo}
                    onChange={(e) => setPetForm({ ...petForm, sexo: e.target.value })}
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="pet-foto">URL de la Foto del Perro:</label>
                <input
                  type="url"
                  id="pet-foto"
                  placeholder="https://images.unsplash.com/... o enlace de Pixabay"
                  value={petForm.foto}
                  onChange={(e) => setPetForm({ ...petForm, foto: e.target.value })}
                  className={petErrors.foto ? 'is-invalid' : ''}
                />
                {petErrors.foto && <span className="error-text">{petErrors.foto}</span>}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-save">
                  {editingPetId ? 'Guardar Cambios' : 'Registrar Perro'}
                </button>
                <button type="button" className="btn btn-cancel" onClick={() => { setIsAddingPet(false); setEditingPetId(null); }}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Cuadrícula de Mascotas Registradas (Read) */}
          {mascotas.length === 0 ? (
            <div className="empty-state-pets">
              <p className="empty-icon">🐕</p>
              <h3>No hay mascotas registradas</h3>
              <p>Comienza registrando tu primer Beagle para gestionar su expediente clínico.</p>
            </div>
          ) : (
            <div className="pets-grid">
              {mascotas.map((pet) => (
                <div key={pet.id} className="pet-profile-card">
                  <div className="pet-card-image-container">
                    <img src={pet.foto} alt={pet.nombre} className="pet-card-image" />
                    <span className="pet-gender-badge type-macho">{pet.sexo === 'Macho' ? '♂️ Macho' : '♀️ Hembra'}</span>
                  </div>
                  <div className="pet-card-body">
                    <h3 className="pet-card-name">{pet.nombre}</h3>
                    <p className="pet-card-info">
                      <span><strong>Raza:</strong> {pet.raza}</span><br />
                      <span><strong>Edad:</strong> {pet.edad} {pet.edad === 1 ? 'año' : 'años'}</span>
                    </p>
                    
                    {/* Botones de acción principales (Read / Update / Delete) */}
                    <div className="pet-card-actions">
                      <button className="btn btn-secondary btn-pet-action clinical" onClick={() => setSelectedPetId(pet.id)}>
                        📋 Expediente
                      </button>
                      {(!pet.owner_token || pet.owner_token === ownerToken) && (
                        <>
                          <button className="btn btn-pet-action edit" onClick={() => handleEditPetClick(pet)} title="Editar datos">
                            ✏️
                          </button>
                          <button className="btn btn-pet-action delete" onClick={() => handleDeletePet(pet.id, pet.nombre)} title="Eliminar perfil">
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
