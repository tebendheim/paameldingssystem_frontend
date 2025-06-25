import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Option = {
  id: number;
  value: string;
};

type Field = {
  id: number;
  label: string;
  field_type: string;
  is_required: boolean;
  order: number;
  options?: Option[];
};

const EditFieldsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [fields, setFields] = useState<Field[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldIsRequired, setNewFieldIsRequired] = useState(false);

  useEffect(() => {
    const fetchFieldsAndOptions = async () => {
      try {
        const [fieldsRes, optionsRes] = await Promise.all([
          fetch(`http://localhost:3000/api/fields/event/${id}/fields`, { credentials: "include" }),
          fetch(`http://localhost:3000/api/fields/options/event/${id}`, { credentials: "include" }),
        ]);

        if (!fieldsRes.ok || !optionsRes.ok) {
          throw new Error("Klarte ikke hente data");
        }

        const fieldsData: Field[] = await fieldsRes.json();
        const optionsData: { field_id: number; options: Option[] }[] = await optionsRes.json();

        // Slå sammen options med feltene
        const mergedFields = fieldsData.map((field) => {
          const match = optionsData.find((opt) => opt.field_id === field.id);
          return {
            ...field,
            options: match?.options || [],
          };
        });

        // Sorter feltene etter order
        mergedFields.sort((a, b) => a.order - b.order);

        setFields(mergedFields);
      } catch (err) {
        console.error("Feil ved henting av felter og options:", err);
      }
    };

    fetchFieldsAndOptions();
  }, [id]);

  // --- Drag & Drop funksjonalitet for feltene ---
  const onDragDrop = (draggedIndex: number, hoverIndex: number) => {
    const updated = Array.from(fields);
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(hoverIndex, 0, moved);
    // Oppdater order basert på ny rekkefølge
    const reordered = updated.map((f, i) => ({ ...f, order: i + 1 }));
    setFields(reordered);

    // Send ny rekkefølge til backend
    fetch(`http://localhost:3000/api/fields/event/${id}/reorder`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((f) => f.id) }),
    }).catch((e) => {
      console.error("Feil ved oppdatering av rekkefølge", e);
    });
  };

  // --- Håndtering av feltendringer ---
  const handleFieldChange = (fieldId: number, key: keyof Field, value: any) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, [key]: value } : field
      )
    );
  };

  // --- Legg til nytt felt ---
  const handleAddField = () => {
    fetch(`http://localhost:3000/api/fields/event/${id}/fields`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newFieldLabel,
        field_type: newFieldType,
        is_required: newFieldIsRequired,
        options: newFieldType === "select" ? [] : undefined,
      }),
    })
      .then((res) => res.json())
      .then((newField: Field) => {
        setFields((prev) => [...prev, newField]);
        setNewFieldLabel("");
      })
      .catch((err) => {
        console.error("Feil ved oppretting av felt", err);
        alert("Kunne ikke opprette nytt felt.");
      });
  };

  // --- Lagre oppdateringer på felt ---
  const handleSaveField = async (fieldId: number) => {
    const fieldToUpdate = fields.find((f) => f.id === fieldId);
    if (!fieldToUpdate) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/fields/event/${id}/fields/${fieldId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fieldToUpdate),
        }
      );
      if (!response.ok) throw new Error("Kunne ikke oppdatere felt");
      alert("Felt lagret!");
    } catch (err) {
      console.error("Feil ved lagring av felt", err);
      alert("Noe gikk galt ved lagring.");
    }
  };

  // --- Slett felt ---
  const handleDeleteField = async (fieldId: number) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/fields/event/${id}/fields/${fieldId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Kunne ikke slette felt");
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
    } catch (err) {
      console.error("Feil ved sletting av felt", err);
      alert("Noe gikk galt ved sletting.");
    }
  };

  // --- Håndtering av alternativer for select-felt ---

  // Legg til alternativ
  const handleAddOption = async (fieldId: number, newOption: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/fields/options/${fieldId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: newOption }),
        }
      );

      if (!res.ok) throw new Error("Kunne ikke legge til valgmulighet");

      const updatedOptions: Option[] = await res.json();

      setFields((prev) =>
        prev.map((f) =>
          f.id === fieldId ? { ...f, options: updatedOptions } : f
        )
      );
    } catch (err) {
      console.error(err);
      alert("Feil ved lagring av valgmulighet.");
    }
  };

  // Endre alternativ
  const handleEditOption = async (
    fieldId: number,
    optionId: number,
    newValue: string
  ) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/fields/options/${fieldId}/${optionId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: newValue }),
        }
      );

      if (!res.ok) throw new Error("Kunne ikke oppdatere valgmulighet");

      const updatedOptions: Option[] = await res.json();

      setFields((prev) =>
        prev.map((f) =>
          f.id === fieldId ? { ...f, options: updatedOptions } : f
        )
      );
    } catch (err) {
      console.error(err);
      alert("Feil ved oppdatering av valgmulighet.");
    }
  };

  // Slett alternativ
