/**
 * HistoryTab.jsx
 *
 * Displays version history, allows viewing changes and rolling back to previous versions.
 * Supports ISO 14001 compliance tracking with detailed change logs.
 */

import React, { useState } from 'react';
import { getSnapshotHistory } from '../utils/versioningSystem';

export const HistoryTab = ({ versioningSystem, onRollback }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const history = getSnapshotHistory(versioningSystem);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTypeColor = (type) => {
    return type === 'auto'
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : 'bg-green-100 text-green-800 border-green-300';
  };

  const getChangeTypeColor = (changeType) => {
    switch (changeType) {
      case 'added':
        return 'text-green-700 bg-green-50';
      case 'removed':
        return 'text-red-700 bg-red-50';
      case 'modified':
        return 'text-orange-700 bg-orange-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'added':
        return '✚';
      case 'removed':
        return '✕';
      case 'modified':
        return '◆';
      default:
        return '•';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Version History</h2>
        <div className="text-sm text-gray-500">
          {history.length} version{history.length !== 1 ? 's' : ''}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No version history yet. Changes will be tracked here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((snapshot, index) => (
            <div key={snapshot.id} className="border rounded-lg overflow-hidden">
              {/* Header - always visible */}
              <div
                className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition flex justify-between items-start"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-700">
                      v{history.length - index}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 border rounded ${getTypeColor(snapshot.type)}`}>
                      {snapshot.type === 'auto' ? '🤖 AUTO' : '👤 MANUAL'}
                    </span>
                    {snapshot.isCurrentVersion && (
                      <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded">
                        ★ CURRENT
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {formatDate(snapshot.timestamp)}
                  </div>
                  {snapshot.description && (
                    <div className="text-sm text-gray-700 mt-1 font-medium">
                      {snapshot.description}
                    </div>
                  )}
                </div>
                <div className="text-gray-400 text-xl ml-4">
                  {expandedIndex === index ? '▼' : '▶'}
                </div>
              </div>

              {/* Expanded details */}
              {expandedIndex === index && (
                <div className="bg-white border-t p-4 space-y-4">
                  {/* Changes summary */}
                  {snapshot.changes && snapshot.changes.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Changes ({snapshot.changes.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {snapshot.changes.map((change, changeIndex) => (
                          <div
                            key={changeIndex}
                            className={`p-3 rounded border-l-4 ${getChangeTypeColor(change.type)}`}
                            style={{
                              borderLeftColor: change.type === 'added' ? '#10b981' :
                                             change.type === 'removed' ? '#ef4444' : '#f97316'
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-lg">{getChangeIcon(change.type)}</span>
                              <div className="flex-1">
                                <div className="font-medium">{change.description}</div>
                                {change.fields && (
                                  <div className="text-xs mt-1 space-y-1">
                                    {change.fields.map((field, fieldIndex) => (
                                      <div key={fieldIndex} className="font-mono text-gray-600">
                                        • {field}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No changes detected in this version.</div>
                  )}

                  {/* Rollback button */}
                  {!snapshot.isCurrentVersion && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => {
                          if (confirm(`Restore to version v${history.length - index}? This will create a new snapshot with the restored state.`)) {
                            onRollback(index);
                          }
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition"
                      >
                        ↶ Restore to This Version
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ISO 14001 Compliance Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-900">
          <strong>ISO 14001:2015 Compliance:</strong> All version changes are automatically tracked and timestamped to maintain compliance with clause 6.1.2 (Environmental aspects register) and clause 8.5.3 (Control of documented information). Version history cannot be deleted and serves as an audit trail.
        </p>
      </div>
    </div>
  );
};

export default HistoryTab;
