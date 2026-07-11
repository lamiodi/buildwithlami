// ── Division service data for Survey & Drone hub pages ──
// Single source of truth — imported by SurveyHomePage and DroneHomePage.

export const SURVEY_SERVICES = [
  {
    id: 'topographic',
    title: 'Topographic Surveys',
    description: 'Detailed terrain mapping with sub-centimetre accuracy using RTK GPS and total stations.',
    icon: '📐',
  },
  {
    id: 'cadastral',
    title: 'Cadastral Surveys',
    description: 'Land boundary demarcation and subdivision surveys for title registration and documentation.',
    icon: '🗺️',
  },
  {
    id: 'engineering',
    title: 'Engineering Surveys',
    description: 'Pre-construction layout, as-built surveys, and monitoring for civil engineering projects.',
    icon: '🏗️',
  },
  {
    id: 'hydrographic',
    title: 'Hydrographic Surveys',
    description: 'Bathymetric mapping, river cross-sections, and seabed profiling for marine projects.',
    icon: '🌊',
  },
  {
    id: 'geodetic',
    title: 'Geodetic Control Surveys',
    description: 'Establishment of high-precision control networks for large-scale infrastructure projects.',
    icon: '🛰️',
  },
  {
    id: 'gis-mapping',
    title: 'GIS & Digital Mapping',
    description: 'Spatial data collection, analysis, and map production using ArcGIS and QGIS platforms.',
    icon: '🗾',
  },
  {
    id: 'cad-drafting',
    title: 'CAD Drafting & Processing',
    description: 'AutoCAD and Civil 3D processing of survey data into construction-ready drawings.',
    icon: '📏',
  },
  {
    id: 'quantity',
    title: 'Quantity Surveys',
    description: 'Volumetric calculations, earthwork estimation, and cut-fill analysis for construction projects.',
    icon: '📊',
  },
  {
    id: 'setting-out',
    title: 'Setting Out & Stakeout',
    description: 'Precise transfer of design points to the ground for building, road, and pipeline construction.',
    icon: '📍',
  },
];

export const DRONE_SERVICES = [
  {
    id: 'aerial-survey',
    title: 'Aerial Surveying & Mapping',
    description: 'High-resolution orthomosaic maps and DEMs from drone-captured imagery using photogrammetry.',
    icon: '🛩️',
  },
  {
    id: 'aerial-photography',
    title: 'Aerial Photography & Video',
    description: 'Cinematic 4K aerial footage and high-resolution stills for real estate, events, and marketing.',
    icon: '📸',
  },
  {
    id: 'inspection',
    title: 'Infrastructure Inspection',
    description: 'Close-range visual and thermal inspection of buildings, towers, bridges, and pipelines.',
    icon: '🔍',
  },
  {
    id: 'lidar',
    title: 'LiDAR Scanning',
    description: 'Airborne LiDAR point cloud capture for vegetation analysis, terrain modelling, and corridor mapping.',
    icon: '📡',
  },
  {
    id: 'construction',
    title: 'Construction Monitoring',
    description: 'Regular progress documentation, volumetric analysis, and site comparison over time.',
    icon: '🏢',
  },
  {
    id: 'agriculture',
    title: 'Precision Agriculture',
    description: 'NDVI crop health mapping, spray planning, and yield estimation using multispectral sensors.',
    icon: '🌾',
  },
  {
    id: 'environmental',
    title: 'Environmental Monitoring',
    description: 'Erosion tracking, flood modelling, and environmental impact assessment from aerial data.',
    icon: '🌿',
  },
  {
    id: 'security',
    title: 'Security & Surveillance',
    description: 'Perimeter monitoring, crowd management, and real-time situational awareness for events and facilities.',
    icon: '🛡️',
  },
  {
    id: '3d-modelling',
    title: '3D Modelling & Visualisation',
    description: 'Photorealistic 3D models of structures and terrain for planning, analysis, and virtual tours.',
    icon: '🏛️',
  },
];

