/**
 * versioningSystem.js
 *
 * Manages project versioning with snapshots, auto-saves, and rollback.
 * Implements ISO 14001 change tracking for compliance.
 */

/**
 * Create a snapshot of current state
 * @param {Object} state - Current app state (aspects, opportunities, contracts)
 * @param {String} type - 'auto' or 'manual'
 * @param {String} description - User-provided description (optional)
 * @returns {Object} Snapshot object
 */
export const createSnapshot = (state, type = 'manual', description = '') => {
  return {
    id: `v${Date.now()}`,
    timestamp: new Date().toISOString(),
    type, // 'auto' or 'manual'
    description,
    state: JSON.parse(JSON.stringify(state)), // Deep copy
    changes: [] // Will be populated on compare
  };
};

/**
 * Compare two snapshots to identify changes
 * @param {Object} oldSnapshot - Previous snapshot
 * @param {Object} newSnapshot - Current snapshot
 * @returns {Array} Array of change objects
 */
export const compareSnapshots = (oldSnapshot, newSnapshot) => {
  const changes = [];
  const oldState = oldSnapshot.state;
  const newState = newSnapshot.state;

  // Track aspect changes
  const oldAspectIds = new Set(oldState.aspects?.map(a => a.id) || []);
  const newAspectIds = new Set(newState.aspects?.map(a => a.id) || []);

  // Added aspects
  for (const id of newAspectIds) {
    if (!oldAspectIds.has(id)) {
      const aspect = newState.aspects.find(a => a.id === id);
      changes.push({
        type: 'added',
        category: 'aspect',
        id,
        description: `Added aspect: ${aspect.aspect}`,
        timestamp: newSnapshot.timestamp
      });
    }
  }

  // Removed aspects
  for (const id of oldAspectIds) {
    if (!newAspectIds.has(id)) {
      const aspect = oldState.aspects.find(a => a.id === id);
      changes.push({
        type: 'removed',
        category: 'aspect',
        id,
        description: `Removed aspect: ${aspect.aspect}`,
        timestamp: newSnapshot.timestamp
      });
    }
  }

  // Modified aspects
  for (const id of oldAspectIds) {
    if (newAspectIds.has(id)) {
      const oldAspect = oldState.aspects.find(a => a.id === id);
      const newAspect = newState.aspects.find(a => a.id === id);

      if (JSON.stringify(oldAspect) !== JSON.stringify(newAspect)) {
        const modifiedFields = [];
        for (const key in oldAspect) {
          if (oldAspect[key] !== newAspect[key]) {
            modifiedFields.push(`${key}: "${oldAspect[key]}" → "${newAspect[key]}"`);
          }
        }

        changes.push({
          type: 'modified',
          category: 'aspect',
          id,
          description: `Modified aspect: ${newAspect.aspect}`,
          fields: modifiedFields,
          timestamp: newSnapshot.timestamp
        });
      }
    }
  }

  // Track opportunity changes (same pattern)
  const oldOppIds = new Set(oldState.opportunities?.map(o => o.id) || []);
  const newOppIds = new Set(newState.opportunities?.map(o => o.id) || []);

  for (const id of newOppIds) {
    if (!oldOppIds.has(id)) {
      const opp = newState.opportunities.find(o => o.id === id);
      changes.push({
        type: 'added',
        category: 'opportunity',
        id,
        description: `Added opportunity: ${opp.description}`,
        timestamp: newSnapshot.timestamp
      });
    }
  }

  for (const id of oldOppIds) {
    if (!newOppIds.has(id)) {
      const opp = oldState.opportunities.find(o => o.id === id);
      changes.push({
        type: 'removed',
        category: 'opportunity',
        id,
        description: `Removed opportunity: ${opp.description}`,
        timestamp: newSnapshot.timestamp
      });
    }
  }

  for (const id of oldOppIds) {
    if (newOppIds.has(id)) {
      const oldOpp = oldState.opportunities.find(o => o.id === id);
      const newOpp = newState.opportunities.find(o => o.id === id);

      if (JSON.stringify(oldOpp) !== JSON.stringify(newOpp)) {
        const modifiedFields = [];
        for (const key in oldOpp) {
          if (oldOpp[key] !== newOpp[key]) {
            modifiedFields.push(`${key}: "${oldOpp[key]}" → "${newOpp[key]}"`);
          }
        }

        changes.push({
          type: 'modified',
          category: 'opportunity',
          id,
          description: `Modified opportunity: ${newOpp.description}`,
          fields: modifiedFields,
          timestamp: newSnapshot.timestamp
        });
      }
    }
  }

  return changes;
};

