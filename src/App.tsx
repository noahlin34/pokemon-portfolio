import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { EventBus } from './game/EventBus';
import { ProjectModal } from './components/ProjectModal';
import { ContactPanel } from './components/ContactPanel';
import { MobileDPad } from './components/MobileDPad';
import { MusicToggle } from './components/MusicToggle';
import type { ProjectData, ContactData } from './game/content/modalData';

const isTouchDevice = () =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

type ModalState =
    | { kind: 'none' }
    | { kind: 'project'; data: ProjectData }
    | { kind: 'contact'; data: ContactData };

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [modal, setModal] = useState<ModalState>({ kind: 'none' });

    useEffect(() => {
        const onProject = (data: ProjectData) => setModal({ kind: 'project', data });
        const onContact = (data: ContactData) => setModal({ kind: 'contact', data });

        EventBus.on('open-project', onProject);
        EventBus.on('open-contact', onContact);

        return () => {
            EventBus.off('open-project', onProject);
            EventBus.off('open-contact', onContact);
        };
    }, []);

    const closeModal = () => setModal({ kind: 'none' });

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
            <MusicToggle />

            {/* Virtual D-pad shown only on touch/mobile devices */}
            {modal.kind === 'none' && isTouchDevice() && <MobileDPad />}

            {modal.kind === 'project' && (
                <ProjectModal project={modal.data} onClose={closeModal} />
            )}

            {modal.kind === 'contact' && (
                <ContactPanel contact={modal.data} onClose={closeModal} />
            )}
        </div>
    );
}

export default App;
