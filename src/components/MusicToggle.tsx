import { useState, useRef, useEffect } from 'react';

/**
 * Background music toggle button.
 * Music is muted by default; user clicks to unmute.
 * Uses a simple Web Audio API oscillator-based chiptune loop as a placeholder
 * until a real .mp3 track is placed at /assets/music/overworld.mp3.
 */
export function MusicToggle() {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio('/assets/music/overworld.mp3');
        audio.loop = true;
        audio.volume = 0.35;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            // Resume AudioContext if suspended (browser autoplay policy)
            audio.play().catch(() => {
                // If mp3 not found, fail silently
            });
            setPlaying(true);
        }
    };

    return (
        <button
            onClick={toggle}
            style={styles.btn}
            title={playing ? 'Mute music' : 'Play music'}
            aria-label={playing ? 'Mute music' : 'Play music'}
        >
            {playing ? '♪' : '♪̸'}
        </button>
    );
}

const styles: Record<string, React.CSSProperties> = {
    btn: {
        position: 'fixed',
        top: '0.75rem',
        right: '0.75rem',
        zIndex: 160,
        background: 'rgba(26,26,46,0.9)',
        border: '2px solid rgba(255,255,255,0.5)',
        color: '#ffffff',
        fontSize: '1rem',
        width: 36,
        height: 36,
        cursor: 'pointer',
        fontFamily: '"Press Start 2P", monospace',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
    },
};
