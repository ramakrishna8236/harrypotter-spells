/**
 * Harry Potter Spell-Casting Game - Magic Particle Engine
 * Fully procedural textures generated on HTML5 canvas.
 */

class ParticleEngine {
    constructor(scene) {
        this.scene = scene;
        this.emitters = [];
        this.textures = this.createProceduralTextures();
        this.ambientMotes = null;
        this.initAmbientDustMotes();
    }

    createProceduralTextures() {
        const textures = {};

        // 1. Soft Glow Orb
        const c1 = document.createElement('canvas');
        c1.width = 128;
        c1.height = 128;
        const ctx1 = c1.getContext('2d');
        const grad1 = ctx1.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad1.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad1.addColorStop(0.2, 'rgba(255, 240, 200, 0.8)');
        grad1.addColorStop(0.6, 'rgba(255, 200, 100, 0.25)');
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx1.fillStyle = grad1;
        ctx1.fillRect(0, 0, 128, 128);
        textures.glow = new THREE.CanvasTexture(c1);

        // 2. Star Sparkle (4-point sparkle)
        const c2 = document.createElement('canvas');
        c2.width = 128;
        c2.height = 128;
        const ctx2 = c2.getContext('2d');
        ctx2.translate(64, 64);
        const grad2 = ctx2.createRadialGradient(0, 0, 0, 0, 0, 60);
        grad2.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad2.addColorStop(0.3, 'rgba(255, 230, 150, 0.7)');
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx2.fillStyle = grad2;
        ctx2.beginPath();
        for (let i = 0; i < 4; i++) {
            ctx2.moveTo(0, 0);
            ctx2.lineTo(60, 0);
            ctx2.lineTo(12, 12);
            ctx2.lineTo(0, 60);
            ctx2.lineTo(-12, 12);
            ctx2.lineTo(-60, 0);
            ctx2.lineTo(-12, -12);
            ctx2.lineTo(0, -60);
            ctx2.lineTo(12, -12);
        }
        ctx2.fill();
        textures.sparkle = new THREE.CanvasTexture(c2);

        // 3. Smoke / Mystical Puff
        const c3 = document.createElement('canvas');
        c3.width = 128;
        c3.height = 128;
        const ctx3 = c3.getContext('2d');
        const grad3 = ctx3.createRadialGradient(64, 64, 5, 64, 64, 60);
        grad3.addColorStop(0, 'rgba(200, 220, 255, 0.8)');
        grad3.addColorStop(0.4, 'rgba(160, 190, 240, 0.4)');
        grad3.addColorStop(0.8, 'rgba(100, 130, 200, 0.1)');
        grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx3.fillStyle = grad3;
        ctx3.fillRect(0, 0, 128, 128);
        textures.smoke = new THREE.CanvasTexture(c3);

        // 4. Sharp Magic Rune / Ring
        const c4 = document.createElement('canvas');
        c4.width = 128;
        c4.height = 128;
        const ctx4 = c4.getContext('2d');
        ctx4.strokeStyle = 'rgba(255, 220, 120, 0.9)';
        ctx4.lineWidth = 6;
        ctx4.beginPath();
        ctx4.arc(64, 64, 46, 0, Math.PI * 2);
        ctx4.stroke();
        ctx4.beginPath();
        ctx4.arc(64, 64, 25, 0, Math.PI * 2);
        ctx4.lineWidth = 3;
        ctx4.stroke();
        textures.ring = new THREE.CanvasTexture(c4);

        return textures;
    }

    initAmbientDustMotes() {
        const count = 350;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 24;
            positions[i * 3 + 1] = Math.random() * 10 + 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 26;

            velocities.push({
                x: (Math.random() - 0.5) * 0.15,
                y: Math.random() * 0.1 + 0.05,
                z: (Math.random() - 0.5) * 0.15,
                originalY: positions[i * 3 + 1],
                phase: Math.random() * Math.PI * 2
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.18,
            map: this.textures.glow,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xeeddaa
        });

        this.ambientMotes = new THREE.Points(geometry, material);
        this.ambientMotes.velocities = velocities;
        this.scene.add(this.ambientMotes);
    }

