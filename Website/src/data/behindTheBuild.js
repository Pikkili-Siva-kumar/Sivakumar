/**
 * Behind the Build — Architecture & Engineering Data
 * Step 31: Build the "Behind the Build" Feature
 *
 * Strictly grounded in verified project implementations.
 * No exaggerated claims, no invented frameworks, no fake metrics.
 */

export const BUILD_PROJECTS = {
  'federated-learning-6g': {
    id: 'federated-learning-6g',
    number: '01',
    title: 'Federated Learning for 6G Networks',
    category: 'Machine Learning • Backend • 6G',
    summary:
      'A decentralized machine learning system that enables distributed model training across simulated network nodes without centralizing raw telemetry datasets.',
    tags: ['Python', 'Flask', 'MySQL', 'Scikit-learn', 'XGBoost'],
    caseStudyRoute: '/work/federated-learning-6g',
    playgroundRoute: '/playground?project=federated-learning-6g',

    architectureSteps: [
      { id: '1', title: 'USER / DATASET', detail: 'Edge client or simulated node provides local network telemetry.' },
      { id: '2', title: 'DATASET VALIDATION', detail: 'Pre-training schema inspection, type checking, and boundary validation.' },
      { id: '3', title: 'MODEL SELECTION', detail: 'Target algorithm selected: Random Forest, MLP, or XGBoost.' },
      { id: '4', title: 'LOCAL TRAINING', detail: 'Model fits locally on edge partition; raw data remains on the device.' },
      { id: '5', title: 'MODEL UPDATE', detail: 'Parameter updates (weights/coefficients) extracted for transmission.' },
      { id: '6', title: 'GLOBAL AGGREGATION', detail: 'Coordination server aggregates parameters across participating clients.' },
      { id: '7', title: 'PREDICTION', detail: 'Updated global model evaluates test inputs and serves classification.' },
    ],

    decisions: [
      {
        number: '01',
        title: 'Dataset Validation',
        topic: 'Pre-Training Guardrails',
        description:
          'Validation happens strictly before the training workflow continues. Inspecting column counts, schema integrity, data types, and null value policies at the intake boundary guarantees that corrupted or malformed datasets do not trigger runtime failures during training or poison model updates.',
      },
      {
        number: '02',
        title: 'Model Selection',
        topic: 'Multi-Model Algorithmic Support',
        description:
          'The workflow supports multiple model choices represented in the project: Random Forest, Multilayer Perceptron (MLP), and XGBoost. This multi-architecture flexibility enables comparative evaluation of accuracy, training speed, and memory usage across different simulated edge node constraints.',
      },
      {
        number: '03',
        title: 'Global Aggregation',
        topic: 'Decentralized Parameter Coordination',
        description:
          'The project workflow coordinates locally generated model updates into a synchronized global model state. Transmitting model parameters rather than raw datasets preserves data privacy at edge nodes while still improving the centralized model baseline across iterative rounds.',
      },
      {
        number: '04',
        title: 'Testing',
        topic: 'Verification & Pipeline Integrity',
        description:
          'Testing covers dataset schema parsing, pipeline stage transitions, prediction serving flow, and classification behavior across models. Verifying edge cases—such as missing features or single-class distributions—ensures the orchestration pipeline fails gracefully with clear diagnostic messages.',
      },
    ],

    dataFlow: [
      { step: '01', label: 'Input', text: 'Client provides tabular network telemetry and traffic metrics.' },
      { step: '02', label: 'Validate', text: 'Schema inspector validates column structure, numeric bounds, and nulls.' },
      { step: '03', label: 'Select Model', text: 'Pipeline configures the target learning architecture (RF, MLP, XGBoost).' },
      { step: '04', label: 'Train', text: 'Local training iteration executes on the client-side data partition.' },
      { step: '05', label: 'Aggregate', text: 'Coordination server combines local parameters into a global baseline.' },
      { step: '06', label: 'Predict', text: 'Finalized model evaluates test instances and outputs classification result.' },
    ],

    technologies: [
      { name: 'Python', role: 'Core programming language for machine learning routines, mathematical evaluation, and pipeline scripts.' },
      { name: 'Flask', role: 'Lightweight backend framework exposing RESTful endpoints for dataset submission and workflow orchestration.' },
      { name: 'MySQL', role: 'Relational database storing user records, model configuration parameters, and experiment metadata.' },
      { name: 'Scikit-learn', role: 'Provides foundational ML algorithms (Random Forest, MLP), preprocessing pipelines, and evaluation metrics.' },
      { name: 'XGBoost', role: 'Gradient boosted decision tree library utilized for high-performance edge classification.' },
    ],
  },

  'luxury-hotel-management': {
    id: 'luxury-hotel-management',
    number: '02',
    title: 'Luxury Hotel Management System',
    category: 'Full Stack • Backend • Database',
    summary:
      'A full-stack relational booking and administrative system with robust date interval validation, double-booking prevention, and role-based staff operations.',
    tags: ['Python', 'Flask', 'SQLite', 'HTML', 'CSS'],
    caseStudyRoute: '/work/luxury-hotel-management',
    playgroundRoute: '/playground?project=luxury-hotel-management',

    architectureSteps: [
      { id: '1', title: 'USER LOGIN', detail: 'Session-based authentication verifies guest identity and authorization.' },
      { id: '2', title: 'ROOM SELECTION', detail: 'Guest reviews room types, amenities, and selects target stay dates.' },
      { id: '3', title: 'AVAILABILITY CHECK', detail: 'Server queries existing reservations to test for overlapping date intervals.' },
      { id: '4', title: 'BOOKING REQUEST', detail: 'Pending booking record created with selected room ID and guest details.' },
      { id: '5', title: 'DATABASE', detail: 'SQLite relational tables persist reservation and update schedule state.' },
      { id: '6', title: 'ADMIN REVIEW', detail: 'Hotel administrative dashboard displays pending booking for staff review.' },
      { id: '7', title: 'BOOKING APPROVAL', detail: 'Staff confirms or rejects booking; reservation status is finalized.' },
    ],

    decisions: [
      {
        number: '01',
        title: 'Overlap Protection',
        topic: 'Date Range Collision Detection',
        description:
          'Booking date ranges are checked before accepting a reservation to prevent conflicting schedules. The system applies the interval overlap condition (requested check-in < existing check-out AND requested check-out > existing check-in), ensuring rooms cannot be double-booked while still allowing same-day room turnover.',
      },
      {
        number: '02',
        title: 'Authentication',
        topic: 'Session-Based Access Control',
        description:
          'A session-based authentication layer separates public guest capabilities from administrative operations. Protected routes verify user login state and roles before permitting privileged actions such as room status modifications, price adjustments, or booking approvals.',
      },
      {
        number: '03',
        title: 'Database State',
        topic: 'Relational Integrity & Queries',
        description:
          'Booking information is stored and checked through structured relational tables in SQLite. Room availability is dynamically computed against committed booking records rather than relying on brittle ephemeral flags, guaranteeing accurate state even during concurrent booking requests.',
      },
      {
        number: '04',
        title: 'Admin Workflow',
        topic: 'Staff Review & Operational Control',
        description:
          'The admin review and approval workflow represented by the project allows staff to manage the complete lifecycle of each booking. Rather than immediately confirming reservations into unverified state, administrators inspect requests, manage room inventory, and confirm bookings through a dedicated dashboard.',
      },
    ],

    dataFlow: [
      { step: '01', label: 'User Input', text: 'Guest selects room category and specifies check-in and check-out dates.' },
      { step: '02', label: 'Validate', text: 'Controller validates date logic, ensuring check-out is strictly after check-in.' },
      { step: '03', label: 'Check Availability', text: 'SQL query verifies no overlapping active bookings exist for the selected room.' },
      { step: '04', label: 'Create Request', text: 'Controller constructs a booking entity associated with the logged-in user.' },
      { step: '05', label: 'Database', text: 'SQLite transaction commits the new booking record and preserves schedule state.' },
      { step: '06', label: 'Admin Review', text: 'Administrative dashboard displays pending reservation for staff inspection.' },
      { step: '07', label: 'Result', text: 'Admin approves booking; finalized reservation confirmation is displayed.' },
    ],

    technologies: [
      { name: 'Python', role: 'Core programming language executing backend booking algorithms, validation logic, and server operations.' },
      { name: 'Flask', role: 'Web application framework handling HTTP routing, session authentication, and view rendering.' },
      { name: 'SQLite', role: 'Embedded relational database engine storing rooms, users, reservations, and food menu data.' },
      { name: 'HTML', role: 'Semantic page structure for room listings, booking forms, user profile pages, and admin interfaces.' },
      { name: 'CSS', role: 'Custom styling defining responsive grids, cards, form inputs, status badges, and typography.' },
    ],
  },
};

