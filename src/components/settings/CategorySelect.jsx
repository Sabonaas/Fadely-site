const ALL_CATEGORIES = [
  'Sobrancelha', 'Cabeleireiro', 'Unhas', 'Maquiagem', 'Barbeiro',
  'Cílios', 'Massagem', 'Depilação', 'Spa', 'Tatuagem', 'Piercing',
  'Odontologia', 'Medicina', 'Optometria', 'Tratamento facial', 'Terapia', 'Outros',
];

export default function CategorySelect({ value = [], onChange }) {
  const toggle = (cat) => {
    if (value.includes(cat)) {
      onChange(value.filter(c => c !== cat));
    } else {
      onChange([...value, cat]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_CATEGORIES.map(cat => {
        const selected = value.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => toggle(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={selected ? {
              background: 'rgba(79,142,247,0.18)',
              border: '1px solid rgba(79,142,247,0.35)',
              color: '#7BB3FF',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            {selected && <span className="mr-1 text-blue-400">✓</span>}
            {cat}
          </button>
        );
      })}
    </div>
  );
}