const handleDeleteOption = async (fieldId: number, optionId: number) => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/fields/options/${fieldId}/${optionId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!res.ok) throw new Error("Kunne ikke slette valgmulighet");

    // Her får du bare slettet option, ikke hele listen
    const deletedOption = await res.json();

    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              options: f.options?.filter((opt) => opt.id !== deletedOption.id),
            }
          : f
      )
    );
  } catch (err) {
    console.error(err);
    alert("Feil ved sletting av valgmulighet.");
  }
};

  // --- Render ---

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Rediger felter for arrangement</h2>

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {fields.map((field, idx) => (
          <li
            key={field.id}
            style={{
              marginBottom: "1rem",
              border: "1px solid #ccc",
              padding: "1rem",
              cursor: "grab",
              backgroundColor: "#f9f9f9",
            }}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", idx.toString())}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const draggedIdx = Number(e.dataTransfer.getData("text/plain"));
              if (draggedIdx !== idx) onDragDrop(draggedIdx, idx);
            }}
          >
            <div>
              <label>
                Label:{" "}
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleFieldChange(field.id, "label", e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Type:{" "}
                <select
                  value={field.field_type}
                  onChange={(e) =>
                    handleFieldChange(field.id, "field_type", e.target.value)
                  }
                >
                  <option value="text">Tekst</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </label>
            </div>
            <div>
              <label>
                Obligatorisk:{" "}
                <input
                  type="checkbox"
                  checked={field.is_required}
                  onChange={(e) =>
                    handleFieldChange(field.id, "is_required", e.target.checked)
                  }
                />
              </label>
            </div>

            {/* Hvis select-type, vis alternativer */}
            {field.field_type === "select" && (
              <div style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                <strong>Alternativer:</strong>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {field.options?.map((opt) => (
                    <li key={opt.id} style={{ marginBottom: "0.25rem" }}>
                      <input
                        type="text"
                        value={opt.value}
                        onChange={(e) =>
                          handleEditOption(field.id, opt.id, e.target.value)
                        }
                        style={{ marginRight: "0.5rem" }}
                      />
                      <button
                        onClick={() => handleDeleteOption(field.id, opt.id)}
                        style={{ color: "red" }}
                        type="button"
                      >
                        Slett
                      </button>
                    </li>
                  ))}
                </ul>

                <AddOptionInput
                  onAdd={(val) => {
                    if (val.trim() !== "") handleAddOption(field.id, val);
                  }}
                />
              </div>
            )}

            <button
              onClick={() => handleSaveField(field.id)}
              style={{ marginTop: "0.5rem" }}
              type="button"
            >
              Lagre felt
            </button>
            <button
              onClick={() => handleDeleteField(field.id)}
              style={{ marginLeft: "1rem", color: "red" }}
              type="button"
            >
              Slett felt
            </button>
          </li>
        ))}
      </ul>

      <hr />

      <h3>Legg til nytt felt</h3>
      <div>
        <label>
          Label:{" "}
          <input
            value={newFieldLabel}
            onChange={(e) => setNewFieldLabel(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Type:{" "}
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value)}
          >
            <option value="text">Tekst</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Obligatorisk:{" "}
          <input
            type="checkbox"
            checked={newFieldIsRequired}
            onChange={(e) => setNewFieldIsRequired(e.target.checked)}
          />
        </label>
      </div>
      <button onClick={handleAddField} disabled={!newFieldLabel.trim()}>
        Legg til felt
      </button>
    </div>
  );
};

// Hjelpekomponent for å legge til nytt alternativ i select-felt
const AddOptionInput = ({ onAdd }: { onAdd: (val: string) => void }) => {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    if (inputVal.trim() !== "") {
      onAdd(inputVal.trim());
      setInputVal("");
    }
  };

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <input
        placeholder="Nytt alternativ"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
      />
      <button onClick={handleAdd} type="button" style={{ marginLeft: "0.5rem" }}>
        Legg til
      </button>
    </div>
  );
};

export default EditFieldsPage;