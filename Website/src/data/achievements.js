/**
 * Verified Achievements & Milestones Dataset
 * Step 37: Achievements Feature
 *
 * Single source of truth for verified academic milestones, certifications,
 * participation, and notable completed project milestones.
 *
 * Strict Rule: Contains only verified real records supported by resume and project files.
 * Zero invented awards, rankings, medal claims, or performance percentages.
 */

import { PROJECTS } from './projects';

export const VERIFIED_MILESTONES = [
  {
    id: 'mca-completed',
    year: '2026',
    title: 'MCA Completed',
    type: 'academic',
    organization: 'Rajiv Gandhi Memorial College of Engineering and Technology, Nandyal',
    description: 'MCA — CGPA 7.4',
    score: 'CGPA 7.4',
    period: '2024–2026',
    verified: true,
  },
  {
    id: 'codegnan-fullstack',
    year: '2026',
    title: 'Python Full Stack Development',
    type: 'certification',
    organization: 'Codegnan, Hyderabad',
    description: 'Completed Python Full Stack Development training.',
    technologies: ['Python', 'Flask', 'SQL', 'JavaScript', 'HTML', 'CSS'],
    verified: true,
  },
  {
    id: 'rgm-hackathon',
    year: '2025',
    title: 'Hackathon Participant',
    type: 'participation',
    organization: 'RGM College',
    description: 'Participated in a hackathon during MCA.',
    verified: true,
  },
  {
    id: 'fl-6g-project',
    year: '2025',
    title: 'Federated Learning for 6G Networks',
    type: 'project',
    organization: null,
    description: 'Built a practical federated learning platform using Python, Flask, MySQL, Scikit-learn, and XGBoost.',
    technologies: PROJECTS.find((p) => p.id === 'federated-learning-6g')?.technologies || [
      'Python',
      'Flask',
      'MySQL',
      'Scikit-learn',
      'XGBoost',
    ],
    route: '/work/federated-learning-6g',
    verified: true,
  },
  {
    id: 'hotel-management-project',
    year: '2025',
    title: 'Luxury Hotel Management System',
    type: 'project',
    organization: null,
    description: 'Built a full-stack hotel management system using Python, Flask, SQLite, HTML, and CSS.',
    technologies: PROJECTS.find((p) => p.id === 'luxury-hotel-management')?.technologies || [
      'Python',
      'Flask',
      'SQLite',
      'HTML',
      'CSS',
    ],
    route: '/work/luxury-hotel-management',
    verified: true,
  },
  {
    id: 'bsc-completed',
    year: '2023',
    title: 'B.Sc. Completed',
    type: 'academic',
    organization: 'Nalanda Degree College, Kurnool',
    description: 'B.Sc. — CGPA 7.15',
    score: 'CGPA 7.15',
    period: '2020–2023',
    verified: true,
  },
];

export const CREDENTIALS = [
  {
    id: 'codegnan-credential',
    title: 'Python Full Stack Development',
    organization: 'Codegnan, Hyderabad',
    year: '2026',
    type: 'certification',
    detail: 'Completed Python Full Stack Development training.',
  },
  {
    id: 'hackathon-credential',
    title: 'Hackathon Participant',
    organization: 'RGM College',
    year: '2025',
    type: 'participation',
    detail: 'Participated in a hackathon during MCA.',
  },
];

export const ACADEMIC_MILESTONES = [
  {
    id: 'academic-mca',
    degree: 'MCA',
    institution: 'Rajiv Gandhi Memorial College of Engineering and Technology, Nandyal',
    period: '2024–2026',
    score: 'CGPA 7.4',
  },
  {
    id: 'academic-bsc',
    degree: 'B.Sc.',
    institution: 'Nalanda Degree College, Kurnool',
    period: '2020–2023',
    score: 'CGPA 7.15',
  },
];

export const PROJECT_MILESTONES = [
  {
    id: 'project-fl-6g',
    name: 'Federated Learning for 6G Networks',
    year: '2025',
    description:
      'Built a practical federated learning platform for decentralized model training, client selection, and privacy preservation.',
    technologies: PROJECTS.find((p) => p.id === 'federated-learning-6g')?.technologies || [
      'Python',
      'Flask',
      'MySQL',
      'Scikit-learn',
      'XGBoost',
    ],
    route: '/work/federated-learning-6g',
  },
  {
    id: 'project-hotel-mgmt',
    name: 'Luxury Hotel Management System',
    year: '2025',
    description:
      'Built a full-stack hotel management platform handling room allocation, booking collision protection, guest accounts, and administrative control.',
    technologies: PROJECTS.find((p) => p.id === 'luxury-hotel-management')?.technologies || [
      'Python',
      'Flask',
      'SQLite',
      'HTML',
      'CSS',
    ],
    route: '/work/luxury-hotel-management',
  },
];

export const MILESTONE_MEANINGS = [
  {
    num: '01',
    title: 'Learning Through Building',
    description: 'Academic learning was reinforced through practical software projects.',
  },
  {
    num: '02',
    title: 'Hands-On Development',
    description:
      'Projects involved Python, Flask, databases, machine learning tools, and end-to-end application workflows.',
  },
  {
    num: '03',
    title: 'Continuous Progress',
    description:
      'The journey has moved from academic foundations toward practical full-stack and backend development.',
  },
];
