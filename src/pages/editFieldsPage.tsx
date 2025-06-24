import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import type { DropResult } from "react-beautiful-dnd";

type Field = {
  id: number;
  label: string;
  field_type: string;
  is_required: boolean;
  prioritet: number;
};

const EditFieldsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/fields/event/${id}/fields`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // Sorter etter prioritet når du henter
        const sorted = data.sort((a: Field, b: Field) => a.prioritet - b.prioritet);
        setFields(sorted);
      })
      .catch((err) => console.error("Feil ved henting av felter:", err));
  }, [id]);

  // Funksjon som kjører når drag & drop fullføres
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return; // Droppet utenfor listen

    const newFields = Array.from(fields);
    const [movedItem] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, movedItem);

    // Oppdater prioritet basert på ny rekkefølge
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      prioritet: index + 1, // Prioritet starter på 1
    }));

    setFields(updatedFields);

    // Send oppdaterte prioriteringer til backend
    try {
      await Promise.all(
        updatedFields.map((field) =>
          fetch(
            `http://localhost:3000/api/fields/event/${id}/fields/${field.id}/prioritet`,
            {
              method: "PUT",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ prioritet: field.prioritet }),
            }
          )
        )
      );
    } catch (err) {
      console.error("Feil ved oppdatering av prioritet", err);
      alert("Noe gikk galt ved oppdatering av prioritet.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Rediger felter for arrangement</h2>

<DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="fields-list">
    {(provided) => (
      <ul
        {...provided.droppableProps}
        ref={provided.innerRef}   // <--- Viktig å bruke innerRef her!
        style={{ listStyle: "none", padding: 0 }}
      >
        {fields.map((field, index) => (
          <Draggable
            key={field.id}
            draggableId={field.id.toString()}
            index={index}
          >
            {(provided, snapshot) => (
              <li
                ref={provided.innerRef}           // <--- Viktig!
                {...provided.draggableProps}      // <--- Viktig!
                {...provided.dragHandleProps}     // <--- Viktig!
                style={{
                  userSelect: "none",
                  padding: 16,
                  marginBottom: 8,
                  backgroundColor: snapshot.isDragging ? "#f0f0f0" : "white",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  ...provided.draggableProps.style,
                }}
              >
                {/* Dine inputs her */}
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const updated = [...fields];
                    updated[index] = {
                      ...field,
                      label: e.target.value,
                    };
                    setFields(updated);
                  }}
                />
                <span style={{ marginLeft: 10 }}>
                  Prioritet: {field.prioritet}
                </span>
              </li>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </ul>
    )}
  </Droppable>
</DragDropContext>

      {/* Her kan du beholde din "Legg til nytt felt"-seksjon */}
    </div>
  );
};

export default EditFieldsPage;