export const SURVEY_PROJECTS = [
  {
    id: 1,
    title: 'Lekki Free Trade Zone — Boundary Survey',
    location: 'Lekki, Lagos',
    type: 'Cadastral',
    area: '1,200 Ha',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
    description: 'Full cadastral survey and boundary demarcation for the Lekki FTZ expansion, including control network establishment.',
  },
  {
    id: 2,
    title: 'Dangote Refinery — Topographic Survey',
    location: 'Ibeju-Lekki, Lagos',
    type: 'Topographic',
    area: '850 Ha',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2076&auto=format&fit=crop',
    description: 'Large-scale topographic survey for site grading and drainage design of the industrial complex.',
  },
  {
    id: 3,
    title: 'Eko Atlantic — Engineering Survey',
    location: 'Victoria Island, Lagos',
    type: 'Engineering',
    area: '10 km²',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070&auto=format&fit=crop',
    description: 'Precision engineering survey for reclamation monitoring and infrastructure alignment on the Eko Atlantic project.',
  },
  {
    id: 4,
    title: 'Abuja FCT — GIS Mapping',
    location: 'Abuja, FCT',
    type: 'GIS Mapping',
    area: '2,500 Ha',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop',
    description: 'Comprehensive GIS database creation for urban planning and land-use management across the FCT.',
  },
];

export const DRONE_PROJECTS = [
  {
    id: 1,
    title: 'Lagos Lagoon — Aerial Mapping',
    location: 'Lagos',
    type: 'Aerial Survey',
    area: '3,200 Ha',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop',
    description: 'Large-scale orthomosaic and DEM generation for shoreline monitoring and coastal erosion analysis.',
  },
  {
    id: 2,
    title: 'Eko Energy Estate — Construction Monitor',
    location: 'Ibeju-Lekki, Lagos',
    type: 'Construction',
    area: '450 Ha',
    image: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?q=80&w=2069&auto=format&fit=crop',
    description: 'Monthly drone flights for progress tracking, volume calculations, and stakeholder reporting.',
  },
  {
    id: 3,
    title: 'Trans-Niger Pipeline — Inspection',
    location: 'Rivers State',
    type: 'Inspection',
    area: '120 km',
    image: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?q=80&w=2070&auto=format&fit=crop',
    description: 'Thermal and visual inspection of pipeline right-of-way for leak detection and encroachment monitoring.',
  },
  {
    id: 4,
    title: 'Ogun State — Agricultural Mapping',
    location: 'Ogun State',
    type: 'Agriculture',
    area: '5,000 Ha',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop',
    description: 'Multispectral NDVI mapping for crop health assessment and precision agriculture planning.',
  },
];

