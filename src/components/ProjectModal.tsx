import type { ProjectData } from '../game/content/modalData';

interface Props {
    project: ProjectData;
    onClose: () => void;
}

export function ProjectModal({ project, onClose }: Props) {
    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.card} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>{project.title}</h2>
                    <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Screenshot (optional) */}
                {project.image && (
                    <img
                        src={project.image}
                        alt={`${project.title} screenshot`}
                        style={styles.screenshot}
                    />
                )}

                {/* Description */}
                <p style={styles.description}>{project.description}</p>

                {/* Tech badges */}
                <div style={styles.badgeRow}>
                    {project.tech.map(t => (
                        <span
                            key={t.label}
                            style={{ ...styles.badge, background: t.color ?? '#444' }}
                        >
                            {t.label}
                        </span>
                    ))}
                </div>

                {/* Links */}
                <div style={styles.linkRow}>
                    {project.github && project.github !== '#' && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" style={styles.link}>
                            ⬡ GitHub
                        </a>
                    )}
                    {project.demo && project.demo !== '#' && (
                        <a href={project.demo} target="_blank" rel="noopener noreferrer" style={{ ...styles.link, ...styles.linkAccent }}>
                            ▶ Live Demo
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
    },
    card: {
        background: '#1a1a2e',
        border: '3px solid #ffffff',
        borderRadius: '4px',
        maxWidth: '560px',
        width: '100%',
        padding: '1.5rem',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffffff',
        boxShadow: '0 0 40px rgba(0,0,0,0.8)',
        imageRendering: 'pixelated',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        gap: '1rem',
    },
    title: {
        fontSize: '0.85rem',
        lineHeight: 1.4,
        margin: 0,
        color: '#ffffaa',
        letterSpacing: '0.02em',
    },
    closeBtn: {
        background: 'none',
        border: '2px solid #ffffff',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '0.7rem',
        padding: '0.25rem 0.5rem',
        fontFamily: 'inherit',
        flexShrink: 0,
        lineHeight: 1,
    },
    screenshot: {
        width: '100%',
        borderRadius: '2px',
        marginBottom: '1rem',
        border: '2px solid #333',
        imageRendering: 'pixelated',
    },
    description: {
        fontSize: '0.55rem',
        lineHeight: 2,
        color: '#cccccc',
        marginBottom: '1.2rem',
        fontFamily: 'system-ui, sans-serif', // readable body font
    },
    badgeRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
        marginBottom: '1.2rem',
    },
    badge: {
        fontSize: '0.45rem',
        padding: '0.3rem 0.5rem',
        borderRadius: '2px',
        color: '#fff',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
    },
    linkRow: {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    link: {
        fontSize: '0.55rem',
        color: '#ffffff',
        textDecoration: 'none',
        border: '2px solid #ffffff',
        padding: '0.4rem 0.75rem',
        letterSpacing: '0.03em',
    },
    linkAccent: {
        borderColor: '#ffffaa',
        color: '#ffffaa',
    },
};
