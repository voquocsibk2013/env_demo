/**
 * ContractsDashboard.jsx
 *
 * Multi-contract aggregation dashboard with rollup metrics.
 * Consolidates aspects, opportunities, and risk profiles across multiple projects/contracts.
 */

import React, { useState } from 'react';

export const ContractsDashboard = ({ allProjects, calcSig, calcScore, calcOppScore }) => {
  const [expandedProject, setExpandedProject] = useState(null);

  // Helper function to count items by significance
  const countBySignificance = (aspects) => {
    return {
      significant: aspects.filter(a => calcSig(a) === 'SIGNIFICANT').length,
      watch: aspects.filter(a => calcSig(a) === 'WATCH').length,
      low: aspects.filter(a => calcSig(a) === 'Low').length
    };
  };

  // Helper to get average risk score across all aspects
  const getAverageRiskScore = (aspects) => {
    if (!aspects || aspects.length === 0) return 0;
    const sum = aspects.reduce((acc, a) => acc + (calcScore(a) || 0), 0);
    return (sum / aspects.length).toFixed(1);
  };

  // Get average opportunity score
  const getAverageOppScore = (opportunities) => {
    if (!opportunities || opportunities.length === 0) return 0;
    const sum = opportunities.reduce((acc, o) => acc + calcOppScore(o), 0);
    return (sum / opportunities.length).toFixed(1);
  };

  // Aggregate metrics across all projects
  const aggregateMetrics = () => {
    let totals = {
      projects: allProjects.length,
      aspects: 0,
      opportunities: 0,
      significant: 0,
      watch: 0,
      avgRiskScore: 0,
      avgOppScore: 0,
      totalCO2e: 0,
      highPriorityOpps: 0
    };

    let riskScores = [];
    let oppScores = [];

    allProjects.forEach(proj => {
      const aspects = proj.aspects || [];
      const opps = proj.opps || [];

      totals.aspects += aspects.length;
      totals.opportunities += opps.length;

      const sigCounts = countBySignificance(aspects);
      totals.significant += sigCounts.significant;
      totals.watch += sigCounts.watch;

      aspects.forEach(a => {
        const score = calcScore(a);
        if (score) riskScores.push(score);
      });

      opps.forEach(o => {
        const score = calcOppScore(o);
        oppScores.push(score);
        totals.totalCO2e += o.co2e || 0;
        if (score >= 50) totals.highPriorityOpps++;
      });
    });

    if (riskScores.length > 0) {
      totals.avgRiskScore = (riskScores.reduce((a, b) => a + b, 0) / riskScores.length).toFixed(1);
    }

    if (oppScores.length > 0) {
      totals.avgOppScore = (oppScores.reduce((a, b) => a + b, 0) / oppScores.length).toFixed(1);
    }

    return totals;
  };

  const metrics = aggregateMetrics();

  if (allProjects.length === 0) {
    return (
      <div style={{ padding: '2rem', backgroundColor: '#f8f8f8', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No projects created yet. Dashboard metrics will appear when you add projects.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Aggregate metrics cards */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '1rem' }}>Portfolio Overview</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          <MetricCard label="Projects" value={metrics.projects} color="#333" />
          <MetricCard label="Total Aspects" value={metrics.aspects} color="#666" />
          <MetricCard label="Opportunities" value={metrics.opportunities} color="#0097a7" />
          <MetricCard label="Significant Aspects" value={metrics.significant} color="#d32f2f" />
          <MetricCard label="Watch Aspects" value={metrics.watch} color="#f57c00" />
          <MetricCard label="Avg Risk Score" value={metrics.avgRiskScore} color="#388e3c" />
          <MetricCard label="Avg Opp Score" value={metrics.avgOppScore} color="#1976d2" />
          <MetricCard label="High Priority Opps" value={metrics.highPriorityOpps} color="#8b4513" />
        </div>
      </div>

      {/* Risk distribution chart (text-based) */}
      <div style={{
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', margin: '0 0 1rem' }}>Risk Distribution Across Projects</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {allProjects.map(proj => {
            const aspects = proj.aspects || [];
            const sigCount = countBySignificance(aspects).significant;
            const watchCount = countBySignificance(aspects).watch;
            const avgScore = getAverageRiskScore(aspects);

            if (aspects.length === 0) return null;

            const maxWidth = 300;
            const sigWidth = (sigCount / aspects.length) * maxWidth;
            const watchWidth = (watchCount / aspects.length) * maxWidth;

            return (
              <div key={proj.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>{proj.name || 'Untitled Project'}</span>
                  <span style={{ fontSize: '12px', color: '#999' }}>{aspects.length} aspects (avg: {avgScore})</span>
                </div>
                <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f0f0f0', gap: '2px' }}>
                  {sigWidth > 0 && (
                    <div style={{
                      width: `${sigWidth}px`,
                      backgroundColor: '#d32f2f',
                      opacity: 0.8
                    }} title={`${sigCount} significant`} />
                  )}
                  {watchWidth > 0 && (
                    <div style={{
                      width: `${watchWidth}px`,
                      backgroundColor: '#f57c00',
                      opacity: 0.8
                    }} title={`${watchCount} watch`} />
                  )}
                  {(aspects.length - sigCount - watchCount) > 0 && (
                    <div style={{
                      flex: 1,
                      backgroundColor: '#388e3c',
                      opacity: 0.8
                    }} title={`${aspects.length - sigCount - watchCount} low`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed project list */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', padding: '1.5rem 1.5rem 0' }}>Projects</h3>
        <div>
          {allProjects.map((proj, index) => {
            const aspects = proj.aspects || [];
            const opps = proj.opps || [];
            const sigCounts = countBySignificance(aspects);
            const isExpanded = expandedProject === proj.id;

            return (
              <div key={proj.id} style={{
                borderBottom: index < allProjects.length - 1 ? '1px solid #eee' : 'none'
              }}>
                {/* Header - always visible */}
                <div
                  onClick={() => setExpandedProject(isExpanded ? null : proj.id)}
                  style={{
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isExpanded ? '#f8f8f8' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                      {proj.name || 'Untitled Project'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      {proj.company && `${proj.company} • `}
                      {proj.type || 'N/A'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Aspects / Opps</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{aspects.length} / {opps.length}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Significant</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#d32f2f' }}>{sigCounts.significant}</div>
                    </div>
                    <div style={{ fontSize: '18px', color: '#999' }}>
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #eee', backgroundColor: '#f8f8f8' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <DetailItem label="Total Aspects" value={aspects.length} />
                      <DetailItem label="Significant" value={sigCounts.significant} color="#d32f2f" />
                      <DetailItem label="Watch" value={sigCounts.watch} color="#f57c00" />
                      <DetailItem label="Low Risk" value={sigCounts.low} color="#388e3c" />
                      <DetailItem label="Opportunities" value={opps.length} />
                      <DetailItem label="Avg Risk" value={getAverageRiskScore(aspects)} />
                      <DetailItem label="Avg Opp Value" value={getAverageOppScore(opps)} />
                      <DetailItem label="High Priority Opps" value={opps.filter(o => calcOppScore(o) >= 50).length} />
                    </div>

                    {proj.createdAt && (
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Created: {new Date(proj.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Portfolio health summary */}
      <div style={{
        backgroundColor: '#e3f2fd',
        border: '1px solid #90caf9',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '14px', fontWeight: 600, color: '#1565c0' }}>Portfolio Health</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#0d47a1' }}>
          {metrics.projects} project{metrics.projects !== 1 ? 's' : ''} tracked with {metrics.aspects} aspect{metrics.aspects !== 1 ? 's' : ''} and {metrics.opportunities} opportunit{metrics.opportunities !== 1 ? 'ies' : 'y'}.
          {metrics.significant > 0 && ` ${metrics.significant} significant aspect${metrics.significant !== 1 ? 's' : ''} require attention.`}
          {metrics.highPriorityOpps > 0 && ` ${metrics.highPriorityOpps} high-priority opportunity${metrics.highPriorityOpps !== 1 ? 'ies' : ''} identified.`}
        </p>
      </div>
    </div>
  );
};

// Helper component for metric cards
const MetricCard = ({ label, value, color }) => (
  <div style={{
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    border: `1px solid #e0e0e0`,
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  }}>
    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '20px', fontWeight: 600, color: color }}>{value}</div>
  </div>
);

// Helper component for detail items
const DetailItem = ({ label, value, color = '#333' }) => (
  <div>
    <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{label}</div>
    <div style={{ fontSize: '16px', fontWeight: 600, color: color }}>{value}</div>
  </div>
);

export default ContractsDashboard;
