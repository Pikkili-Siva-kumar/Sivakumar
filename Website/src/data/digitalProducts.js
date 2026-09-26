/**
 * Digital Products Data Layer
 * Step 32: Build the Digital Products Feature
 *
 * Seeded with an empty array.
 * Strictly adheres to rule: No fake products, no fake downloads, no fake prices.
 *
 * Future products support:
 * - id: unique string
 * - title: product name
 * - slug: URL-friendly identifier
 * - shortDescription: concise summary
 * - description: complete overview
 * - category: 'Developer Resource' | 'Project Resource' | 'Learning Resource'
 * - format: 'PDF Guide' | 'Starter Kit' | 'Checklist' | 'Code Bundle'
 * - technologies: array of associated tools
 * - status: 'free' | 'paid'
 * - price: price object or string (e.g. 'Free')
 * - downloadUrl: optional direct file download link
 * - externalUrl: optional external link (e.g. GitHub repo)
 * - featured: boolean
 */

export const DIGITAL_PRODUCTS = [];

export const PRODUCT_CATEGORIES = [
  {
    id: 'developer-resources',
    title: 'Developer Resources',
    description: 'Practical references, checklists, and reusable learning material.',
  },
  {
    id: 'project-resources',
    title: 'Project Resources',
    description: 'Templates and supporting material created from real software projects.',
  },
  {
    id: 'learning-resources',
    title: 'Learning Resources',
    description: 'Developer-focused notes and structured resources that make practical learning easier.',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Explore',
    description: 'Find a resource relevant to your work or learning.',
  },
  {
    number: '02',
    title: 'Use',
    description: 'Apply it to a real project, workflow, or learning task.',
  },
  {
    number: '03',
    title: 'Build',
    description: 'Turn the knowledge into something practical.',
  },
];
