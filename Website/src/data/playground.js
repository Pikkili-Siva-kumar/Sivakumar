/**
 * Project Playground Demonstration Data
 * Step 30: Live Project Playground
 *
 * Deterministic browser demonstration data inspired by Siva Kumar's verified projects.
 * Strict rules: No fake production claims, no fake customer datasets, no fake accuracy claims.
 */

export const PLAYGROUND_PROJECTS = [
  {
    id: 'federated-learning-6g',
    title: 'Federated Learning for 6G Networks',
    tags: ['Python', 'Flask', 'Machine Learning', '6G'],
    summary:
      'Explore the multi-stage machine learning workflow: dataset validation, local model training, parameter extraction, and global coordination.',
    caseStudyRoute: '/work/federated-learning-6g',
  },
  {
    id: 'luxury-hotel-management',
    title: 'Luxury Hotel Management System',
    tags: ['Python', 'Flask', 'Database', 'Booking'],
    summary:
      'Test the date range validation and interval overlap-protection algorithms that ensure rooms cannot be double-booked.',
    caseStudyRoute: '/work/luxury-hotel-management',
  },
];

export const HOTEL_DEMO_ROOMS = [
  {
    id: '101',
    name: 'Room 101',
    type: 'Deluxe Suite',
    existingBooking: {
      checkIn: '2026-10-05',
      checkOut: '2026-10-07',
      label: 'Oct 05, 2026 → Oct 07, 2026',
    },
  },
  {
    id: '102',
    name: 'Room 102',
    type: 'Executive Room',
    existingBooking: {
      checkIn: '2026-10-10',
      checkOut: '2026-10-12',
      label: 'Oct 10, 2026 → Oct 12, 2026',
    },
  },
  {
    id: '103',
    name: 'Room 103',
    type: 'Standard Studio',
    existingBooking: null,
  },
];

export const FL_DEMO_DATASETS = [
  {
    id: 'valid',
    label: 'Valid Dataset',
    description: 'Structured telemetry sample with verified schema and numeric attributes.',
    isValid: true,
  },
  {
    id: 'invalid',
    label: 'Invalid Dataset',
    description: 'Corrupted payload with missing required feature columns and unparseable values.',
    isValid: false,
  },
];

export const FL_DEMO_MODELS = [
  { id: 'Random Forest', name: 'Random Forest' },
  { id: 'MLP', name: 'MLP' },
  { id: 'XGBoost', name: 'XGBoost' },
];

export const FL_PIPELINE_STAGES = [
  { key: 'validation', label: 'Dataset Validation' },
  { key: 'local_training', label: 'Local Training' },
  { key: 'model_updates', label: 'Model Updates' },
  { key: 'aggregation', label: 'Global Aggregation' },
  { key: 'prediction', label: 'Prediction Ready' },
];

export const ENGINEERING_NOTES = [
  {
    number: '01',
    title: 'Validation First',
    description: 'Inputs are validated before the workflow continues.',
  },
  {
    number: '02',
    title: 'State Changes Matter',
    description: 'Different inputs produce different outcomes.',
  },
  {
    number: '03',
    title: 'Systems Are More Than UI',
    description: 'The interaction represents the underlying logic, not just visual presentation.',
  },
];
