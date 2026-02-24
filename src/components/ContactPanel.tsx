import type { ContactData } from '../game/content/modalData';

interface Props {
    contact: ContactData;
    onClose: () => void;
}

interface LinkItem {
    label: string;
    href: string;
    icon: string;
}

export function ContactPanel({ contact, onClose }: Props) {
    const links: LinkItem[] = [
        contact.email    ? { label: 'Email',    href: `mailto:${contact.email}`,  icon: '✉' } : null,
        contact.github   ? { label: 'GitHub',   href: contact.github,             icon: '⬡' } : null,
        contact.linkedin ? { label: 'LinkedIn', href: contact.linkedin,           icon: '🔗' } : null,
        contact.resumeUrl && contact.resumeUrl !== '#'
            ? { label: 'Résumé', href: contact.resumeUrl, icon: '⬇' }
            : null,
    ].filter(Boolean) as LinkItem[];

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.card} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.eyebrow}>POKÉCENTER — CONTACT</div>
                        <h2 style={styles.name}>{contact.name}</h2>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Bio */}
                <p style={styles.bio}>{contact.bio}</p>

                {/* Divider */}
                <hr style={styles.divider} />

                {/* Links */}
                <div style={styles.linksGrid}>
                    {links.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            target={link.href.startsWith('mailto') ? undefined : '_blank'}
                            rel="noopener noreferrer"
                            style={styles.linkItem}
                        >
                            <span style={styles.linkIcon}>{link.icon}</span>
                            <span style={styles.linkLabel}>{link.label}</span>
                            <span style={styles.linkHref}>
                                {link.href.replace('mailto:', '')}
                            </span>
                        </a>
                    ))}
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
        border: '3px solid #e91e8c',
        borderRadius: '4px',
        maxWidth: '480px',
        width: '100%',
        padding: '1.5rem',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffffff',
        boxShadow: '0 0 40px rgba(233,30,140,0.3)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        gap: '1rem',
    },
    eyebrow: {
        fontSize: '0.4rem',
        color: '#e91e8c',
        letterSpacing: '0.1em',
        marginBottom: '0.5rem',
    },
    name: {
        fontSize: '0.85rem',
        margin: 0,
        color: '#ffffaa',
    },
    closeBtn: {
        background: 'none',
        border: '2px solid #e91e8c',
        color: '#e91e8c',
        cursor: 'pointer',
        fontSize: '0.7rem',
        padding: '0.25rem 0.5rem',
        fontFamily: 'inherit',
        flexShrink: 0,
        lineHeight: 1,
    },
    bio: {
        fontSize: '0.55rem',
        lineHeight: 2,
        color: '#cccccc',
        marginBottom: '1rem',
        fontFamily: 'system-ui, sans-serif',
    },
    divider: {
        border: 'none',
        borderTop: '2px solid #333',
        margin: '1rem 0',
    },
    linksGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
    },
    linkItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 0.75rem',
        border: '1px solid #333',
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '0.5rem',
        transition: 'border-color 0.15s',
    },
    linkIcon: {
        fontSize: '0.7rem',
        width: '1.2rem',
        textAlign: 'center',
        flexShrink: 0,
    },
    linkLabel: {
        color: '#ffffaa',
        minWidth: '4rem',
    },
    linkHref: {
        color: '#888',
        fontSize: '0.45rem',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
};