export const TESTING_PRACTICES = [
  {
    number: '01',
    title: 'Input Validation',
    summary: 'Check that required inputs are valid before processing.',
    description:
      'Guarantees all incoming parameters, form entries, uploaded datasets, and route arguments satisfy strict type, boundary, and format criteria before entering core business logic. Invalid inputs are rejected at the application boundary.',
  },
  {
    number: '02',
    title: 'Edge Cases',
    summary: 'Test invalid inputs and conflicting conditions.',
    description:
      'Evaluates system behavior under abnormal conditions, such as inverted booking date intervals (check-out before check-in), same-day checkout overlap boundaries, missing dataset columns, and empty feature sets to ensure stable, predictable failure handling.',
  },
  {
    number: '03',
    title: 'Database Validation',
    summary: 'Check stored state and expected database behavior where applicable.',
    description:
      'Ensures relational schema integrity, correct foreign key associations, and consistent state commits across transactions. Verifies that room availability queries accurately reflect active reservations.',
  },
  {
    number: '04',
    title: 'Workflow Testing',
    summary: 'Test whether the system correctly moves through the expected stages.',
    description:
      'Validates end-to-end stage progression across multi-step processes—such as moving from dataset validation through local training and aggregation, or advancing a hotel booking from submission to admin approval.',
  },
  {
    number: '05',
    title: 'Regression Checks',
    summary: 'Make sure changes do not break existing functionality.',
    description:
      'Confirms that feature enhancements, bug fixes, or refactors preserve existing routes, database queries, and UI components without introducing regressions or side-effects.',
  },
];

export const WHAT_I_LEARNED = [
  {
    number: '01',
    title: 'Validation matters before downstream processing',
    description:
      'Enforcing strict validation at the entry boundary prevents unexpected runtime crashes, corrupted state, and complex debugging deep in downstream algorithms or database queries.',
  },
  {
    number: '02',
    title: 'Database state affects application behavior',
    description:
      'Application logic is only as reliable as its data foundation. Computing state dynamically from committed relational records eliminates race conditions and phantom status discrepancies.',
  },
  {
    number: '03',
    title: 'A workflow needs clear stages and boundaries',
    description:
      'Complex operations become manageable and observable when broken into discrete, sequential stages with clear preconditions, isolated responsibilities, and well-defined outputs.',
  },
  {
    number: '04',
    title: 'Testing edge cases is important for reliable applications',
    description:
      'Systems rarely break on typical happy paths. Testing boundary values, conflicting inputs, and edge scenarios is what makes software dependable under real-world usage.',
  },
  {
    number: '05',
    title: 'Building end-to-end systems requires connecting UI, backend logic, and data',
    description:
      'Engineering practical applications requires holistic thinking—aligning user interface expectations, server-side validation rules, and relational persistence into a coherent system.',
  },
];
