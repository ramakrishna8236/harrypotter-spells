/**
 * Harry Potter Spell-Casting Game - Spell Mechanics & FX Orchestration
 * Handles all 6 spells:
 * 1. Expelliarmus (Disarming Charm)
 * 2. Wingardium Leviosa (Levitation Charm)
 * 3. Lumos (Wand-Light Charm)
 * 4. Nox (Extinguishing Charm)
 * 5. Alohomora (Unlocking Charm)
 * 6. Accio (Summoning Charm)
 */

class SpellManager {
    constructor(scene, character, environment, particles, onStatusUpdate) {
        this.scene = scene;
        this.character = character;
        this.environment = environment;
        this.particles = particles;
        this.onStatusUpdate = onStatusUpdate || (() => {});

        this.isCasting = false;
        this.activeBeams = [];
        this.isLumosActive = false;

        // Spell descriptions & metadata
        this.spellData = {
            expelliarmus: {
                name: 'Expelliarmus',
                title: 'The Disarming Charm',
                desc: 'Disarms your opponent, violently knocking their wand or weapon out of their grasp.',
                color: '#e74c3c',
                gesture: 'Thrust Forward'
            },
            wingardium: {
                name: 'Wingardium Leviosa',
                title: 'The Levitation Charm',
                desc: 'Swish and flick wand motion to lift and manipulate heavy objects in mid-air.',
                color: '#00d2d3',
                gesture: 'Swish & Flick'
            },
            lumos: {
                name: 'Lumos',
                title: 'The Wand-Light Charm',
                desc: 'Ignites a brilliant radiant light at the wand tip, illuminating dark chambers.',
                color: '#f1c40f',
                gesture: 'Raise Overhead'
            },
            nox: {
                name: 'Nox',
                title: 'The Extinguishing Charm',
                desc: 'Extinguishes the magical wand light produced by Lumos with a decisive flick.',
                color: '#9b59b6',
                gesture: 'Snuffing Swipe'
            },
            alohomora: {
                name: 'Alohomora',
                title: 'The Unlocking Charm',
                desc: 'Unlocks enchanted and mechanical padlocks, doors, and hidden chests.',
                color: '#e67e22',
                gesture: 'Spiral Loop'
            },
            accio: {
                name: 'Accio',
                title: 'The Summoning Charm',
                desc: 'Summons distant objects across room straight into the caster’s waiting hand.',
                color: '#3498db',
                gesture: 'Yank & Catch'
            }
        };
    }

    castSpell(spellKey) {
        if (this.isCasting) return;
        this.isCasting = true;

        const info = this.spellData[spellKey];

        switch (spellKey) {
            case 'expelliarmus':
                this.castExpelliarmus();
                break;
            case 'wingardium':
                this.castWingardium();
                break;
            case 'lumos':
                this.castLumos();
                break;
            case 'nox':
                this.castNox();
                break;
            case 'alohomora':
                this.castAlohomora();
                break;
            case 'accio':
                this.castAccio();
                break;
            default:
                this.isCasting = false;
        }
    }

    // 1. Expelliarmus: Red projectile beam, target dummy recoil, disarm wand flight
    castExpelliarmus() {
        this.onStatusUpdate({
            spell: 'Expelliarmus',
            status: 'Casting...',
            desc: 'Harry assumes a dueling stance and gathers red magical energy in his holly wand.'
        });

        window.soundEngine.playWandSwish(1.3);

        this.character.playCastAnimation('expelliarmus', () => {
            // Peak of cast (forward thrust)
            window.soundEngine.playExpelliarmus();

            const wandTipPos = new THREE.Vector3();
            this.character.wandTip.getWorldPosition(wandTipPos);

            const targetPos = new THREE.Vector3(0, 1.4, 7.5); // dummy chest target

            // Spawn dynamic energy beam
            this.createEnergyBeam(wandTipPos, targetPos, 0xff2222, 0.28, () => {
                // Beam arrival on dummy
                this.particles.createBurst({
                    position: targetPos,
                    count: 45,
                    color: 0xff3322,
                    size: 0.35,
                    speed: 5.5,
                    spread: 1.2,
                    texture: 'sparkle'
                });

                // Trigger dummy disarm
                const disarmed = this.environment.triggerExpelliarmusDisarm();

                this.onStatusUpdate({
                    spell: 'Expelliarmus',
                    status: 'Disarmed Successfully!',
                    desc: disarmed
                        ? 'Expelliarmus! The red beam strikes the dummy, knocking its wand spinning across the floor!'
                        : 'Expelliarmus! The beam impacts the dummy with a fiery red flash!'
                });
            });
        }, () => {
            this.isCasting = false;
        });
    }