/**
 * Initialize versioning system for a project
 * @param {Object} initialState - Project state to snapshot
 * @returns {Object} Versioning system object
 */
export const initializeVersioning = (initialState) => {
  const initialSnapshot = createSnapshot(
    initialState,
    'manual',
    'Project created'
  );

  return {
    snapshots: [initialSnapshot],
    currentIndex: 0,
    lastAutoSave: new Date().toISOString()
  };
};

/**
 * Add a new snapshot
 * @param {Object} versioningSystem - Current versioning object
 * @param {Object} newState - New state to snapshot
 * @param {String} type - 'auto' or 'manual'
 * @param {String} description - Change description
 * @returns {Object} Updated versioning object
 */
export const addSnapshot = (versioningSystem, newState, type = 'manual', description = '') => {
  const currentSnapshot = versioningSystem.snapshots[versioningSystem.currentIndex];
  const newSnapshot = createSnapshot(newState, type, description);

  // Compare with previous to populate changes
  newSnapshot.changes = compareSnapshots(currentSnapshot, newSnapshot);

  // If we're not at the latest snapshot, remove all future snapshots
  // (to maintain linear history when making changes after rollback)
  const snapshots = versioningSystem.snapshots.slice(0, versioningSystem.currentIndex + 1);

  return {
    snapshots: [...snapshots, newSnapshot],
    currentIndex: snapshots.length,
    lastAutoSave: type === 'auto' ? new Date().toISOString() : versioningSystem.lastAutoSave
  };
};

/**
 * Rollback to a specific snapshot
 * @param {Object} versioningSystem - Current versioning object
 * @param {Number} snapshotIndex - Index of snapshot to rollback to
 * @returns {Object} Updated versioning object
 */
export const rollbackToSnapshot = (versioningSystem, snapshotIndex) => {
  if (snapshotIndex < 0 || snapshotIndex >= versioningSystem.snapshots.length) {
    throw new Error('Invalid snapshot index');
  }

  return {
    ...versioningSystem,
    currentIndex: snapshotIndex
  };
};

/**
 * Get the current state from versioning system
 * @param {Object} versioningSystem - Versioning object
 * @returns {Object} Current state
 */
export const getCurrentState = (versioningSystem) => {
  return versioningSystem.snapshots[versioningSystem.currentIndex]?.state || null;
};

/**
 * Get snapshot history
 * @param {Object} versioningSystem - Versioning object
 * @returns {Array} Array of snapshot summaries
 */
export const getSnapshotHistory = (versioningSystem) => {
  return versioningSystem.snapshots.map((snapshot, index) => ({
    index,
    id: snapshot.id,
    timestamp: snapshot.timestamp,
    type: snapshot.type,
    description: snapshot.description,
    changes: snapshot.changes,
    isCurrentVersion: index === versioningSystem.currentIndex
  }));
};

/**
 * Get storage key for a project
 * @param {String} projectId - Project identifier
 * @returns {String} localStorage key
 */
export const getStorageKey = (projectId) => {
  return `env-toolkit-project-${projectId}`;
};

/**
 * Save versioning system to localStorage
 * @param {String} projectId - Project identifier
 * @param {Object} versioningSystem - Versioning object
 */
export const saveVersioningToStorage = (projectId, versioningSystem) => {
  try {
    const key = getStorageKey(projectId);
    localStorage.setItem(key, JSON.stringify(versioningSystem));
  } catch (error) {
    console.error('Failed to save versioning to storage:', error);
  }
};

/**
 * Load versioning system from localStorage
 * @param {String} projectId - Project identifier
 * @returns {Object|null} Versioning object or null if not found
 */
export const loadVersioningFromStorage = (projectId) => {
  try {
    const key = getStorageKey(projectId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load versioning from storage:', error);
    return null;
  }
};
