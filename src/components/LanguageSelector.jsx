import React from "react";

function LanguageSelector({ selectedLang, onChange }) {
  return (
    <div>
      <label htmlFor="language">Idioma de destino:</label>
      <select id="language" value={selectedLang} onChange={(e) => onChange(e.target.value)}>
        <option value="en">Inglés</option>
        <option value="fr">Francés</option>
        <option value="it">Italiano</option>
        <option value="pt">Portugués</option>
        <option value="de">Alemán</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