    // 2. Wingardium Leviosa: Swish & flick, cyan levitation vortex, float/lower cauldron
    castWingardium() {
        const isCurrentlyFloating = this.environment.cauldronIsLevitating;
        const actionVerb = isCurrentlyFloating ? 'Lowering cauldron...' : 'Levitating cauldron...';

        this.onStatusUpdate({
            spell: 'Wingardium Leviosa',
            status: 'Swish and Flick...',
            desc: 'Harry gracefully performs the swish and flick wand motion with his holly wand.'
        });

        this.character.playCastAnimation('wingardium', () => {
            // Peak flick
            window.soundEngine.playWingardium(!isCurrentlyFloating);

            const wandTipPos = new THREE.Vector3();
            this.character.wandTip.getWorldPosition(wandTipPos);

            const cauldronPos = new THREE.Vector3();
            this.environment.cauldron.getWorldPosition(cauldronPos);

            // Stream of glowing levitation particles
            this.particles.createStreamTrail(wandTipPos, cauldronPos, 0x00d2d3, 1.2);

            // Toggle cauldron levitation
            const isFloating = this.environment.toggleCauldronLevitation();

            if (isFloating) {
                this.particles.createLevitationVortex(cauldronPos, 3.8);
                this.onStatusUpdate({
                    spell: 'Wingardium Leviosa',
                    status: 'Levitation Active!',
                    desc: 'Wingardium Leviosa! The heavy iron cauldron lifts off the table and hovers mid-air!'
                });
            } else {
                this.onStatusUpdate({
                    spell: 'Wingardium Leviosa',
                    status: 'Lowered Gracefully',
                    desc: 'The telekinetic tether releases, and the cauldron settles back onto the stone table.'
                });
            }
        }, () => {
            this.isCasting = false;
        });
    }

    // 3. Lumos: Wand tip ignites with bright, illuminating light
    castLumos() {
        if (this.isLumosActive) {
            this.onStatusUpdate({
                spell: 'Lumos',
                status: 'Already Illuminating',
                desc: 'Your wand tip is already shining brightly! Cast Nox to extinguish the light.'
            });
            this.isCasting = false;
            return;
        }

        this.onStatusUpdate({
            spell: 'Lumos',
            status: 'Igniting...',
            desc: 'Harry raises his wand high and utters the incantation "Lumos!"'
        });

        this.character.playCastAnimation('lumos', () => {
            this.isLumosActive = true;
            this.character.setLumosVisual(true);
            window.soundEngine.playLumos();

            const wandTipPos = new THREE.Vector3();
            this.character.wandTip.getWorldPosition(wandTipPos);

            this.particles.createBurst({
                position: wandTipPos,
                count: 35,
                color: 0xfffae6,
                size: 0.3,
                speed: 3.5,
                spread: 1.0,
                texture: 'sparkle'
            });

            this.onStatusUpdate({
                spell: 'Lumos',
                status: 'Wand Light Active!',
                desc: 'Lumos! A brilliant sphere of warm white light ignites at the wand tip, illuminating the entire chamber.'
            });
        }, () => {
            this.isCasting = false;
        });
    }

