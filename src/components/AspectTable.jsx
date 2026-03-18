import { useState } from "react";
import { DOMAIN_COLORS } from "../utils/colorSystem";

export function AspectTable({
  aspects,
  onEdit,
  onDelete,
  calcScore,
  calcSig,
  condStyle,
  STATUSES,
  Btn
}) {
  const [expandedId, setExpandedId] = useState(null);

  // Helper to get subtle background color for domain
  function getDomainBg(domainColor) {
    const color = DOMAIN_COLORS[domainColor];
    if (!color) return "#fff";
    // Use a very subtle version of the bg color
    return color.bg;
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e8e8e8" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {[
              "Ref",
              "Phase",
              "Aspect",
              "Cond.",
              "Impact / Receptor",
              "Score",
              "Significance",
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
          {aspects.map((aspect, idx) => {
            const score = calcScore(aspect);
            const sig = calcSig(aspect);
            const isExpanded = expandedId === aspect.id;
            const domainBg = getDomainBg(aspect.domainColor);
            const domainColor = DOMAIN_COLORS[aspect.domainColor];

            return (
              <tbody key={aspect.id}>
                <tr
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    background: domainBg,
                    cursor: "pointer",
                    transition: "background-color 0.15s"
                  }}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : aspect.id)
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
                    {aspect.emoji ? `${aspect.emoji} ` : ""}{aspect.ref || "--"}
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
                      {aspect.phase || "--"}
                    </span>
                  </td>
                  <td style={{ padding: "9px 10px", maxWidth: 180 }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500
                      }}
                      title={aspect.aspect}
                    >
                      {aspect.aspect || "--"}
                    </div>
                    {aspect.area && (
                      <div style={{ fontSize: 11, color: "#888" }}>
                        {aspect.area}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    {aspect.condition && (
                      <span style={condStyle(aspect.condition)}>
                        {aspect.condition}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "9px 10px", maxWidth: 200 }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 12
                      }}
                      title={aspect.impact}
                    >
                      {aspect.impact || "--"}
                    </div>
                    {aspect.receptors && (
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 11,
                          color: "#888"
                        }}
                      >
                        {aspect.receptors}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "9px 10px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 14
                    }}
                  >
                    {score !== null ? (
                      score
                    ) : (
                      <span style={{ color: "#ccc" }}>--</span>
                    )}
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    {sig ? (
                      sigStyleBadge(sig)
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
                      {aspect.status}
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
                    <Btn size="sm" onClick={() => onEdit(aspect)}>
                      Edit
                    </Btn>
                    {" "}
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(aspect.id)}
                    >
                      ×
                    </Btn>
                  </td>
                </tr>

                {/* Expandable detail row */}
                {isExpanded && (
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                    <td colSpan={9} style={{ padding: "1rem" }}>
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
                          {aspect.activity && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Activity
                              </p>
                              <p style={{ margin: 0, color: "#333" }}>
                                {aspect.activity}
                              </p>
                            </div>
                          )}
                          {aspect.receptors && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Receptors
                              </p>
                              <p style={{ margin: 0, color: "#333" }}>
                                {aspect.receptors}
                              </p>
                            </div>
                          )}
                          {aspect.impact && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Impact
                              </p>
                              <p style={{ margin: 0, color: "#333" }}>
                                {aspect.impact}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right column */}
                        <div>
                          {aspect.control && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Control Measure
                              </p>
                              <p style={{ margin: 0, color: "#333" }}>
                                {aspect.control}
                              </p>
                            </div>
                          )}
                          {aspect.legalRef && (
                            <div style={{ marginBottom: "1rem" }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontWeight: 600,
                                  color: "#555",
                                  fontSize: 12
                                }}
                              >
                                Legal Reference
                              </p>
                              <p style={{ margin: 0, color: "#333" }}>
                                {aspect.legalRef}
                              </p>
                            </div>
                          )}
                          {aspect.owner && (
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
                                {aspect.owner}
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

// Helper function to render significance badge
function sigStyleBadge(sig) {
  const colors = {
    SIGNIFICANT: { bg: "#ffebee", c: "#c62828" },
    WATCH: { bg: "#fff8e1", c: "#f57f17" },
    Low: { bg: "#e8f5e9", c: "#2e7d52" }
  };
  const style = colors[sig] || colors.Low;
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 4,
        fontWeight: 600,
        display: "inline-block",
        background: style.bg,
        color: style.c
      }}
    >
      {sig}
    </span>
  );
}
