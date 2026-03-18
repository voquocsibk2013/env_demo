import { useState } from "react";
import { DOMAIN_COLORS } from "../utils/colorSystem";

const CL = {
  green: "#2e7d52",
  purple: "#6a1b9a",
  blue: "#1565c0"
};

export function OpportunityTable({
  opportunities,
  onEdit,
  onDelete,
  calcOppScore,
  OPP_STATUSES,
  Btn
}) {
  const [expandedId, setExpandedId] = useState(null);

  // Helper to get subtle background color for domain
  function getDomainBg(domainColor) {
    const color = DOMAIN_COLORS[domainColor];
    if (!color) return "#fff";
    return color.bg;
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e8e8e8" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {[
              "Ref",
              "Description",
              "Type",
              "CO2e (tCO2e)",
              "Score",
              "Status",
              "Actions"
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "9px 10px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: 11,
                  color: "#777",
                  borderBottom: "1px solid #e0e0e0",
                  whiteSpace: "nowrap"
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp, idx) => {
            const score = calcOppScore(opp);
            const isExpanded = expandedId === opp.id;
            const domainBg = getDomainBg(opp.domainColor);
            const domainColor = DOMAIN_COLORS[opp.domainColor];
            const sc =
              score >= 18
                ? { bg: "#e0f2f1", c: "#00695c" }
                : score >= 9
                ? { bg: "#e8f5e9", c: CL.green }
                : { bg: "#f5f5f5", c: "#999" };

            return (
              <tbody key={opp.id}>
                <tr
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    background: domainBg,
                    cursor: "pointer",
                    transition: "background-color 0.15s"
                  }}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : opp.id)
                  }
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.opacity = "0.7";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                >
                  <td
                    style={{
                      padding: "9px 10px",
                      fontWeight: 600,
                      color: domainColor ? domainColor.text : "#333",
                      fontSize: 12,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {opp.emoji ? `${opp.emoji} ` : ""}{opp.ref || "--"}
                  </td>
                  <td style={{ padding: "9px 10px", maxWidth: 250 }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500
                      }}
                      title={opp.description}
                    >
                      {opp.description || "(No description)"}
                    </div>
                    {opp.aspectRef && (
                      <div style={{ fontSize: 11, color: "#888" }}>
                        Linked to: {opp.aspectRef}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    {opp.type && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: "#ede7f6",
                          color: CL.purple,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          display: "inline-block"
                        }}
                      >
                        {opp.type}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "9px 10px", textAlign: "center", fontWeight: 700 }}>
                    {opp.co2e || 0}
                  </td>
                  <td
                    style={{
                      padding: "9px 10px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 14
                    }}
                  >
                    {score > 0 ? (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontWeight: 600,
                          background: sc.bg,
                          color: sc.c
                        }}
                      >
                        {score}
                      </span>
                    ) : (
                      <span style={{ color: "#ccc" }}>--</span>
                    )}
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: "#f0f0f0",
                        color: "#555"
                      }}
                    >
                      {opp.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "9px 10px",
                      whiteSpace: "nowrap",
                      textAlign: "right"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Btn size="sm" onClick={() => onEdit(opp)}>
                      Edit
                    </Btn>
                    {" "}
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(opp.id)}
                    >
                      ×
                    </Btn>
                  </td>
                </tr>

                {/* Expandable detail row */}
                {isExpanded && (
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                    <td colSpan={7} style={{ padding: "1rem" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "1rem",
                          fontSize: 13
                        }}
                      >
                        {/* Left column */}
                        <div>
                          {opp.envBenefit && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Environmental Benefit
                              </p>
                              <p style={{ margin: 0, color: CL.green }}>
                                {opp.envBenefit}
                              </p>
                            </div>
                          )}
                          {opp.bizBenefit && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Business Benefit
                              </p>
                              <p style={{ margin: 0, color: CL.blue }}>
                                {opp.bizBenefit}
                              </p>
                            </div>
                          )}
                          {(opp.envValue || opp.bizValue || opp.feasibility || opp.co2e) && (
                            <div>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Scoring
                              </p>
                              <div style={{ fontSize: 12, color: "#666" }}>
                                {opp.envValue && <div>Env Value: {opp.envValue}/3</div>}
                                {opp.bizValue && <div>Business Value: {opp.bizValue}/3</div>}
                                {opp.feasibility && <div>Feasibility: {opp.feasibility}/3</div>}
                                {opp.co2e && <div>CO2e Reduction: {opp.co2e} tCO2e</div>}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right column */}
                        <div>
                          {opp.action && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Key Action
                              </p>
                              <p style={{ margin: 0, color: "#333" }}>
                                {opp.action}
                              </p>
                            </div>
                          )}
                          {opp.alignment && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Framework Alignment
                              </p>
                              <p style={{ margin: 0, color: "#333" }}>
                                {opp.alignment}
                              </p>
                            </div>
                          )}
                          {opp.owner && (
                            <div>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Owner
                              </p>
                              <p style={{ margin: 0, color: "#333" }}>
                                {opp.owner}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