export const SURVEY_EQUIPMENT = [
  { name: 'Leica TS16 Total Station', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop' },
  { name: 'Trimble R12i GNSS Receiver', image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=400&auto=format&fit=crop' },
  { name: 'Leica GS18 T RTK Rover', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=400&auto=format&fit=crop' },
  { name: 'Sokkia CX-105 Total Station', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop' },
];

export const DRONE_EQUIPMENT = [
  { name: 'DJI Matrice 350 RTK', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=400&auto=format&fit=crop' },
  { name: 'DJI Phantom 4 RTK', image: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?q=80&w=400&auto=format&fit=crop' },
  { name: 'DJI Zenmuse L2 LiDAR', image: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?q=80&w=400&auto=format&fit=crop' },
  { name: 'DJI Mavic 3 Enterprise', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400&auto=format&fit=crop' },
];

export const SURVEY_FAQ = [
  {
    q: 'How long does a typical land survey take?',
    a: 'A standard cadastral survey takes 3–5 working days for field work, plus 5–7 days for processing and plan preparation. Larger or more complex projects may take longer.',
  },
  {
    q: 'What documents do I need to commission a survey?',
    a: "You'll typically need a copy of the survey plan or deed of assignment, a letter of allocation (if applicable), and site access clearance. Our team will guide you through the requirements.",
  },
  {
    q: 'Do you handle SURCON certification?',
    a: 'Yes. All our survey plans are signed and sealed by a registered Surveyor licensed with the Surveyors Council of Nigeria (SURCON).',
  },
  {
    q: 'Can you work outside Lagos?',
    a: 'Absolutely. We operate nationwide across Nigeria and have completed projects in over 15 states including Abuja, Rivers, Ogun, and Oyo.',
  },
  {
    q: 'What accuracy can I expect?',
    a: 'Our RTK GPS surveys achieve ±10mm horizontal and ±15mm vertical accuracy. Total station surveys achieve ±2mm + 2ppm or better.',
  },
  {
    q: 'Do you provide digital deliverables?',
    a: 'Yes. We deliver AutoCAD DWG/DXF files, georeferenced PDFs, KML/KMZ for Google Earth, and GIS-ready shapefiles as standard.',
  },
];

export const DRONE_FAQ = [
  {
    q: 'Do you have permission to fly drones commercially?',
    a: 'Yes. We are fully licensed by the Nigerian Civil Aviation Authority (NCAA) for commercial drone operations and carry full liability insurance.',
  },
  {
    q: "What's the maximum area you can cover in one flight?",
    a: 'A single battery flight covers approximately 80–120 hectares depending on altitude and overlap settings. Multi-battery operations can cover thousands of hectares per day.',
  },
  {
    q: 'Can you fly in restricted airspace?',
    a: 'We can obtain temporary airspace clearance from NCAA and NAMA for operations near airports or restricted zones. This typically takes 5–10 working days.',
  },
  {
    q: 'What deliverables do I get from a drone survey?',
    a: 'Standard deliverables include orthomosaic maps, digital elevation models (DEM/DSM), contour maps, 3D point clouds, and volumetric calculations.',
  },
  {
    q: 'How accurate are drone surveys?',
    a: 'With RTK-enabled drones and ground control points, we achieve ±2cm horizontal and ±3cm vertical accuracy — comparable to traditional survey methods.',
  },
  {
    q: 'Can you provide raw footage as well?',
    a: 'Yes. We deliver both processed outputs (maps, models) and raw imagery/video in full resolution for your records.',
  },
];

export const SURVEY_TESTIMONIALS = [
  {
    name: 'Engr. Adebayo Olatunji',
    role: 'Managing Director, Prestige Estates',
    quote: 'Their topographic survey saved us weeks on the Lekki project. The accuracy and turnaround were exceptional.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Surv. Chinedu Okwuosa',
    role: 'Chief Surveyor, FCT Development Authority',
    quote: "Professional team with modern equipment. Their GIS deliverables were the best we've received from any contractor.",
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Mrs. Folake Adewale',
    role: 'Property Developer, Adewale Holdings',
    quote: 'They handled our boundary dispute with precision and professionalism. The SURCON-certified plan settled everything.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
];

export const DRONE_TESTIMONIALS = [
  {
    name: 'Engr. Tunde Bakare',
    role: 'Project Manager, Julius Berger',
    quote: 'Monthly drone monitoring gave us real-time visibility into construction progress. The volumetric reports were invaluable.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Dr. Amina Yusuf',
    role: 'Environmental Scientist, NESREA',
    quote: 'The multispectral analysis and erosion mapping exceeded our expectations. True professionals with cutting-edge technology.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Chief Emeka Obiora',
    role: 'CEO, Obiora Farms Limited',
    quote: 'NDVI mapping transformed how we manage our 5,000-hectare operation. We now spray precisely where needed — 40% cost reduction.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
  },
];

export const DRONE_INDUSTRIES = [
  { name: 'Construction', icon: '🏗️' },
  { name: 'Oil & Gas', icon: '⛽' },
  { name: 'Agriculture', icon: '🌾' },
  { name: 'Real Estate', icon: '🏠' },
  { name: 'Mining', icon: '⛏️' },
  { name: 'Environmental', icon: '🌿' },
  { name: 'Telecommunications', icon: '📡' },
  { name: 'Government', icon: '🏛️' },
];
