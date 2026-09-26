/**
 * Testimonials Data Source
 * Siva Kumar - Personal Brand & Business Website
 * Step 35: Testimonials Feature
 *
 * IMPORTANT DATA INTEGRITY RULE:
 * This dataset is strictly empty. No invented clients, names, companies, ratings, or fake reviews.
 * Real experiences will be added only as they occur.
 *
 * Schema for future entries:
 * {
 *   id: string,                       // Unique ID, e.g. "t-01"
 *   quote: string,                    // Real feedback text
 *   name: string,                     // Full name of author
 *   role?: string,                    // Professional role / title
 *   organization?: string,            // Company, institution, or project team
 *   relationship?: string,            // e.g. "Project Client", "Collaborator", "Mentor", "Peer"
 *   avatarUrl?: string,               // Optional avatar image URL
 *   project?: string,                 // Related project name
 *   date?: string,                    // Date or month/year
 *   featured?: boolean,               // Highlights prominent testimonial
 *   status: 'published' | 'draft',    // Publication state
 * }
 */

export const TESTIMONIALS = [];
