// Trimmed mirror of the service pillars rendered on the Survey and Drone
// division pages. Used by the no-JS prerender (static-summary.js) and the
// Service structured data (seo.js) so crawlers see the same commercial
// scope as the interactive page. Keep the wording in sync with the
// servicePillars arrays in SurveyHomePage.jsx / DroneHomePage.jsx.

export const surveyServices = [
  {
    headline: 'Legal Boundary Demarcation & Title Lodgement Plans',
    description: 'Physical perimeter beacon monumentation, boundary recovery, and cadastral survey plans prepared under the direct supervision of SURCON-registered surveyors. Fully compliant for Governor’s Consent, C of O, and title deed registration.',
    items: [
      'Perimeter Boundary Demarcation & Reinforced Beacon Casting',
      'Minna Datum & UTM Zone 31N/32N Cadastral Coordinate Controls',
      'Statutory Lodgement-Ready Survey Plans (SURCON Supervised)',
      'Boundary Dispute Resolution & Encroachment Audits',
    ],
  },
  {
    headline: 'High-Density 3D Terrain, Contours & Elevation Baselines',
    description: 'Sub-centimeter digital elevation models, spot height grids, and 0.5m contour baselines essential for architectural master planning, drainage engineering, and eliminating expensive foundation flood risks.',
    items: [
      'High-Resolution Contour Intervals (0.5m / 1.0m intervals)',
      'Digital Terrain & Surface Modeling (DTM / DSM)',
      'Natural & Built Feature Geospatial Asset Location',
      'Earthwork Cut & Fill Volumetric Computation',
    ],
  },
  {
    headline: 'Construction Setting Out & Column Axis Alignment',
    description: 'Translating structural, architectural, and civil drawings directly to physical ground with Total Station millimeter precision, column axis control, pile cap staking, and as-built QA audits.',
    items: [
      'Building Footprint & Column Grid Alignment Staking',
      'Road Centerlines, Corridors & Invert Drainage Levels',
      'Pile Cap Position & Foundation Axis Precision Control',
      'As-Built Quality Assurance & Structural Tolerance Audits',
    ],
  },
  {
    headline: 'Master Estate Subdivision & Plot Partitioning',
    description: 'Partitioning landholdings into demarcated residential and commercial plots with approved road right-of-way setbacks (12m/9m), utility reservation corridors, and individual buyer coordinate sheets.',
    items: [
      'Master Layout Plot Demarcation & Perimeter Pillar Staking',
      'Estate Road Network Alignment & Right-of-Way Staking',
      'Utility Corridor & Drainage Reservation Planning',
      'Individual Purchaser Beacon Schedules for Contract Annexure',
    ],
  },
];

export const droneServices = [
  {
    headline: 'Cinematic Property Showcases',
    description: 'Hero exteriors, twilight architectural flyovers, and full marketing video packages designed to accelerate luxury property sales, listings, and developer presentations.',
    items: [
      '48MP RAW Stills (DNG) & HDR Aerial Photography',
      'Cinematic 4K/60fps Stabilized Video Tours (10-bit D-Log M)',
      'Twilight & Sunset Hero Architectural Exteriors',
      'Full Aerial-to-Ground Video Packages for Brokers',
    ],
  },
  {
    headline: 'Milestone Progress & Visual Audits',
    description: 'Periodic site flyovers documenting structural milestones for remote stakeholders, paired with high-resolution visual audits of roofs, facades, and hard-to-reach assets.',
    items: [
      'Recurring Monthly/Weekly Construction Milestone Flyovers',
      'Investor & Remote Stakeholder Progress Media Packages',
      'High-Resolution Roof, Gutter & Facade Visual Audits',
      'Site Boundary, Drainage & Access Corridor Aerial Documentation',
    ],
  },
  {
    headline: 'Hospitality, Tourism & Event Media',
    description: 'Dynamic aerial cinematography for resorts, hotels, tourism destinations, brand campaigns, and cultural events optimized for high-engagement social reels and broadcasts.',
    items: [
      'Hotel & Luxury Resort Promotional Flythroughs',
      'Destination, Waterfront & Tourism Marketing Reels',
      'Festival, Sporting & Corporate Event Aerial Coverage',
      'Vertical 9:16 Cutdowns for Instagram Reels, TikTok & Shorts',
    ],
  },
  {
    headline: 'Aerial Photogrammetry & Orthomosaic Basemaps',
    description: 'High-overlap aerial photogrammetry missions generating 2D orthomosaic baselines and digital surface models (DSM) for planning, agriculture, and construction site overlays.',
    items: [
      'High-Resolution 2D Orthomosaic Basemap Imagery',
      'Photogrammetric Surface Models (DSM) & Elevation Overlays',
      'Site Planning, Agricultural & Subdivision Aerial Overlays',
      'Ground Control Point (GCP) Alignment (Coordinated with Survey Division)',
    ],
  },
];

export const divisionServices = {
  '/survey': surveyServices,
  '/drone': droneServices,
};