    // 4. Nox: Wand extinguishing counter-flick, light snuffs out
    castNox() {
        if (!this.isLumosActive) {
            this.onStatusUpdate({
                spell: 'Nox',
                status: 'Light Already Off',
                desc: 'Your wand tip is not currently lit. Cast Lumos first to produce magical light!'
            });
            this.isCasting = false;
            return;
        }

        this.onStatusUpdate({
            spell: 'Nox',
            status: 'Extinguishing...',
            desc: 'Harry makes a swift snuffing motion across his chest to extinguish the wand light.'
        });

        this.character.playCastAnimation('nox', () => {
            this.isLumosActive = false;
            this.character.setLumosVisual(false);
            window.soundEngine.playNox();

            const wandTipPos = new THREE.Vector3();
            this.character.wandTip.getWorldPosition(wandTipPos);

            this.particles.createBurst({
                position: wandTipPos,
                count: 20,
                color: 0x8866cc,
                size: 0.25,
                speed: 2.5,
                spread: 0.8,
                texture: 'smoke'
            });

            this.onStatusUpdate({
                spell: 'Nox',
                status: 'Light Extinguished',
                desc: 'Nox! The wand light smoothly snuffs out, returning the chamber to its midnight shadows.'
            });
        }, () => {
            this.isCasting = false;
        });
    }

    // 5. Alohomora: Golden sparks, padlock unlock mechanism, chest lid opens
    castAlohomora() {
        this.onStatusUpdate({
            spell: 'Alohomora',
            status: 'Unlocking...',
            desc: 'Harry traces a golden unlocking spiral in the air and directs it at the ancient locked chest.'
        });

        this.character.playCastAnimation('alohomora', () => {
            window.soundEngine.playAlohomora();

            const wandTipPos = new THREE.Vector3();
            this.character.wandTip.getWorldPosition(wandTipPos);

            const chestLockPos = new THREE.Vector3(4.2, 0.85, 4.2);

            // Stream of golden unlocking sparks
            this.particles.createStreamTrail(wandTipPos, chestLockPos, 0xffbe1a, 0.8);

            setTimeout(() => {
                // Golden impact burst on padlock
                this.particles.createBurst({
                    position: chestLockPos,
                    count: 40,
                    color: 0xffd700,
                    size: 0.35,
                    speed: 4.5,
                    texture: 'sparkle'
                });

                const unlocked = this.environment.unlockChest();

                this.onStatusUpdate({
                    spell: 'Alohomora',
                    status: 'Chest Unlocked!',
                    desc: unlocked
                        ? 'Alohomora! The heavy padlock clicks open and the chest lid swings back, revealing the glowing Sorcerer’s Relic!'
                        : 'Alohomora! Golden sparks illuminate the open treasure chest.'
                });
            }, 450);
        }, () => {
            this.isCasting = false;
        });
    }

    // 6. Accio: Summoning tractor stream, grimoire flight, hand catch
    castAccio() {
        this.onStatusUpdate({
            spell: 'Summoning Charm',
            status: 'Summoning...',
            desc: 'Harry points his wand toward the distant spellbook and draws it from across the chamber.'
        });

        this.character.playCastAnimation('accio', () => {
            const wandTipPos = new THREE.Vector3();
            this.character.wandTip.getWorldPosition(wandTipPos);

            const bookPos = new THREE.Vector3();
            this.environment.grimoire.getWorldPosition(bookPos);

            // Summoning beam connection
            this.particles.createStreamTrail(wandTipPos, bookPos, 0x3498db, 0.9);

            const result = this.environment.triggerAccioSummon();

            if (result === 'summoned') {
                window.soundEngine.playAccio('all');

                setTimeout(() => {
                    // Golden catch burst in hand
                    const handPos = new THREE.Vector3(-0.35, 1.15, 0.35);
                    this.particles.createBurst({
                        position: handPos,
                        count: 25,
                        color: 0xffdd44,
                        size: 0.28,
                        speed: 3.0,
                        texture: 'sparkle'
                    });

                    this.onStatusUpdate({
                        spell: 'Summoning Charm',
                        status: 'Grimoire Caught!',
                        desc: 'The ancient spellbook accelerates through the air and snaps securely into Harry’s hand.'
                    });
                }, 950);
            } else if (result === 'returned') {
                window.soundEngine.playWandSwish(1.0);
                this.onStatusUpdate({
                    spell: 'Summoning Charm',
                    status: 'Returned to Pedestal',
                    desc: 'The grimoire floats smoothly back across the classroom to its stone pedestal.'
                });
            }
        }, () => {
            this.isCasting = false;
        });
    }

