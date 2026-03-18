/**
 * Environmental Domain-Based Color System
 *
 * Replaces category-based colors with environmental domain colors
 * Each domain has emoji, name, hex color, background, border, and text colors
 */

export const DOMAIN_COLORS = {
  water: {
    emoji: "💧",
    name: "Water",
    hex: "#00897B",
    bg: "#E0F2F1",
    border: "#4DB6AC",
    text: "#00695C"
  },
  air: {
    emoji: "💨",
    name: "Air",
    hex: "#616161",
    bg: "#F5F5F5",
    border: "#9E9E9E",
    text: "#424242"
  },
  biodiversity: {
    emoji: "🌿",
    name: "Biodiversity",
    hex: "#2E7D32",
    bg: "#E8F5E9",
    border: "#81C784",
    text: "#1B5E20"
  },
  waste: {
    emoji: "♻️",
    name: "Waste",
    hex: "#5D4037",
    bg: "#EFEBE9",
    border: "#A1887F",
    text: "#3E2723"
  },
  chemicals: {
    emoji: "⚗️",
    name: "Chemicals",
    hex: "#6A1B9A",
    bg: "#F3E5F5",
    border: "#CE93D8",
    text: "#4A148C"
  },
  energy: {
    emoji: "⚡",
    name: "Energy/Climate",
    hex: "#F57C00",
    bg: "#FFF3E0",
    border: "#FFB74D",
    text: "#E65100"
  },
  soil: {
    emoji: "🏗️",
    name: "Soil/Land",
    hex: "#8D6E63",
    bg: "#EFEBE9",
    border: "#A1887F",
    text: "#3E2723"
  },
  regulatory: {
    emoji: "⚖️",
    name: "Regulatory Flag",
    hex: "#C62828",
    bg: "#FFEBEE",
    border: "#EF5350",
    text: "#B71C1C"
  },
  stakeholder: {
    emoji: "👥",
    name: "Stakeholder",
    hex: "#00838F",
    bg: "#E0F2F1",
    border: "#4DB6AC",
    text: "#004D40"
  }
};

/**
 * Get color object for a specific domain
 * @param {string} domainKey - The domain key (e.g., 'water', 'air')
 * @returns {object} Color object with emoji, name, hex, bg, border, text
 */
export function getColorByDomain(domainKey) {
  return DOMAIN_COLORS[domainKey] || DOMAIN_COLORS.air;
}

/**
 * Get all available domain keys
 * @returns {string[]} Array of domain keys
 */
export function getAllDomainKeys() {
  return Object.keys(DOMAIN_COLORS);
}

/**
 * Get color hex value by domain
 * @param {string} domainKey - The domain key
 * @returns {string} Hex color value
 */
export function getColorHex(domainKey) {
  return getColorByDomain(domainKey).hex;
}

/**
 * Get background color by domain
 * @param {string} domainKey - The domain key
 * @returns {string} Background color hex value
 */
export function getBackgroundColor(domainKey) {
  return getColorByDomain(domainKey).bg;
}

/**
 * Get border color by domain
 * @param {string} domainKey - The domain key
 * @returns {string} Border color hex value
 */
export function getBorderColor(domainKey) {
  return getColorByDomain(domainKey).border;
}

/**
 * Get text color by domain
 * @param {string} domainKey - The domain key
 * @returns {string} Text color hex value
 */
export function getTextColor(domainKey) {
  return getColorByDomain(domainKey).text;
}

/**
 * Get emoji for a domain
 * @param {string} domainKey - The domain key
 * @returns {string} Emoji character
 */
export function getEmojiForDomain(domainKey) {
  return getColorByDomain(domainKey).emoji;
}
