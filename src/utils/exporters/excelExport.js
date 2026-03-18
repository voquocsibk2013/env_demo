/**
 * excelExport.js
 *
 * Creates Excel workbooks with multiple sheets for comprehensive project documentation.
 * Requires exceljs library: npm install exceljs
 */

import ExcelJS from 'exceljs';

/**
 * Export a single project to Excel
 * @param {Object} project - Project data
 * @param {Function} calcSig - Significance calculator
 * @param {Function} calcScore - Score calculator
 * @param {Function} calcOppScore - Opportunity score calculator
 */
export const exportProjectToExcel = async (project, calcSig, calcScore, calcOppScore) => {
  const workbook = new ExcelJS.Workbook();

  // Define styles
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  const subheaderStyle = {
    font: { bold: true, size: 11, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF388E3C' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  const criticalStyle = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECCCCC' } },
    font: { bold: true, color: { argb: 'FFC00000' } }
  };

  const warningStyle = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } },
    font: { color: { argb: 'FFC00000' } }
  };

  const borderStyle = {
    top: { style: 'thin', color: { argb: 'FFB7DEE8' } },
    bottom: { style: 'thin', color: { argb: 'FFB7DEE8' } },
    left: { style: 'thin', color: { argb: 'FFB7DEE8' } },
    right: { style: 'thin', color: { argb: 'FFB7DEE8' } }
  };

  // ───── Sheet 1: Summary ─────
  const summary = workbook.addWorksheet('Summary');
  summary.pageSetup = { paperSize: 9, orientation: 'landscape' };

  summary.columns = [
    { header: 'Property', key: 'property', width: 25 },
    { header: 'Value', key: 'value', width: 40 }
  ];

  summary.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  const aspects = project.aspects || [];
  const opps = project.opps || [];
  const sigCount = aspects.filter(a => calcSig(a) === 'SIGNIFICANT').length;
  const watchCount = aspects.filter(a => calcSig(a) === 'WATCH').length;
  const avgScore = aspects.length > 0
    ? (aspects.reduce((sum, a) => sum + (calcScore(a) || 0), 0) / aspects.length).toFixed(1)
    : 0;

  summary.addRows([
    { property: 'Project Name', value: project.name || 'Untitled' },
    { property: 'Company', value: project.company || 'N/A' },
    { property: 'Project Type', value: project.type || 'N/A' },
    { property: 'Project Phase', value: project.phase || 'N/A' },
    { property: 'Created Date', value: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A' },
    { property: '', value: '' },
    { property: 'Total Aspects', value: aspects.length },
    { property: 'Significant Aspects', value: sigCount },
    { property: 'Watch Aspects', value: watchCount },
    { property: 'Low Risk Aspects', value: aspects.length - sigCount - watchCount },
    { property: 'Average Risk Score', value: avgScore },
    { property: '', value: '' },
    { property: 'Total Opportunities', value: opps.length },
    { property: 'High Priority Opps (≥50)', value: opps.filter(o => calcOppScore(o) >= 50).length },
    { property: 'Medium Priority Opps (25-49)', value: opps.filter(o => calcOppScore(o) >= 25 && calcOppScore(o) < 50).length },
    { property: 'Average Opportunity Score', value: opps.length > 0 ? (opps.reduce((sum, o) => sum + calcOppScore(o), 0) / opps.length).toFixed(1) : 'N/A' }
  ]);

  // ───── Sheet 2: Aspects Register ─────
  const aspectsSheet = workbook.addWorksheet('Aspects Register');
  aspectsSheet.pageSetup = { paperSize: 9, orientation: 'landscape' };

  aspectsSheet.columns = [
    { header: 'Ref', key: 'ref', width: 12 },
    { header: 'Aspect', key: 'aspect', width: 25 },
    { header: 'Phase', key: 'phase', width: 18 },
    { header: 'Impact', key: 'impact', width: 20 },
    { header: 'Severity', key: 'severity', width: 10 },
    { header: 'Probability', key: 'probability', width: 12 },
    { header: 'Significance', key: 'significance', width: 14 },
    { header: 'Legal Threshold', key: 'legalThreshold', width: 12 },
    { header: 'Stakeholder Concern', key: 'stakeholderConcern', width: 15 },
    { header: 'Control', key: 'control', width: 20 },
    { header: 'Legal Reference', key: 'legalRef', width: 20 },
    { header: 'Owner', key: 'owner', width: 15 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  aspectsSheet.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  aspects.forEach((aspect, idx) => {
    const significance = calcSig(aspect);
    const row = aspectsSheet.addRow({
      ref: aspect.ref || `ASP-${idx + 1}`,
      aspect: aspect.aspect,
      phase: aspect.phase,
      impact: aspect.impact,
      severity: aspect.severity,
      probability: aspect.probability,
      significance,
      legalThreshold: aspect.legalThreshold,
      stakeholderConcern: aspect.stakeholderConcern,
      control: aspect.control,
      legalRef: aspect.legalRef,
      owner: aspect.owner,
      status: aspect.status
    });

    // Apply row styling based on significance
    if (significance === 'SIGNIFICANT') {
      row.eachCell(cell => {
        cell.style = { ...criticalStyle, ...borderStyle };
      });
    } else if (significance === 'WATCH') {
      row.eachCell(cell => {
        cell.style = { ...warningStyle, ...borderStyle };
      });
    } else {
      row.eachCell(cell => {
        cell.style = { border: borderStyle };
      });
    }
  });

  // ───── Sheet 3: Opportunities Register ─────
  const oppsSheet = workbook.addWorksheet('Opportunities Register');
  oppsSheet.pageSetup = { paperSize: 9, orientation: 'landscape' };

  oppsSheet.columns = [
    { header: 'Ref', key: 'ref', width: 12 },
    { header: 'Description', key: 'description', width: 25 },
    { header: 'Type', key: 'type', width: 18 },
    { header: 'Environmental Benefit', key: 'envBenefit', width: 20 },
    { header: 'Business Benefit', key: 'bizBenefit', width: 20 },
    { header: 'Env Value', key: 'envValue', width: 10 },
    { header: 'Biz Value', key: 'bizValue', width: 10 },
    { header: 'Feasibility', key: 'feasibility', width: 12 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'CO2e (tCO2e)', key: 'co2e', width: 12 },
    { header: 'Key Action', key: 'action', width: 20 },
    { header: 'Owner', key: 'owner', width: 15 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  oppsSheet.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  opps.forEach((opp, idx) => {
    const score = calcOppScore(opp);
    const row = oppsSheet.addRow({
      ref: opp.ref || `OPP-${idx + 1}`,
      description: opp.description,
      type: opp.type,
      envBenefit: opp.envBenefit,
      bizBenefit: opp.bizBenefit,
      envValue: opp.envValue,
      bizValue: opp.bizValue,
      feasibility: opp.feasibility,
      score,
      co2e: opp.co2e || 0,
      action: opp.action,
      owner: opp.owner,
      status: opp.status
    });

    // Apply row styling based on priority
    if (score >= 50) {
      row.eachCell(cell => {
        cell.style = { ...criticalStyle, ...borderStyle };
      });
    } else if (score >= 25) {
      row.eachCell(cell => {
        cell.style = { ...warningStyle, ...borderStyle };
      });
    } else {
      row.eachCell(cell => {
        cell.style = { border: borderStyle };
      });
    }
  });

  // ───── Sheet 4: Risk Matrix Data ─────
  const riskSheet = workbook.addWorksheet('Risk Matrix');
  riskSheet.columns = [
    { header: 'Severity', key: 'severity', width: 10 },
    { header: 'Probability 1', key: 'p1', width: 12 },
    { header: 'Probability 2', key: 'p2', width: 12 },
    { header: 'Probability 3', key: 'p3', width: 12 },
    { header: 'Probability 4', key: 'p4', width: 12 },
    { header: 'Probability 5', key: 'p5', width: 12 }
  ];

  riskSheet.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  // Build risk matrix
  for (let sev = 5; sev >= 1; sev--) {
    const row = { severity: `Severity ${sev}` };
    for (let prob = 1; prob <= 5; prob++) {
      const cellAspects = aspects.filter(a => a.severity === sev && a.probability === prob);
      row[`p${prob}`] = cellAspects.length > 0 ? cellAspects.map(a => a.aspect).join('; ') : '-';
    }
    riskSheet.addRow(row);
  }

  // ───── Sheet 5: Version History (if available) ─────
  if (project.versionHistory && project.versionHistory.length > 0) {
    const historySheet = workbook.addWorksheet('Version History');
    historySheet.columns = [
      { header: 'Version', key: 'version', width: 12 },
      { header: 'Date', key: 'date', width: 18 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Changes', key: 'changes', width: 30 }
    ];

    historySheet.getRow(1).eachCell(cell => {
      cell.style = headerStyle;
    });

    project.versionHistory.forEach((snap, idx) => {
      historySheet.addRow({
        version: idx + 1,
        date: new Date(snap.timestamp).toLocaleString(),
        type: snap.type,
        description: snap.description,
        changes: snap.changes?.length || 0
      });
    });
  }

  // Generate file and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name || 'Env-Report'}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Export multiple projects to a single Excel workbook
 * @param {Array} projects - Array of projects
 * @param {Function} calcSig - Significance calculator
 * @param {Function} calcScore - Score calculator
 * @param {Function} calcOppScore - Opportunity score calculator
 */
export const exportMultipleProjectsToExcel = async (projects, calcSig, calcScore, calcOppScore) => {
  const workbook = new ExcelJS.Workbook();

  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  // Portfolio summary sheet
  const portfolio = workbook.addWorksheet('Portfolio Summary');
  portfolio.columns = [
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Type', key: 'type', width: 18 },
    { header: 'Aspects', key: 'aspects', width: 10 },
    { header: 'Significant', key: 'significant', width: 12 },
    { header: 'Opportunities', key: 'opps', width: 12 },
    { header: 'Avg Risk', key: 'avgRisk', width: 10 },
    { header: 'Avg Opp Value', key: 'avgOpp', width: 12 }
  ];

  portfolio.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  projects.forEach(proj => {
    const aspects = proj.aspects || [];
    const opps = proj.opps || [];
    const sigCount = aspects.filter(a => calcSig(a) === 'SIGNIFICANT').length;
    const avgRisk = aspects.length > 0
      ? (aspects.reduce((sum, a) => sum + (calcScore(a) || 0), 0) / aspects.length).toFixed(1)
      : 0;
    const avgOpp = opps.length > 0
      ? (opps.reduce((sum, o) => sum + calcOppScore(o), 0) / opps.length).toFixed(1)
      : 0;

    portfolio.addRow({
      project: proj.name || 'Untitled',
      company: proj.company || 'N/A',
      type: proj.type || 'N/A',
      aspects: aspects.length,
      significant: sigCount,
      opps: opps.length,
      avgRisk,
      avgOpp
    });
  });

  // Generate file and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Portfolio-Report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
