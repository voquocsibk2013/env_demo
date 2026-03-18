/**
 * OpportunityMatrix.jsx
 *
 * Displays a 5x5 opportunity matrix with environmental value vs business value.
 * Plots opportunities as colored circles sized by feasibility score.
 * CSRD double materiality framework visualization.
 */

import React from 'react';

export const OpportunityMatrix = ({ opportunities, calcOppScore }) => {
  // Matrix dimensions: 5x5 (Env Value rows 5-1, Biz Value cols 1-5)
  const envValueLevels = [5, 4, 3, 2, 1];
  const bizValueLevels = [1, 2, 3, 4, 5];

  // Get opportunities in a specific cell
  const getOppsInCell = (envValue, bizValue) => {
    return opportunities.filter(o => {
      return o.envValue === envValue && o.bizValue === bizValue;
    });
  };

  // Opportunity zone colors (opportunities increase towards top-right)
  const getOpportunityZoneColor = (envValue, bizValue) => {
    const score = envValue * bizValue;
    if (score >= 20) return { bg: '#e8f5e9', zone: 'HIGH' }; // Green zone
    if (score >= 12) return { bg: '#fff9c4', zone: 'MEDIUM' }; // Yellow zone
    return { bg: '#f5f5f5', zone: 'LOW' }; // Gray zone
  };

  // Color for individual opportunity dots
  const getOppDotColor = (opp) => {
    const score = calcOppScore(opp);
    if (score >= 50) return '#1976d2'; // Blue - high priority
    if (score >= 25) return '#0097a7'; // Cyan - medium priority
    return '#689f38'; // Light green - low priority
  };

  // Size of dots based on feasibility
  const getDotSize = (opp) => {
    const feasibility = opp.feasibility || 2;
    if (feasibility === 5) return 50;
    if (feasibility === 4) return 42;
    if (feasibility === 3) return 35;
    if (feasibility === 2) return 32;
    return 28;
  };

  return (
    <div className="opportunity-matrix-container" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '18px', fontWeight: 600, color: '#333' }}>
          Opportunity Assessment Matrix
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          CSRD Double Materiality: Environmental impact vs business value for sustainable growth
        </p>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        {/* Matrix table */}
        <table style={{
          borderCollapse: 'collapse',
          width: '100%',
          minWidth: '600px',
          fontFamily: 'inherit'
        }}>
          <thead>
            <tr>
              <th style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#666' }}>
                Env Value →
              </th>
              {bizValueLevels.map(b => (
                <th key={`bh-${b}`} style={{
                  width: '100px',
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#333',
                  borderBottom: '2px solid #ddd'
                }}>
                  Biz {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {envValueLevels.map(envValue => (
              <tr key={`row-${envValue}`}>
                <th style={{
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#333',
                  borderRight: '2px solid #ddd',
                  backgroundColor: '#f8f8f8'
                }}>
                  Env {envValue}
                </th>
                {bizValueLevels.map(bizValue => {
                  const cellOpps = getOppsInCell(envValue, bizValue);
                  const { bg, zone } = getOpportunityZoneColor(envValue, bizValue);

                  return (
                    <td
                      key={`cell-${envValue}-${bizValue}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        padding: '8px',
                        border: '1px solid #ddd',
                        backgroundColor: bg,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Zone label (faint) */}
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '4px',
                        fontSize: '9px',
                        color: '#999',
                        opacity: 0.5
                      }}>
                        {zone}
                      </div>

                      {/* Display opportunities as circles */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
                      }}>
                        {cellOpps.length > 0 ? (
                          cellOpps.map((opp, idx) => {
                            const dotSize = getDotSize(opp);
                            const dotColor = getOppDotColor(opp);
                            const score = calcOppScore(opp);

                            return (
                              <div
                                key={opp.id}
                                title={`${opp.description} (Score: ${score})`}
                                style={{
                                  width: `${dotSize}px`,
                                  height: `${dotSize}px`,
                                  borderRadius: '50%',
                                  backgroundColor: dotColor,
                                  border: '2px solid rgba(255,255,255,0.8)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '8px',
                                  color: 'white',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  opacity: 0.85,
                                  transition: 'opacity 0.2s, transform 0.2s',
                                  ':hover': {
                                    opacity: 1,
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                {cellOpps.length > 1 ? idx + 1 : ''}
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ fontSize: '9px', color: '#999', opacity: 0.5 }}>—</div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee'
      }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '12px', fontWeight: 600, color: '#333' }}>Priority Levels</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666' }}>
            <div><span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#1976d2', marginRight: '6px' }}></span> High (≥50)</div>
            <div><span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#0097a7', marginRight: '6px' }}></span> Medium (25-49)</div>
            <div><span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#689f38', marginRight: '6px' }}></span> Low (&lt;25)</div>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '12px', fontWeight: 600, color: '#333' }}>Opportunity Zones</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666' }}>
            <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#e8f5e9', border: '1px solid #ddd', marginRight: '6px' }}></span> High (≥20)</div>
            <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fff9c4', border: '1px solid #ddd', marginRight: '6px' }}></span> Medium (12-19)</div>
            <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', marginRight: '6px' }}></span> Low (&lt;12)</div>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '12px', fontWeight: 600, color: '#333' }}>Dot Size</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666' }}>
            <div>Dot size = feasibility score (1-5)</div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#999' }}>
              Larger = more feasible to implement
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {opportunities.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Total Opportunities</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#333' }}>{opportunities.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>High Priority</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#1976d2' }}>
              {opportunities.filter(o => calcOppScore(o) >= 50).length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Medium Priority</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#0097a7' }}>
              {opportunities.filter(o => calcOppScore(o) >= 25 && calcOppScore(o) < 50).length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Average Score</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#689f38' }}>
              {opportunities.length > 0
                ? (opportunities.reduce((sum, o) => sum + calcOppScore(o), 0) / opportunities.length).toFixed(1)
                : '0'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityMatrix;
