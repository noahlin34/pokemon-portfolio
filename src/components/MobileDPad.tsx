import { useEffect, useRef } from 'react';
import { EventBus } from '../game/EventBus';

/**
 * Virtual D-pad overlay for touch devices.
 * Emits directional events via EventBus instead of injecting keyboard events,
 * so the game can handle them without browser keyboard APIs.
 */

type DPadDir = 'up' | 'down' | 'left' | 'right';
type DPadAction = 'press' | 'release';

export function MobileDPad() {
    const activeDir = useRef<DPadDir | null>(null);

    const press = (dir: DPadDir) => {
        if (activeDir.current === dir) return;
        if (activeDir.current) EventBus.emit('dpad', { dir: activeDir.current, action: 'release' as DPadAction });
        activeDir.current = dir;
        EventBus.emit('dpad', { dir, action: 'press' as DPadAction });
    };

    const release = () => {
        if (activeDir.current) {
            EventBus.emit('dpad', { dir: activeDir.current, action: 'release' as DPadAction });
            activeDir.current = null;
        }
    };

    useEffect(() => {
        return () => { if (activeDir.current) release(); };
    }, []);

    const btn = (dir: DPadDir, label: string, extraStyle?: React.CSSProperties) => (
        <button
            style={{ ...styles.btn, ...extraStyle }}
            onPointerDown={e => { e.preventDefault(); press(dir); }}
            onPointerUp={release}
            onPointerLeave={release}
            aria-label={dir}
        >
            {label}
        </button>
    );

    return (
        <div style={styles.container}>
            {/* Interact button (right side) */}
            <button
                style={{ ...styles.btn, ...styles.actionBtn }}
                onPointerDown={e => { e.preventDefault(); EventBus.emit('dpad-action'); }}
                aria-label="Interact"
            >
                A
            </button>

            {/* D-pad cross */}
            <div style={styles.cross}>
                <div style={styles.row}>
                    {btn('up', '▲')}
                </div>
                <div style={styles.row}>
                    {btn('left', '◄')}
                    <div style={styles.center} />
                    {btn('right', '►')}
                </div>
                <div style={styles.row}>
                    {btn('down', '▼')}
                </div>
            </div>
        </div>
    );
}

const BTN = 48; // px

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        bottom: '1.5rem',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '0 2rem',
        pointerEvents: 'none', // let canvas receive events by default
        zIndex: 150,
    },
    cross: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'auto',
        gap: '2px',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
    },
    center: {
        width: BTN,
        height: BTN,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '2px',
    },
    btn: {
        width: BTN,
        height: BTN,
        background: 'rgba(30,30,60,0.85)',
        border: '2px solid rgba(255,255,255,0.4)',
        color: '#ffffff',
        fontSize: '1.1rem',
        cursor: 'pointer',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        fontFamily: 'monospace',
        pointerEvents: 'auto',
    },
    actionBtn: {
        width: 60,
        height: 60,
        background: 'rgba(233,30,140,0.8)',
        border: '2px solid rgba(255,255,255,0.6)',
        fontSize: '1rem',
        fontFamily: '"Press Start 2P", monospace',
        borderRadius: '50%',
    },
};
