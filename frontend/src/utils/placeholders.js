/**
 * Local SVG placeholder generators — no external dependencies
 * All images generated client-side, zero network requests
 */

/**
 * Generate a simple geometric placeholder SVG
 * @param {number} width - width in pixels
 * @param {number} height - height in pixels
 * @param {string} bgColor - background color (hex)
 * @param {string} accentColor - accent color for shapes (hex)
 * @param {string} label - optional text label
 * @returns {string} data URI for SVG
 */
export function generatePlaceholder({ width = 400, height = 300, bgColor = '#f3f4f6', accentColor = '#f44a22', label = '' }) {
  const viewBox = `0 0 ${width} ${height}`;
  const fontSize = Math.min(width, height) * 0.06;
  const x = width / 2;
  const y = height / 2;
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="10,10" opacity="0.3"/>
      <circle cx="${x}" cy="${y}" r="${Math.min(width, height) * 0.12}" fill="${accentColor}" opacity="0.15"/>
      <circle cx="${x}" cy="${y}" r="${Math.min(width, height) * 0.08}" fill="${accentColor}" opacity="0.3"/>
      <circle cx="${x}" cy="${y}" r="${Math.min(width, height) * 0.04}" fill="${accentColor}"/>
      ${label ? `<text x="${x}" y="${y + fontSize * 0.35}" font-family="system-ui, sans-serif" font-size="${fontSize}" fill="${accentColor}" text-anchor="middle" dominant-baseline="middle" font-weight="600">${label}</text>` : ''}
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Drone-themed placeholder
 */
export function dronePlaceholder({ width = 800, height = 450, label = 'Drone Project' } = {}) {
  return generatePlaceholder({ width, height, bgColor: '#0f0f0f', accentColor: '#f44a22', label });
}

/**
 * Survey/Mapping-themed placeholder
 */
export function surveyPlaceholder({ width = 800, height = 600, label = 'Survey Project' } = {}) {
  return generatePlaceholder({ width, height, bgColor: '#0a0a0a', accentColor: '#00d4aa', label });
}

/**
 * Generic service/project placeholder
 */
export function projectPlaceholder({ width = 800, height = 600, label = 'Project' } = {}) {
  return generatePlaceholder({ width, height, bgColor: '#111827', accentColor: '#3b82f6', label });
}

/**
 * Small thumbnail placeholder
 */
export function thumbPlaceholder({ width = 120, height = 120, label = '' } = {}) {
  return generatePlaceholder({ width, height, bgColor: '#1f2937', accentColor: '#6b7280', label });
}

/**
 * Equipment/item placeholder
 */
export function equipmentPlaceholder({ width = 200, height = 200, label = 'Equipment' } = {}) {
  return generatePlaceholder({ width, height, bgColor: '#111827', accentColor: '#8b5cf6', label });
}

/**
 * Hero image placeholder for landing sections
 */
export function heroPlaceholder({ width = 1200, height = 800, label = 'BuildWithLami' } = {}) {
  return generatePlaceholder({ width, height, bgColor: '#030712', accentColor: '#f44a22', label });
}