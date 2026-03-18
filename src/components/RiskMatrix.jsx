/**
 * RiskMatrix.jsx
 *
 * Displays a 5x5 risk matrix with severity (Y-axis) vs probability (X-axis).
 * Plots aspects as colored circles sized by significance score.
 * ISO 14001:2015 compliance visualization.
 */

import React from 'react';

export const RiskMatrix = ({ aspects, calcSig, calcScore }) => {
  // Matrix dimensions: 5x5 (Severity rows 5-1, Probability cols 1-5)
  const severityLevels = [5, 4, 3, 2, 1];
  const probabilityLevels = [1, 2, 3, 4, 5];

  // Group aspects by their position in the matrix
  const getAspectsInCell = (severity, probability) => {
    return aspects.filter(a => {
      return a.severity === severity && a.probability === probability;
    });
  };

  // Risk zone colors (risk increases towards top-right)
  const getRiskZoneColor = (severity, probability) => {
    const riskScore = severity * probability;
    if (riskScore >= 20) return { bg: '#ffebee', zone: 'HIGH' }; // Red zone
    if (riskScore >= 12) return { bg: '#fff3e0', zone: 'MEDIUM' }; // Orange zone
    return { bg: '#e8f5e9', zone: 'LOW' }; // Green zone
  };

  // Color for individual aspect dots
  const getAspectDotColor = (aspect) => {
    const sig = calcSig(aspect);
    if (sig === 'SIGNIFICANT') return '#d32f2f';
    if (sig === 'WATCH') return '#f57c00';
    return '#388e3c';
  };

  // Size of dots based on score
  const getDotSize = (aspect) => {
    const score = calcScore(aspect);
    if (score === null) return 30;
    if (score >= 15) return 50;
    if (score >= 12) return 40;
    if (score >= 8) return 35;
    return 30;
  };

  return (
    <div className="risk-matrix-container" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '18px', fontWeight: 600, color: '#333' }}>
          Risk Assessment Matrix
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          ISO 14001:2015 Cl.6.1.2: Significance scoring based on severity × probability + sensitivity/scale/duration
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
              <th style={{ width: '60px', padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#666' }}>
                Severity →
              </th>
              {probabilityLevels.map(p => (
                <th key={`ph-${p}`} style={{
                  width: '100px',
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#333',
                  borderBottom: '2px solid #ddd'
                }}>
                  Prob {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {severityLevels.map(severity => (
              <tr key={`row-${severity}`}>
                <th style={{
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#333',
                  borderRight: '2px solid #ddd',
                  backgroundColor: '#f8f8f8'
                }}>
                  Sev {severity}
                </th>
                {probabilityLevels.map(probability => {
                  const cellAspects = getAspectsInCell(severity, probability);
                  const { bg, zone } = getRiskZoneColor(severity, probability);

                  return (
                    <td
                      key={`cell-${severity}-${probability}`}
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
                      {/* Risk zone label (faint) */}
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

                      {/* Display aspects as circles */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
                      }}>
                        {cellAspects.length > 0 ? (
                          cellAspects.map((aspect, idx) => {
                            const dotSize = getDotSize(aspect);
                            const dotColor = getAspectDotColor(aspect);

                            return (
                              <div
                                key={aspect.id}
                                title={`${aspect.aspect} (${calcSig(aspect)})`}
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
                                {cellAspects.length > 1 ? idx + 1 : ''}
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
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '12px', fontWeight: 600, color: '#333' }}>Significance Levels</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666' }}>
            <div><span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#d32f2f', marginRight: '6px' }}></span> SIGNIFICANT</div>
            <div><span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#f57c00', marginRight: '6px' }}></span> WATCH</div>
            <div><span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#388e3c', marginRight: '6px' }}></span> Low</div>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '12px', fontWeight: 600, color: '#333' }}>Risk Zones</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666' }}>
            <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ffebee', border: '1px solid #ddd', marginRight: '6px' }}></span> High (≥20)</div>
            <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fff3e0', border: '1px solid #ddd', marginRight: '6px' }}></span> Medium (12-19)</div>
            <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#e8f5e9', border: '1px solid #ddd', marginRight: '6px' }}></span> Low (&lt;12)</div>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '12px', fontWeight: 600, color: '#333' }}>Dot Size</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666' }}>
            <div>Larger dots = higher significance score</div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#999' }}>
              Score = Severity × Probability + factors
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {aspects.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Total Aspects</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#333' }}>{aspects.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Significant</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#d32f2f' }}>
              {aspects.filter(a => calcSig(a) === 'SIGNIFICANT').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Watch</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#f57c00' }}>
              {aspects.filter(a => calcSig(a) === 'WATCH').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Average Score</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#388e3c' }}>
              {(aspects.reduce((sum, a) => sum + (calcScore(a) || 0), 0) / aspects.length).toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskMatrix;