    // Generic Particle Burst
    createBurst({
        position,
        count = 30,
        color = 0xff3333,
        size = 0.35,
        speed = 4.0,
        spread = 1.0,
        gravity = -3.0,
        life = 0.8,
        texture = 'sparkle',
        blending = THREE.AdditiveBlending
    }) {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const particles = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            // Random sphere velocity
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const spd = (0.3 + Math.random() * 0.7) * speed;

            particles.push({
                vx: Math.sin(phi) * Math.cos(theta) * spd * spread,
                vy: (Math.cos(phi) * 0.6 + 0.4) * spd * spread,
                vz: Math.sin(phi) * Math.sin(theta) * spd * spread,
                age: 0,
                maxAge: life * (0.6 + Math.random() * 0.6),
                initialSize: size * (0.6 + Math.random() * 0.8)
            });
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            size: size,
            map: this.textures[texture] || this.textures.sparkle,
            transparent: true,
            opacity: 1.0,
            color: color,
            blending: blending,
            depthWrite: false
        });

        const points = new THREE.Points(geom, mat);
        this.scene.add(points);

        this.emitters.push({
            mesh: points,
            particles: particles,
            gravity: gravity,
            type: 'burst',
            update: (delta) => {
                const posAttr = points.geometry.attributes.position;
                let aliveCount = 0;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.age += delta;
                    if (p.age < p.maxAge) {
                        aliveCount++;
                        p.vy += gravity * delta;
                        posAttr.array[i * 3 + 0] += p.vx * delta;
                        posAttr.array[i * 3 + 1] += p.vy * delta;
                        posAttr.array[i * 3 + 2] += p.vz * delta;
                    } else {
                        posAttr.array[i * 3 + 1] = -999; // move off-screen
                    }
                }

                posAttr.needsUpdate = true;
                const ratio = particles[0].age / particles[0].maxAge;
                mat.opacity = Math.max(0, 1.0 - ratio);

                return aliveCount > 0;
            },
            dispose: () => {
                this.scene.remove(points);
                geom.dispose();
                mat.dispose();
            }
        });
    }

    // Wand Tip Idle Magic Glimmers
    createWandTipGlow(wandTipMesh) {
        const count = 18;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const particles = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            particles.push({
                offset: new THREE.Vector3(),
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.4 + 0.1,
                vz: (Math.random() - 0.5) * 0.3,
                age: Math.random() * 0.8,
                maxAge: 0.8
            });
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.16,
            map: this.textures.sparkle,
            transparent: true,
            opacity: 0.85,
            color: 0xffdf88,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geom, mat);
        this.scene.add(points);

        const worldPos = new THREE.Vector3();

        this.emitters.push({
            mesh: points,
            type: 'wandIdle',
            update: (delta) => {
                wandTipMesh.getWorldPosition(worldPos);
                const posAttr = points.geometry.attributes.position;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.age += delta;
                    if (p.age >= p.maxAge) {
                        p.age = 0;
                        p.offset.set(0, 0, 0);
                        p.vx = (Math.random() - 0.5) * 0.25;
                        p.vy = Math.random() * 0.35 + 0.08;
                        p.vz = (Math.random() - 0.5) * 0.25;
                    }
                    p.offset.x += p.vx * delta;
                    p.offset.y += p.vy * delta;
                    p.offset.z += p.vz * delta;

                    posAttr.array[i * 3 + 0] = worldPos.x + p.offset.x;
                    posAttr.array[i * 3 + 1] = worldPos.y + p.offset.y;
                    posAttr.array[i * 3 + 2] = worldPos.z + p.offset.z;
                }
                posAttr.needsUpdate = true;
                return true; // continuous
            },
            dispose: () => {
                this.scene.remove(points);
                geom.dispose();
                mat.dispose();
            }
        });
    }

    // Wingardium Levitation Vortex Particles (swirling around cauldron)
    createLevitationVortex(centerPos, duration = 3.5) {
        const count = 70;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const particles = [];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.4 + Math.random() * 1.2;
            const height = Math.random() * 0.4;
            positions[i * 3 + 0] = centerPos.x + Math.cos(angle) * radius;
            positions[i * 3 + 1] = centerPos.y + height;
            positions[i * 3 + 2] = centerPos.z + Math.sin(angle) * radius;

            particles.push({
                angle: angle,
                radius: radius,
                y: height,
                speed: 2.2 + Math.random() * 2.0,
                liftSpeed: 0.9 + Math.random() * 1.2,
                maxHeight: 2.8 + Math.random() * 0.8
            });
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.24,
            map: this.textures.sparkle,
            transparent: true,
            opacity: 0.9,
            color: 0x44ddff,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geom, mat);
        this.scene.add(points);

        let elapsed = 0;

        this.emitters.push({
            mesh: points,
            type: 'levitationVortex',
            update: (delta) => {
                elapsed += delta;
                const posAttr = points.geometry.attributes.position;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.angle += p.speed * delta;
                    p.y += p.liftSpeed * delta;
                    if (p.y > p.maxHeight) {
                        p.y = 0;
                        p.radius = 0.4 + Math.random() * 1.1;
                    }
                    posAttr.array[i * 3 + 0] = centerPos.x + Math.cos(p.angle) * p.radius;
                    posAttr.array[i * 3 + 1] = centerPos.y + p.y;
                    posAttr.array[i * 3 + 2] = centerPos.z + Math.sin(p.angle) * p.radius;
                }

                posAttr.needsUpdate = true;
                if (elapsed > duration - 0.8) {
                    mat.opacity = Math.max(0, (duration - elapsed) / 0.8);
                }
                return elapsed < duration;
            },
            dispose: () => {
                this.scene.remove(points);
                geom.dispose();
                mat.dispose();
            }
        });
    }

    // Stream / Trail connecting source and target (Alohomora & Accio)
    createStreamTrail(startVec, endVec, color = 0xffcc33, duration = 1.0) {
        const count = 45;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const particles = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                t: Math.random(),
                speed: 1.2 + Math.random() * 1.5,
                spreadX: (Math.random() - 0.5) * 0.3,
                spreadY: (Math.random() - 0.5) * 0.3,
                spreadZ: (Math.random() - 0.5) * 0.3
            });
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.28,
            map: this.textures.sparkle,
            transparent: true,
            opacity: 0.9,
            color: color,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geom, mat);
        this.scene.add(points);
        let elapsed = 0;

        this.emitters.push({
            mesh: points,
            type: 'streamTrail',
            update: (delta) => {
                elapsed += delta;
                const posAttr = points.geometry.attributes.position;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.t += p.speed * delta;
                    if (p.t > 1) p.t -= 1;

                    // Interpolate between start and end with an arc curve
                    const cur = new THREE.Vector3().lerpVectors(startVec, endVec, p.t);
                    // Add subtle arc height
                    cur.y += Math.sin(p.t * Math.PI) * 0.6;

                    posAttr.array[i * 3 + 0] = cur.x + p.spreadX;
                    posAttr.array[i * 3 + 1] = cur.y + p.spreadY;
                    posAttr.array[i * 3 + 2] = cur.z + p.spreadZ;
                }
                posAttr.needsUpdate = true;

                if (elapsed > duration - 0.3) {
                    mat.opacity = Math.max(0, (duration - elapsed) / 0.3);
                }
                return elapsed < duration;
            },
            dispose: () => {
                this.scene.remove(points);
                geom.dispose();
                mat.dispose();
            }
        });
    }

    update(delta) {
        // Update ambient motes
        if (this.ambientMotes) {
            const posAttr = this.ambientMotes.geometry.attributes.position;
            const vels = this.ambientMotes.velocities;
            for (let i = 0; i < vels.length; i++) {
                const v = vels[i];
                v.phase += delta;
                posAttr.array[i * 3 + 0] += Math.sin(v.phase) * 0.005;
                posAttr.array[i * 3 + 1] += v.y * delta;
                posAttr.array[i * 3 + 2] += Math.cos(v.phase) * 0.005;

                if (posAttr.array[i * 3 + 1] > 11) {
                    posAttr.array[i * 3 + 1] = 0.5;
                }
            }
            posAttr.needsUpdate = true;
        }

        // Update active emitters
        for (let i = this.emitters.length - 1; i >= 0; i--) {
            const emitter = this.emitters[i];
            const isAlive = emitter.update(delta);
            if (!isAlive) {
                emitter.dispose();
                this.emitters.splice(i, 1);
            }
        }
    }
}
