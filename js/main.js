/**
 * Harry Potter Spell-Casting Game - Main Application Entrypoint
 * Coordinates Three.js render loop, camera presets, UI events, and gameplay.
 */

window.addEventListener('DOMContentLoaded', () => {
    // 1. Scene, Camera, Renderer Setup
    const container = document.getElementById('canvas-container');
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060912);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(2.8, 2.4, -4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below ground
    controls.minDistance = 1.5;
    controls.maxDistance = 22;
    controls.target.set(0, 1.4, 2.5);

    // 2. Instantiate Systems
    const particles = new ParticleEngine(scene);
    const environment = new HogwartsEnvironment(scene);
    const harry = new HarryCharacter(scene);

    // Attach idle wand sparks to Harry's wand tip
    particles.createWandTipGlow(harry.wandTip);

    // Status Banner Elements
    const statusSpellName = document.querySelector('.status-spell-name');
    const statusBadge = document.querySelector('.status-badge');
    const statusDesc = document.querySelector('.status-description');

    const updateStatusUI = ({ spell, status, desc }) => {
        if (statusSpellName) statusSpellName.textContent = spell;
        if (statusBadge) statusBadge.textContent = status;
        if (statusDesc) statusDesc.textContent = desc;

        // Visual flash on status card
        const card = document.querySelector('.status-card');
        if (card) {
            card.style.borderColor = '#fbe282';
            setTimeout(() => {
                card.style.borderColor = 'rgba(212, 175, 55, 0.4)';
            }, 600);
        }
    };

    // Spell Manager
    const spellManager = new SpellManager(scene, harry, environment, particles, updateStatusUI);

    // 3. Camera Presets
    const cameraPresets = {
        cinematic: { pos: new THREE.Vector3(2.8, 2.4, -4.6), target: new THREE.Vector3(0, 1.4, 2.5) },
        harry: { pos: new THREE.Vector3(0.35, 1.6, -1.8), target: new THREE.Vector3(0, 1.35, 0.2) },
        targets: { pos: new THREE.Vector3(0.2, 2.4, 11.5), target: new THREE.Vector3(0, 1.3, 2.0) },
        overview: { pos: new THREE.Vector3(-6.2, 6.5, -5.2), target: new THREE.Vector3(0, 1.8, 4.0) }
    };

    let targetCamPos = cameraPresets.cinematic.pos.clone();
    let targetCamLook = cameraPresets.cinematic.target.clone();
    let isTransitioningCam = false;

    function setCameraPreset(presetKey) {
        const p = cameraPresets[presetKey];
        if (!p) return;
        targetCamPos.copy(p.pos);
        targetCamLook.copy(p.target);
        isTransitioningCam = true;
    }

    // 4. UI Bindings
    // Spell Cards Click Handlers
    const spellCards = document.querySelectorAll('.spell-card');
    let lastSelectedSpell = 'expelliarmus';

    spellCards.forEach(card => {
        card.addEventListener('click', () => {
            const spellKey = card.getAttribute('data-spell');
            if (!spellKey) return;

            window.soundEngine.resume();
            lastSelectedSpell = spellKey;

            // Highlight card
            spellCards.forEach(c => c.classList.remove('active-casting'));
            card.classList.add('active-casting');
            setTimeout(() => card.classList.remove('active-casting'), 1500);

            spellManager.castSpell(spellKey);
        });
    });

    // Reset Chamber Button
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            window.soundEngine.resume();
            spellManager.resetChamber();
        });
    }

    // Camera Preset Selector
    const camSelect = document.getElementById('camera-select');
    if (camSelect) {
        camSelect.addEventListener('change', (e) => {
            setCameraPreset(e.target.value);
        });
    }

    // Audio Controls
    const btnMute = document.getElementById('btn-mute');
    const volSlider = document.getElementById('vol-slider');

    if (btnMute) {
        btnMute.addEventListener('click', () => {
            window.soundEngine.resume();
            const isMuted = window.soundEngine.toggleMute();
            btnMute.textContent = isMuted ? '🔇 Unmute' : '🔊 Sound';
        });
    }

    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            window.soundEngine.resume();
            window.soundEngine.setVolume(parseFloat(e.target.value));
        });
    }

    // Gesture Guide Modal
    const btnGestureGuide = document.getElementById('btn-gesture-guide');
    const modalOverlay = document.getElementById('modal-gesture-guide');
    const btnCloseModal = document.getElementById('btn-close-modal');

    if (btnGestureGuide && modalOverlay) {
        btnGestureGuide.addEventListener('click', () => {
            window.soundEngine.resume();
            window.soundEngine.playClick();
            modalOverlay.classList.add('open');
        });
    }

    if (btnCloseModal && modalOverlay) {
        btnCloseModal.addEventListener('click', () => {
            window.soundEngine.playClick();
            modalOverlay.classList.remove('open');
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('open');
            }
        });
    }

    // 5. Keyboard Hotkeys
    const spellKeysOrder = ['expelliarmus', 'wingardium', 'lumos', 'nox', 'alohomora', 'accio'];
    const camKeysOrder = ['cinematic', 'harry', 'targets', 'overview'];
    let currentCamIndex = 0;

    window.addEventListener('keydown', (e) => {
        // Digits 1-6
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
            const spellKey = spellKeysOrder[num - 1];
            if (spellKey) {
                window.soundEngine.resume();
                const card = document.querySelector(`.spell-card[data-spell="${spellKey}"]`);
                if (card) {
                    spellCards.forEach(c => c.classList.remove('active-casting'));
                    card.classList.add('active-casting');
                    setTimeout(() => card.classList.remove('active-casting'), 1500);
                }
                spellManager.castSpell(spellKey);
            }
        } else if (e.key === 'r' || e.key === 'R') {
            window.soundEngine.resume();
            spellManager.resetChamber();
        } else if (e.key === 'c' || e.key === 'C') {
            currentCamIndex = (currentCamIndex + 1) % camKeysOrder.length;
            const nextCam = camKeysOrder[currentCamIndex];
            if (camSelect) camSelect.value = nextCam;
            setCameraPreset(nextCam);
        } else if (e.key === 'm' || e.key === 'M') {
            if (btnMute) btnMute.click();
        } else if (e.code === 'Space') {
            e.preventDefault();
            if (lastSelectedSpell) {
                spellManager.castSpell(lastSelectedSpell);
            }
        }
    });

    // 6. Window Resize Handler
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    // 7. Render Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.1);
        const time = clock.getElapsedTime();

        // Smooth camera transition if active
        if (isTransitioningCam) {
            camera.position.lerp(targetCamPos, delta * 3.5);
            controls.target.lerp(targetCamLook, delta * 3.5);
            if (camera.position.distanceTo(targetCamPos) < 0.05) {
                isTransitioningCam = false;
            }
        }

        controls.update();

        // Update systems
        harry.update(delta);
        environment.update(delta, time);
        particles.update(delta);
        spellManager.update(delta);

        renderer.render(scene, camera);
    }

    animate();
});