    // Dynamic Visual Energy Beam (For Expelliarmus)
    createEnergyBeam(startPos, endPos, color = 0xff2222, duration = 0.28, onHit) {
        const dir = new THREE.Vector3().subVectors(endPos, startPos);
        const length = dir.length();

        // Glowing core cylinder
        const beamGeom = new THREE.CylinderGeometry(0.04, 0.04, length, 8);
        const beamMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.95
        });
        const beamMesh = new THREE.Mesh(beamGeom, beamMat);

        // Position & orient beam along vector
        const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
        beamMesh.position.copy(startPos); // starts at wand tip and stretches
        beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

        // Outer glow halo cylinder
        const outerGeom = new THREE.CylinderGeometry(0.12, 0.12, length, 8);
        const outerMat = new THREE.MeshBasicMaterial({
            color: 0xff6666,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const outerMesh = new THREE.Mesh(outerGeom, outerMat);
        beamMesh.add(outerMesh);

        this.scene.add(beamMesh);

        let elapsed = 0;
        let hitTriggered = false;

        this.activeBeams.push({
            mesh: beamMesh,
            update: (delta) => {
                elapsed += delta;
                const p = Math.min(1.0, elapsed / duration);

                // Stretch from start to target
                const curEnd = new THREE.Vector3().lerpVectors(startPos, endPos, p);
                const curMid = new THREE.Vector3().addVectors(startPos, curEnd).multiplyScalar(0.5);
                const curLen = Math.max(0.01, startPos.distanceTo(curEnd));

                beamMesh.position.copy(curMid);
                beamMesh.scale.set(1, curLen / length, 1);

                // Pulsate width
                const pulse = 1.0 + Math.sin(elapsed * 40.0) * 0.3;
                outerMesh.scale.set(pulse, 1, pulse);

                if (p >= 1.0 && !hitTriggered) {
                    hitTriggered = true;
                    if (onHit) onHit();
                }

                // Fade out beam after impact
                if (elapsed > duration) {
                    const fade = Math.max(0, 1.0 - (elapsed - duration) / 0.12);
                    beamMat.opacity = fade * 0.95;
                    outerMat.opacity = fade * 0.5;
                }

                return elapsed < duration + 0.12;
            },
            dispose: () => {
                this.scene.remove(beamMesh);
                beamGeom.dispose();
                beamMat.dispose();
                outerGeom.dispose();
                outerMat.dispose();
            }
        });
    }

    // Reset All Chamber Objects & Lighting
    resetChamber() {
        this.environment.resetAll();
        if (this.isLumosActive) {
            this.isLumosActive = false;
            this.character.setLumosVisual(false);
        }
        window.soundEngine.playReset();

        // Shimmering restoration burst at center of room
        this.particles.createBurst({
            position: new THREE.Vector3(0, 2.0, 4.0),
            count: 60,
            color: 0xffe066,
            size: 0.3,
            speed: 4.5,
            spread: 2.0,
            texture: 'sparkle'
        });

        this.onStatusUpdate({
            spell: 'Chamber Restored',
            status: 'All Targets Reset',
            desc: 'The Hogwarts classroom has been restored to its initial pristine state. All objects are back in position.'
        });
    }

    update(delta) {
        for (let i = this.activeBeams.length - 1; i >= 0; i--) {
            const beam = this.activeBeams[i];
            const isAlive = beam.update(delta);
            if (!isAlive) {
                beam.dispose();
                this.activeBeams.splice(i, 1);
            }
        }
    }
}
