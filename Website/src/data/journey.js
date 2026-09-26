/**
 * Journey & Career Progression Data
 * Step 28: Personal Journey / Timeline
 *
 * Only contains verified real information from Siva Kumar's resume and portfolio.
 * Strict rules: No invented employers, job titles, awards, rankings, or fake metrics.
 */

export const JOURNEY_ITEMS = [
  {
    id: 'bsc',
    period: '2020–2023',
    title: 'B.Sc.',
    type: 'Education',
    organization: 'Nalanda Degree College, Kurnool',
    description:
      'Completed B.Sc. and built the academic foundation that later led toward application development and software engineering.',
    tags: ['Academic Foundation', 'Computer Science'],
  },
  {
    id: 'mca',
    period: '2024–2026',
    title: 'MCA',
    type: 'Education',
    organization: 'Rajiv Gandhi Memorial College of Engineering and Technology, Nandyal',
    description:
      'Completed MCA with a focus on building software applications and strengthening programming, database, and development skills.',
    tags: ['Software Applications', 'Programming', 'Databases'],
  },
  {
    id: 'hackathon',
    period: '2025',
    title: 'Hackathon Participant',
    type: 'Hackathon',
    organization: 'RGM College',
    description:
      'Participated in a hackathon as part of the practical learning and project-building experience during MCA.',
    tags: ['Rapid Prototyping', 'Collaboration'],
  },
  {
    id: 'federated-learning-6g',
    period: '2025',
    title: 'Federated Learning for 6G Networks',
    type: 'Project',
    organization: null,
    description:
      'Built a practical federated learning platform using Python, Flask, MySQL, Scikit-learn, and XGBoost. The project includes dataset validation, model selection, local training, global aggregation, prediction, and testing.',
    tags: ['Python', 'Flask', 'MySQL', 'Scikit-learn', 'XGBoost'],
    action: {
      label: 'View Project',
      to: '/work/federated-learning-6g',
    },
  },
  {
    id: 'luxury-hotel-management',
    period: '2025',
    title: 'Luxury Hotel Management System',
    type: 'Project',
    organization: null,
    description:
      'Built a full-stack hotel management system using Python, Flask, SQLite, HTML, and CSS with booking overlap protection, authentication, admin dashboard, email notifications, food ordering, and database validation/testing.',
    tags: ['Python', 'Flask', 'SQLite', 'HTML', 'CSS'],
    action: {
      label: 'View Project',
      to: '/work/luxury-hotel-management',
    },
  },
  {
    id: 'codegnan-training',
    period: '2026',
    title: 'Python Full Stack Development',
    type: 'Training',
    organization: 'Codegnan, Hyderabad',
    description:
      'Completed Python Full Stack Development training covering practical web development and backend-oriented skills.',
    tags: ['Python', 'Full Stack Development', 'Web Development', 'Backend'],
  },
  {
    id: 'current-direction',
    period: '2026 — Present',
    title: 'Building Practical Software',
    type: 'Current Direction',
    organization: null,
    description:
      'Currently focused on Python Full Stack development, backend systems, databases, APIs, and practical web applications.',
    tags: ['Backend Systems', 'Databases', 'APIs', 'Web Applications'],
  },
];
