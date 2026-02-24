// ── DATA TYPES ────────────────────────────────────────────────────────────────

export interface TechBadge {
    label: string;
    color?: string; // background hex, e.g. '#3178c6'
}

export interface ProjectData {
    id: string;
    title: string;
    description: string;
    tech: TechBadge[];
    github?: string;
    demo?: string;
    image?: string; // path relative to /public/assets/screenshots/
}

export interface ContactData {
    name: string;
    email?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    resumeUrl?: string;
    bio: string;
}

// ── FILLER CONTENT (replace with real data) ───────────────────────────────────

export const PROJECTS: ProjectData[] = [
    {
        id: 'pokemon-portfolio',
        title: 'Pokemon Portfolio',
        description:
            'This very site! A personal portfolio built as a Pokemon Fire Red-style browser RPG. ' +
            'Walk around, talk to NPCs, and explore buildings to learn about the developer. ' +
            'Fully playable in the browser with no installs required.',
        tech: [
            { label: 'Phaser 3',    color: '#e74c3c' },
            { label: 'React',       color: '#61dafb', },
            { label: 'TypeScript',  color: '#3178c6' },
            { label: 'Vite',        color: '#646cff' },
        ],
        github: 'https://github.com/noahlin34/pokemon-portfolio',
        demo: '#', // replace with live URL
    },
    {
        id: 'project-2',
        title: 'Project Two — TODO',
        description:
            'Replace this with your second project description. Explain the problem it solves, ' +
            'your role, and any interesting technical challenges you overcame.',
        tech: [
            { label: 'TODO',   color: '#888888' },
        ],
        github: '#',
    },
    {
        id: 'project-3',
        title: 'Project Three — TODO',
        description:
            'Replace this with your third project. Link to GitHub and a live demo if available.',
        tech: [
            { label: 'TODO',  color: '#888888' },
        ],
        github: '#',
    },
];

export const CONTACT: ContactData = {
    // TODO: Replace with real personal details
    name:      'Noah Lin',
    email:     'hello@example.com',
    github:    'https://github.com/noahlin34',
    linkedin:  'https://linkedin.com/in/noahlin',
    resumeUrl: '#', // replace with link to PDF resume
    bio:
        'Software developer passionate about building things that matter. ' +
        'Currently open to new opportunities — feel free to reach out!',
};
