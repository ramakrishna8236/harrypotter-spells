/**
 * Harry Potter Spell-Casting Game - Hogwarts Environment & Interactive Props
 * Features:
 * - Gothic Castle Classroom (flagstone floor, stone pillars, arches, cathedral window)
 * - 16 Floating Enchanted Candles with animated flames and flickering point lights
 * - Interactive Practice Dummy with disarmable wand (Expelliarmus)
 * - Interactive Heavy Cauldron with bubbling potion & levitation physics (Wingardium Leviosa)
 * - Interactive Ancient Oak Chest with working lock and lid (Alohomora)
 * - Interactive Distant Grimoire on Pedestal with flight curve physics (Accio)
 */

class HogwartsEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.floatingCandles = [];
        this.flickerLights = [];

        // Interactive Objects
        this.dummy = null;
        this.dummyWand = null;
        this.dummyWandOriginalPos = new THREE.Vector3(0.35, 1.4, 0.25);
        this.dummyWandOriginalRot = new THREE.Euler(0.4, 0, 0.2);
        this.dummyWandState = 'held'; // 'held', 'flying', 'ground'
        this.dummyWandFlyTime = 0;
        this.dummyWandFlyOrigin = new THREE.Vector3();
        this.dummyWandFlyTarget = new THREE.Vector3(1.6, 0.04, 8.5);

        this.cauldron = null;
        this.cauldronBaseY = 1.05;
        this.cauldronTargetY = 1.05;
        this.cauldronIsLevitating = false;

        this.chest = null;
        this.chestLid = null;
        this.chestPadlock = null;
        this.chestRelic = null;
        this.chestRelicLight = null;
        this.chestState = 'locked'; // 'locked', 'opening', 'open', 'closing'
        this.chestLidAngle = 0;

        this.grimoire = null;
        this.grimoirePedestalPos = new THREE.Vector3(-5.2, 2.3, 8.0);
        this.grimoireState = 'pedestal'; // 'pedestal', 'flying', 'held'
        this.grimoireFlyTime = 0;
        this.grimoireFlyOrigin = new THREE.Vector3();
        this.grimoireHandTarget = new THREE.Vector3(-0.35, 1.15, 0.35);

        this.buildClassroom();
        this.buildFloatingCandles();
        this.buildTrainingDummy();
        this.buildCauldron();
        this.buildAncientChest();
        this.buildGrimoireAndPedestal();
        this.buildClassroomDecorations();
    }

    buildClassroom() {
        // Flagstone floor with procedural stone texture
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        const fctx = floorCanvas.getContext('2d');

        // Base stone color
        fctx.fillStyle = '#262428';
        fctx.fillRect(0, 0, 512, 512);

        // Grid of stone tiles
        const tileSize = 64;
        fctx.strokeStyle = '#151318';
        fctx.lineWidth = 4;

        for (let x = 0; x < 512; x += tileSize) {
            for (let y = 0; y < 512; y += tileSize) {
                const shade = 35 + Math.floor(Math.random() * 20);
                fctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade + 4})`;
                fctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

                // Specks and scratches
                for (let k = 0; k < 6; k++) {
                    const sx = x + Math.random() * tileSize;
                    const sy = y + Math.random() * tileSize;
                    fctx.fillStyle = Math.random() > 0.5 ? '#111014' : '#44424a';
                    fctx.fillRect(sx, sy, 2, 2);
                }
            }
        }
        fctx.strokeRect(0, 0, 512, 512);

        const floorTex = new THREE.CanvasTexture(floorCanvas);
        floorTex.wrapS = THREE.RepeatWrapping;
        floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(6, 8);

        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            roughness: 0.8,
            metalness: 0.1
        });

        const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(24, 32), floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(0, 0, 4);
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        // Stone Wall Material
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x323038,
            roughness: 0.9,
            metalness: 0.05
        });

        // Back Wall (behind targets, z = 16)
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), wallMat);
        backWall.position.set(0, 7, 16);
        backWall.rotation.y = Math.PI;
        backWall.receiveShadow = true;
        this.scene.add(backWall);

        // Front Wall (behind camera, z = -8)
        const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), wallMat);
        frontWall.position.set(0, 7, -8);
        frontWall.receiveShadow = true;
        this.scene.add(frontWall);

        // Left Wall (x = -12)
        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), wallMat);
        leftWall.position.set(-12, 7, 4);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);

        // Right Wall (x = 12)
        const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), wallMat);
        rightWall.position.set(12, 7, 4);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);

        // Ceiling with Gothic crossbeams
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(24, 32), wallMat);
        ceiling.position.set(0, 14, 4);
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);

        // Gothic Stone Pillars (4 pairs)
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0x403d45,
            roughness: 0.85
        });

        const pillarZ = [-4, 2, 8, 14];
        pillarZ.forEach(pz => {
            [-8, 8].forEach(px => {
                const pillarGroup = new THREE.Group();
                pillarGroup.position.set(px, 0, pz);

                // Base
                const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.4), pillarMat);
                base.position.y = 0.4;
                base.castShadow = true;
                base.receiveShadow = true;
                pillarGroup.add(base);

                // Shaft (Octagonal fluted column)
                const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 12.4, 8), pillarMat);
                shaft.position.y = 7.0;
                shaft.castShadow = true;
                shaft.receiveShadow = true;
                pillarGroup.add(shaft);

                // Capital
                const capital = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), pillarMat);
                capital.position.y = 13.6;
                pillarGroup.add(capital);

                this.scene.add(pillarGroup);
            });

            // Vaulted ribbed arch across ceiling between pillars
            const archCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-8, 13.2, pz),
                new THREE.Vector3(-4, 13.9, pz),
                new THREE.Vector3(0, 14.0, pz),
                new THREE.Vector3(4, 13.9, pz),
                new THREE.Vector3(8, 13.2, pz)
            ]);
            const archGeom = new THREE.TubeGeometry(archCurve, 16, 0.35, 6, false);
            const archMesh = new THREE.Mesh(archGeom, pillarMat);
            this.scene.add(archMesh);
        });

        // Grand Gothic Stained-Glass Window on back wall
        this.buildGothicWindow();

        // Atmospheric Ambient Lighting
        const ambLight = new THREE.AmbientLight(0x283248, 0.65);
        this.scene.add(ambLight);

        // Cool Moonlight streaming through the cathedral window
        const moonLight = new THREE.DirectionalLight(0x8fa8d6, 1.1);
        moonLight.position.set(0, 11, 15.5);
        moonLight.target.position.set(0, 1.5, 0);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        moonLight.shadow.bias = -0.0005;
        this.scene.add(moonLight);
        this.scene.add(moonLight.target);
    }

    buildGothicWindow() {
        const windowGroup = new THREE.Group();
        windowGroup.position.set(0, 7.5, 15.9);

        // Window Frame (pointed arch shape)
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x18161c, roughness: 0.9 });
        const glassMat = new THREE.MeshBasicMaterial({
            color: 0x90b5ea,
            transparent: true,
            opacity: 0.55
        });

        const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 8.5), glassMat);
        windowGroup.add(windowMesh);

        // Mullions / Tracery (gothic stone dividers)
        for (let x = -2; x <= 2; x += 1.3) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 8.5, 0.15), frameMat);
            bar.position.x = x;
            windowGroup.add(bar);
        }

        for (let y = -3; y <= 3; y += 1.5) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.12, 0.15), frameMat);
            bar.position.y = y;
            windowGroup.add(bar);
        }

        // Rosette circle tracery at top
        const circleRim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.1, 8, 24), frameMat);
        circleRim.position.y = 2.2;
        windowGroup.add(circleRim);

        this.scene.add(windowGroup);
    }

    buildFloatingCandles() {
        const candleWaxMat = new THREE.MeshStandardMaterial({
            color: 0xfdf6e2,
            roughness: 0.4
        });

        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xffaa22
        });

        const candlePositions = [
            [-3.5, 5.2, 1.5], [3.2, 5.8, 1.2], [-1.8, 6.4, 3.5], [2.2, 6.1, 4.2],
            [-4.5, 5.5, 6.0], [4.2, 5.3, 6.5], [0.0, 7.2, 2.0], [-2.8, 6.8, 7.5],
            [2.5, 6.5, 8.2], [-1.0, 5.9, 9.5], [1.2, 5.6, 10.2], [-3.8, 7.1, 11.5],
            [3.6, 6.9, 11.0], [0.0, 6.3, 12.5], [-5.2, 5.7, 4.0], [5.0, 6.0, 3.5]
        ];

        candlePositions.forEach((pos, idx) => {
            const candleGroup = new THREE.Group();
            candleGroup.position.set(...pos);

            // Candle Wax Body
            const waxHeight = 0.35 + (idx % 3) * 0.08;
            const waxGeom = new THREE.CylinderGeometry(0.045, 0.045, waxHeight, 10);
            const waxMesh = new THREE.Mesh(waxGeom, candleWaxMat);
            waxMesh.position.y = 0;
            candleGroup.add(waxMesh);

            // Wick
            const wickGeom = new THREE.CylinderGeometry(0.005, 0.005, 0.05, 6);
            const wickMesh = new THREE.Mesh(wickGeom, new THREE.MeshBasicMaterial({ color: 0x111111 }));
            wickMesh.position.y = waxHeight / 2 + 0.025;
            candleGroup.add(wickMesh);

            // Flame teardrop
            const flameGeom = new THREE.ConeGeometry(0.028, 0.08, 8);
            const flameMesh = new THREE.Mesh(flameGeom, flameMat);
            flameMesh.position.y = waxHeight / 2 + 0.07;
            candleGroup.add(flameMesh);

            // Flame Glow Halo
            const glowGeom = new THREE.SphereGeometry(0.065, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0xffcc44,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            const glowMesh = new THREE.Mesh(glowGeom, glowMat);
            glowMesh.position.y = waxHeight / 2 + 0.07;
            candleGroup.add(glowMesh);

            // Add dynamic light to selected candles (to maintain 60fps performance)
            if (idx % 2 === 0) {
                const candleLight = new THREE.PointLight(0xffb84d, 0.85, 12, 1.8);
                candleLight.position.y = waxHeight / 2 + 0.1;
                candleGroup.add(candleLight);
                this.flickerLights.push(candleLight);
            }

            this.scene.add(candleGroup);
            this.floatingCandles.push({
                group: candleGroup,
                baseY: pos[1],
                phase: idx * 0.45,
                bobSpeed: 1.1 + (idx % 4) * 0.25,
                flame: flameMesh
            });
        });
    }

    buildTrainingDummy() {
        const dummyGroup = new THREE.Group();
        dummyGroup.position.set(0, 0, 7.5);
        dummyGroup.rotation.y = Math.PI; // faces Harry

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.7 });
        const strawMat = new THREE.MeshStandardMaterial({ color: 0xb59864, roughness: 0.9 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.5, metalness: 0.6 });

        // Heavy stone circular base
        const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.25, 16), ironMat);
        baseMesh.position.y = 0.125;
        baseMesh.receiveShadow = true;
        dummyGroup.add(baseMesh);

        // Center support post
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.6, 8), woodMat);
        post.position.y = 0.95;
        post.castShadow = true;
        dummyGroup.add(post);

        // Articulated Torso (Padded practice vest)
        const torsoPivot = new THREE.Group();
        torsoPivot.position.y = 1.0;
        dummyGroup.add(torsoPivot);
        this.dummyTorso = torsoPivot;

        const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.21, 0.65, 12), strawMat);
        torsoMesh.position.y = 0.35;
        torsoMesh.castShadow = true;
        torsoPivot.add(torsoMesh);

        // Target Bullseye Sigil on chest
        const targetMat = new THREE.MeshBasicMaterial({ color: 0xaa2222 });
        const targetCircle = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), targetMat);
        targetCircle.position.set(0, 0.42, 0.22);
        torsoPivot.add(targetCircle);

        const innerCircle = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        innerCircle.position.set(0, 0.42, 0.225);
        torsoPivot.add(innerCircle);

        // Head (spherical wooden dummy head)
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), woodMat);
        headMesh.position.y = 0.82;
        headMesh.castShadow = true;
        torsoPivot.add(headMesh);

        // Dummy Left Arm (Shield pose)
        const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8), woodMat);
        leftArm.position.set(-0.32, 0.48, 0.08);
        leftArm.rotation.z = 0.7;
        torsoPivot.add(leftArm);

        // Dummy Right Arm (Wand arm pointing forward)
        const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 8), woodMat);
        rightArm.position.set(0.32, 0.48, 0.12);
        rightArm.rotation.x = -0.5;
        rightArm.rotation.z = -0.4;
        torsoPivot.add(rightArm);

        // The Training Wand (held in dummy's hand)
        this.dummyWand = new THREE.Group();
        this.dummyWand.position.copy(this.dummyWandOriginalPos);
        this.dummyWand.rotation.copy(this.dummyWandOriginalRot);
        torsoPivot.add(this.dummyWand);

        const wandShaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.02, 0.38, 8),
            new THREE.MeshStandardMaterial({ color: 0x4a2c16, roughness: 0.5 })
        );
        wandShaft.rotation.x = Math.PI / 2;
        wandShaft.castShadow = true;
        this.dummyWand.add(wandShaft);

        // Wand glow tip indicator
        const wandTipGlow = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff6644 })
        );
        wandTipGlow.position.z = 0.22;
        this.dummyWand.add(wandTipGlow);

        this.dummy = dummyGroup;
        this.scene.add(dummyGroup);
    }

    buildCauldron() {
        const cauldronGroup = new THREE.Group();
        cauldronGroup.position.set(-4.2, this.cauldronBaseY, 3.8);

        // Antique Stone Table / Pedestal
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x444248, roughness: 0.85 });
        const table = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 1.0, 16), tableMat);
        table.position.set(-4.2, 0.5, 3.8);
        table.receiveShadow = true;
        this.scene.add(table);

        // Cast Iron Cauldron
        const ironMat = new THREE.MeshStandardMaterial({
            color: 0x1b1c1e,
            roughness: 0.45,
            metalness: 0.75
        });

        // Belly
        const bellyGeom = new THREE.SphereGeometry(0.7, 18, 18);
        bellyGeom.scale(1.0, 0.85, 1.0);
        const belly = new THREE.Mesh(bellyGeom, ironMat);
        belly.castShadow = true;
        cauldronGroup.add(belly);

        // Flared Rim
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 12, 24), ironMat);
        rim.position.y = 0.52;
        rim.rotation.x = Math.PI / 2;
        cauldronGroup.add(rim);

        // 3 Clawed Feet
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.28, 8), ironMat);
            leg.position.set(Math.cos(angle) * 0.48, -0.62, Math.sin(angle) * 0.48);
            cauldronGroup.add(leg);
        }

        // Side Ring Handles
        [-1, 1].forEach(side => {
            const handle = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), ironMat);
            handle.position.set(side * 0.7, 0.2, 0);
            handle.rotation.y = Math.PI / 2;
            cauldronGroup.add(handle);
        });

        // Glowing Bubbling Potion Liquid inside cauldron
        const potionMat = new THREE.MeshBasicMaterial({
            color: 0x22eeaa
        });
        const potionMesh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), potionMat);
        potionMesh.position.y = 0.45;
        potionMesh.rotation.x = -Math.PI / 2;
        cauldronGroup.add(potionMesh);

        // Potion internal glow light
        const potionLight = new THREE.PointLight(0x22eeaa, 1.2, 5, 2.0);
        potionLight.position.y = 0.65;
        cauldronGroup.add(potionLight);

        this.cauldron = cauldronGroup;
        this.scene.add(cauldronGroup);
    }

    buildAncientChest() {
        const chestPlinth = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.25, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x3d3a42, roughness: 0.9 })
        );
        chestPlinth.position.set(4.2, 0.125, 3.8);
        chestPlinth.receiveShadow = true;
        this.scene.add(chestPlinth);

        const chestGroup = new THREE.Group();
        chestGroup.position.set(4.2, 0.25, 3.8);
        chestGroup.rotation.y = -0.3; // slightly angled toward Harry

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x482a17, roughness: 0.75 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xc89b3c, roughness: 0.35, metalness: 0.8 });

        // Chest Lower Body
        const bodyGeom = new THREE.BoxGeometry(1.3, 0.65, 0.85);
        const body = new THREE.Mesh(bodyGeom, woodMat);
        body.position.y = 0.325;
        body.castShadow = true;
        chestGroup.add(body);

        // Brass Corner Straps
        const strapMat = brassMat;
        [-0.6, 0.6].forEach(x => {
            const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.66, 0.86), strapMat);
            strap.position.set(x, 0.325, 0);
            chestGroup.add(strap);
        });

        // Hinged Chest Lid (Hinged at back edge z = -0.425, y = 0.65)
        const lidHinge = new THREE.Group();
        lidHinge.position.set(0, 0.65, -0.425);
        chestGroup.add(lidHinge);
        this.chestLid = lidHinge;

        // Curved / Arched Lid Mesh
        const lidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.425, 0.425, 1.3, 16, 1, false, 0, Math.PI), woodMat);
        lidMesh.rotation.z = Math.PI / 2;
        lidMesh.position.set(0, 0, 0.425);
        lidMesh.castShadow = true;
        lidHinge.add(lidMesh);

        // Brass straps on lid
        [-0.6, 0.6].forEach(x => {
            const lidStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.435, 0.435, 0.08, 16, 1, false, 0, Math.PI), strapMat);
            lidStrap.rotation.z = Math.PI / 2;
            lidStrap.position.set(x, 0, 0.425);
            lidHinge.add(lidStrap);
        });

        // Front Lock Hasp
        const hasp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.03), brassMat);
        hasp.position.set(0, -0.05, 0.86);
        lidHinge.add(hasp);

        // The Enchanted Padlock (locked initially)
        this.chestPadlock = new THREE.Group();
        this.chestPadlock.position.set(0, 0.58, 0.44);
        chestGroup.add(this.chestPadlock);

        // Padlock body
        const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.06), brassMat);
        this.chestPadlock.add(lockBody);

        // Padlock shackle
        const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16, Math.PI), brassMat);
        shackle.position.y = 0.08;
        this.chestPadlock.add(shackle);

        // Keyhole
        const keyhole = new THREE.Mesh(new THREE.CircleGeometry(0.02, 8), new THREE.MeshBasicMaterial({ color: 0x111111 }));
        keyhole.position.z = 0.032;
        this.chestPadlock.add(keyhole);

        // Inside Chest: The Sorcerer's Relic (glowing magical gem)
        this.chestRelic = new THREE.Group();
        this.chestRelic.position.set(0, 0.42, 0);
        chestGroup.add(this.chestRelic);

        const gemGeom = new THREE.OctahedronGeometry(0.16, 1);
        const gemMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const gemMesh = new THREE.Mesh(gemGeom, gemMat);
        this.chestRelic.add(gemMesh);

        this.chestRelicLight = new THREE.PointLight(0xffb700, 0, 8, 2);
        this.chestRelicLight.position.y = 0.2;
        this.chestRelic.add(this.chestRelicLight);

        this.chest = chestGroup;
        this.scene.add(chestGroup);
    }

    buildGrimoireAndPedestal() {
        // High stone pedestal at back left
        const pedMat = new THREE.MeshStandardMaterial({ color: 0x484550, roughness: 0.8 });
        const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 2.3, 12), pedMat);
        pedBase.position.set(this.grimoirePedestalPos.x, 1.15, this.grimoirePedestalPos.z);
        pedBase.receiveShadow = true;
        this.scene.add(pedBase);

        const pedTop = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.4, 0.2, 12), pedMat);
        pedTop.position.set(this.grimoirePedestalPos.x, 2.25, this.grimoirePedestalPos.z);
        this.scene.add(pedTop);

        // The Ancient Grimoire (Spellbook)
        const bookGroup = new THREE.Group();
        bookGroup.position.copy(this.grimoirePedestalPos);
        bookGroup.position.y = 2.45;
        bookGroup.rotation.y = 0.4;

        const coverMat = new THREE.MeshStandardMaterial({ color: 0x1c3a63, roughness: 0.6 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.35, metalness: 0.85 });
        const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.9 });

        // Book Cover
        const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.6), coverMat);
        coverMesh.castShadow = true;
        bookGroup.add(coverMesh);

        // Pages block
        const pagesMesh = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.09, 0.56), pagesMat);
        pagesMesh.position.x = 0.02;
        bookGroup.add(pagesMesh);

        // Golden Crest on cover
        const crestMesh = new THREE.Mesh(new THREE.CircleGeometry(0.1, 12), goldMat);
        crestMesh.rotation.x = -Math.PI / 2;
        crestMesh.position.set(0, 0.062, 0);
        bookGroup.add(crestMesh);

        // Book magical aura light
        this.grimoireLight = new THREE.PointLight(0x55aaff, 0.6, 3, 2);
        this.grimoireLight.position.y = 0.2;
        bookGroup.add(this.grimoireLight);

        this.grimoire = bookGroup;
        this.scene.add(bookGroup);
    }

    buildClassroomDecorations() {
        // Teacher's antique desk at back
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.7 });
        const desk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 1.6), deskMat);
        desk.position.set(0, 0.45, 13.5);
        desk.castShadow = true;
        desk.receiveShadow = true;
        this.scene.add(desk);

        // Bookshelves against walls
        [-10.5, 10.5].forEach(x => {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 4.5), deskMat);
            shelf.position.set(x, 2.75, 4.0);
            shelf.castShadow = true;
            this.scene.add(shelf);
        });

        // Gryffindor Wall Banners
        [-6.5, 6.5].forEach(x => {
            const bannerGeom = new THREE.PlaneGeometry(1.6, 4.2);
            const bannerCanvas = document.createElement('canvas');
            bannerCanvas.width = 128;
            bannerCanvas.height = 256;
            const bctx = bannerCanvas.getContext('2d');
            bctx.fillStyle = '#7a0e12';
            bctx.fillRect(0, 0, 128, 256);
            bctx.strokeStyle = '#d4af37';
            bctx.lineWidth = 8;
            bctx.strokeRect(4, 4, 120, 248);
            bctx.fillStyle = '#d4af37';
            bctx.font = 'bold 64px serif';
            bctx.textAlign = 'center';
            bctx.fillText('🦁', 64, 130);

            const bannerTex = new THREE.CanvasTexture(bannerCanvas);
            const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.8 });
            const bannerMesh = new THREE.Mesh(bannerGeom, bannerMat);
            bannerMesh.position.set(x, 8.5, 15.85);
            bannerMesh.rotation.y = Math.PI;
            this.scene.add(bannerMesh);
        });
    }

    update(delta, time) {
        // 1. Floating candles gentle oscillation
        this.floatingCandles.forEach(c => {
            c.group.position.y = c.baseY + Math.sin(time * c.bobSpeed + c.phase) * 0.12;
            c.flame.scale.y = 1.0 + Math.sin(time * 8.0 + c.phase) * 0.18;
        });

        // 2. Candle lights organic flicker
        this.flickerLights.forEach(light => {
            light.intensity = 0.85 + (Math.random() - 0.5) * 0.12;
        });

        // 3. Dummy Wand physics (after Expelliarmus)
        if (this.dummyWandState === 'flying') {
            this.dummyWandFlyTime += delta;
            const t = Math.min(1.0, this.dummyWandFlyTime / 0.8);

            // Parabolic arc trajectory
            const p = new THREE.Vector3().lerpVectors(this.dummyWandFlyOrigin, this.dummyWandFlyTarget, t);
            // Arc height
            p.y += Math.sin(t * Math.PI) * 1.8;

            this.dummyWand.position.copy(p);
            // Violent spin while disarmed
            this.dummyWand.rotation.x += delta * 18.0;
            this.dummyWand.rotation.y += delta * 14.0;
            this.dummyWand.rotation.z += delta * 9.0;

            if (t >= 1.0) {
                this.dummyWandState = 'ground';
                this.dummyWand.position.copy(this.dummyWandFlyTarget);
                this.dummyWand.rotation.set(Math.PI / 2, 0, 0.4);
            }
        }

        // 4. Dummy recoil wobble dampening
        if (this.dummyTorso && this.dummyTorso.rotation.x !== 0) {
            this.dummyTorso.rotation.x = THREE.MathUtils.lerp(this.dummyTorso.rotation.x, 0, delta * 5.0);
        }

        // 5. Cauldron Levitation physics (Wingardium Leviosa)
        if (this.cauldron) {
            this.cauldron.position.y = THREE.MathUtils.lerp(this.cauldron.position.y, this.cauldronTargetY, delta * 3.5);
            if (this.cauldronIsLevitating) {
                // Gentle floating bob & rotate in air
                this.cauldron.position.y += Math.sin(time * 2.5) * 0.004;
                this.cauldron.rotation.y += delta * 0.4;
                this.cauldron.rotation.z = Math.sin(time * 1.8) * 0.05;
            } else {
                this.cauldron.rotation.z = THREE.MathUtils.lerp(this.cauldron.rotation.z, 0, delta * 4.0);
            }
        }

        // 6. Chest Opening physics (Alohomora)
        if (this.chestLid) {
            this.chestLid.rotation.x = THREE.MathUtils.lerp(this.chestLid.rotation.x, this.chestLidAngle, delta * 4.0);
            if (this.chestState === 'open') {
                this.chestRelic.rotation.y += delta * 1.5;
                this.chestRelicLight.intensity = THREE.MathUtils.lerp(this.chestRelicLight.intensity, 2.5, delta * 4.0);
            } else {
                this.chestRelicLight.intensity = THREE.MathUtils.lerp(this.chestRelicLight.intensity, 0, delta * 4.0);
            }
        }

        // 7. Grimoire flight physics (Accio)
        if (this.grimoireState === 'flying') {
            this.grimoireFlyTime += delta;
            const t = Math.min(1.0, this.grimoireFlyTime / 0.95);

            // Smooth cubic easing for high speed approach
            const easeT = t * t * (3 - 2 * t);

            // Interpolate position along arc curve
            const currentPos = new THREE.Vector3().lerpVectors(this.grimoireFlyOrigin, this.grimoireHandTarget, easeT);
            // Dynamic lift arc
            currentPos.y += Math.sin(t * Math.PI) * 1.2;

            this.grimoire.position.copy(currentPos);
            this.grimoire.rotation.x += delta * 6.0;
            this.grimoire.rotation.y += delta * 8.0;

            if (t >= 1.0) {
                this.grimoireState = 'held';
                this.grimoire.position.copy(this.grimoireHandTarget);
                this.grimoire.rotation.set(0.3, 0.4, -0.2);
            }
        } else if (this.grimoireState === 'returning') {
            this.grimoireFlyTime += delta;
            const t = Math.min(1.0, this.grimoireFlyTime / 1.0);
            const easeT = t * t * (3 - 2 * t);
            const currentPos = new THREE.Vector3().lerpVectors(this.grimoireHandTarget, this.grimoirePedestalPos, easeT);
            currentPos.y = THREE.MathUtils.lerp(this.grimoireHandTarget.y, 2.45, easeT) + Math.sin(t * Math.PI) * 0.8;
            this.grimoire.position.copy(currentPos);
            this.grimoire.rotation.y += delta * 3.0;

            if (t >= 1.0) {
                this.grimoireState = 'pedestal';
                this.grimoire.position.copy(this.grimoirePedestalPos);
                this.grimoire.position.y = 2.45;
                this.grimoire.rotation.set(0, 0.4, 0);
            }
        }
    }

    // Interactive Trigger Methods
    triggerExpelliarmusDisarm() {
        if (this.dummyWandState === 'held') {
            this.dummyWandState = 'flying';
            this.dummyWandFlyTime = 0;

            // Compute current world position of wand
            const worldPos = new THREE.Vector3();
            this.dummyWand.getWorldPosition(worldPos);

            // Detach to scene root so it can fly freely in world space
            this.scene.attach(this.dummyWand);
            this.dummyWandFlyOrigin.copy(worldPos);

            // Recoil dummy torso backwards
            if (this.dummyTorso) {
                this.dummyTorso.rotation.x = -0.38;
            }
            return true;
        }
        return false;
    }

    toggleCauldronLevitation() {
        this.cauldronIsLevitating = !this.cauldronIsLevitating;
        this.cauldronTargetY = this.cauldronIsLevitating ? 3.6 : this.cauldronBaseY;
        return this.cauldronIsLevitating;
    }

    unlockChest() {
        if (this.chestState === 'locked') {
            this.chestState = 'open';
            this.chestLidAngle = -Math.PI * 0.45; // open ~80 degrees

            // Hide padlock with instant pop
            if (this.chestPadlock) {
                this.chestPadlock.visible = false;
            }
            return true;
        }
        return false;
    }

    triggerAccioSummon() {
        if (this.grimoireState === 'pedestal') {
            this.grimoireState = 'flying';
            this.grimoireFlyTime = 0;
            this.grimoireFlyOrigin.copy(this.grimoire.position);
            return 'summoned';
        } else if (this.grimoireState === 'held') {
            // Return to pedestal
            this.grimoireState = 'returning';
            this.grimoireFlyTime = 0;
            return 'returned';
        }
        return 'busy';
    }

    resetAll() {
        // 1. Reset Dummy Wand
        if (this.dummyWandState !== 'held') {
            this.dummyTorso.attach(this.dummyWand);
            this.dummyWand.position.copy(this.dummyWandOriginalPos);
            this.dummyWand.rotation.copy(this.dummyWandOriginalRot);
            this.dummyWandState = 'held';
        }
        if (this.dummyTorso) this.dummyTorso.rotation.x = 0;

        // 2. Reset Cauldron
        this.cauldronIsLevitating = false;
        this.cauldronTargetY = this.cauldronBaseY;
        if (this.cauldron) {
            this.cauldron.position.y = this.cauldronBaseY;
            this.cauldron.rotation.set(0, 0, 0);
        }

        // 3. Reset Chest & Padlock
        this.chestState = 'locked';
        this.chestLidAngle = 0;
        if (this.chestLid) this.chestLid.rotation.x = 0;
        if (this.chestPadlock) this.chestPadlock.visible = true;

        // 4. Reset Grimoire
        this.grimoireState = 'pedestal';
        if (this.grimoire) {
            this.grimoire.position.copy(this.grimoirePedestalPos);
            this.grimoire.position.y = 2.45;
            this.grimoire.rotation.set(0, 0.4, 0);
        }
    }
}
