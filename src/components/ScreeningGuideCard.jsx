import { useState } from 'react';
import { getColorByDomain } from '../utils/colorSystem';

/**
 * ScreeningGuideCard Component
 *
 * Renders a single guide word item with inline form capability.
 * - Initially shows guide word in collapsed state
 * - Click "Use" to open inline form below the guide word
 * - Form prefilled with guide word data including color/emoji
 * - On save, form collapses and ready for next item
 */
export function ScreeningGuideCard({
  item,
  stage,
  isRisks,
  onSave,
  PHASE_MAP,
  COND_MAP,
  CONDITIONS,
  PHASES,
  STATUSES,
  OPP_TYPES,
  OPP_STATUSES,
  emptyAspect,
  emptyOpp
}) {
  const color = getColorByDomain(item.domainColor);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const handleUse = () => {
    // Prefill form with guide word data, including color and emoji
    if (isRisks) {
      setFormData({
        ...emptyAspect(),
        phase: PHASE_MAP[stage] || '',
        area: item.area || '',
        aspect: item.aspect || '',
        condition: COND_MAP[stage] || 'Normal',
        legalRef: item.regulations?.[0] || '',
        domainColor: item.domainColor,
        emoji: item.emoji
      });
    } else {
      setFormData({
        ...emptyOpp(),
        description: item.opp || '',
        domainColor: item.domainColor,
        emoji: item.emoji
      });
    }
    setFormOpen(true);
  };

  const handleSave = () => {
    // Validate required fields
    if (isRisks && !formData.aspect.trim()) return;
    if (!isRisks && !formData.description.trim()) return;

    onSave(formData);
    setFormOpen(false);
    setFormData(null);
  };

  const handleCancel = () => {
    setFormOpen(false);
    setFormData(null);
  };

  // Collapsed guide word display
  if (!formOpen) {
    return (
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid ' + color.border,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: color.text, marginBottom: 4 }}>
            {item.emoji} {item.kw}
          </div>
          <p style={{ fontSize: 12, color: '#555', margin: '0 0 5px', lineHeight: 1.5 }}>
            {item.q}
          </p>
          <span style={{
            fontSize: 11,
            padding: '1px 7px',
            borderRadius: 3,
            background: color.bg,
            color: color.text,
            fontStyle: 'italic'
          }}>
            {isRisks ? 'Aspect: ' + item.aspect : 'Opportunity: ' + item.opp}
          </span>

          {item.regulations?.length > 0 && (
            <div style={{ fontSize: 10, color: '#666', marginTop: 6 }}>
              <strong>Regulations:</strong>
              <ul style={{ margin: '3px 0', paddingLeft: 16 }}>
                {item.regulations.slice(0, 2).map((reg, i) => (
                  <li key={i}>{reg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={handleUse}
          style={{
            padding: '5px 12px',
            fontSize: 12,
            borderRadius: 7,
            border: 'none',
            background: color.hex,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          Use
        </button>
      </div>
    );
  }

  // Open form display (inline)
  return (
    <div style={{
      padding: '12px 14px',
      borderTop: '2px solid ' + color.hex,
      background: color.bg,
      borderRadius: 6,
      marginTop: -1
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: color.text }}>
          {item.emoji} {item.kw}
        </span>
        <span style={{ fontSize: 11, color: '#999' }}>({color.name})</span>
      </div>

      {/* Aspect/Risk form fields */}
      {isRisks && formData && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 }}>Aspect *</label>
              <input
                value={formData.aspect}
                onChange={e => setFormData({...formData, aspect: e.target.value})}
                style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}
                placeholder="e.g. Fugitive dust generation"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 }}>Area</label>
              <input
                value={formData.area}
                onChange={e => setFormData({...formData, area: e.target.value})}
                style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}
                placeholder="e.g. Site excavation"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 }}>Phase</label>
              <select
                value={formData.phase}
                onChange={e => setFormData({...formData, phase: e.target.value})}
                style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}
              >
                <option value="">Select</option>
                {PHASES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 }}>Condition</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
                style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}
              >
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 }}>Legal Reference</label>
              <input
                value={formData.legalRef}
                onChange={e => setFormData({...formData, legalRef: e.target.value})}
                style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}
                placeholder="e.g. Regulation reference"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 }}>Receptors</label>
              <input
                value={formData.receptors}
                onChange={e => setFormData({...formData, receptors: e.target.value})}
                style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}
                placeholder="e.g. Air, Human health"
              />
            </div>
          </div>
        </div>
      )}

      {/* Opportunity form fields */}
      {!isRisks && formData && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 }}>Opportunity Description *</label>
              <input
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}
                placeholder="Describe the opportunity"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 }}>Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}
              >
                <option value="">Select type</option>
                {OPP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSave}
          style={{
            padding: '6px 14px',
            fontSize: 12,
            borderRadius: 6,
            border: 'none',
            background: color.hex,
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 500,
            opacity: (isRisks && formData.aspect.trim()) || (!isRisks && formData.description.trim()) ? 1 : 0.5
          }}
          disabled={isRisks ? !formData.aspect.trim() : !formData.description.trim()}
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          style={{
            padding: '6px 14px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
