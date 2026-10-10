/**
 * Harry Potter Spell-Casting Game - 3D Character Model & Skeletal Animator
 * Features:
 * - Recognizable Harry Potter model (round glasses, lightning scar, messy hair, green eyes)
 * - Hogwarts uniform (black robe with crimson lining, Gryffindor tie, sweater, collar)
 * - Holly wand with animated wand tip
 * - Procedural bone rig with smooth interpolation & unique spell casting animations
 */

class HarryCharacter {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.bones = {};
        this.wandTip = null;
        this.lumosLight = null;
        this.lumosGlowMesh = null;

        // Animation state
        this.currentAnim = 'idle';
        this.animTime = 0;
        this.animDuration = 1.0;
        this.isCasting = false;
        this.isLumosOn = false;
        this.heldObject = null; // for Accio caught book

        // Pose targets for smooth blending
        this.defaultPose = {};
        this.targetRotations = {};

        this.buildModel();
        this.scene.add(this.group);
    }

    buildModel() {
        // Materials
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xfbd0b0,
            roughness: 0.7,
            metalness: 0.05
        });

        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x1b140e,
            roughness: 0.85,
            metalness: 0.1
        });

        const robeBlackMat = new THREE.MeshStandardMaterial({
            color: 0x141416,
            roughness: 0.85,
            metalness: 0.05
        });

        const robeRedLiningMat = new THREE.MeshStandardMaterial({
            color: 0x821115,
            roughness: 0.7,
            metalness: 0.05
        });

        const sweaterMat = new THREE.MeshStandardMaterial({
            color: 0x2e353d,
            roughness: 0.9,
            metalness: 0.05
        });

        const shirtWhiteMat = new THREE.MeshStandardMaterial({
            color: 0xf4f5f8,
            roughness: 0.7,
            metalness: 0.05
        });

        const tieGryffindorMat = this.createTieMaterial();

        const pantsMat = new THREE.MeshStandardMaterial({
            color: 0x1f2329,
            roughness: 0.8,
            metalness: 0.05
        });

        const shoeMat = new THREE.MeshStandardMaterial({
            color: 0x0f1012,
            roughness: 0.35,
            metalness: 0.2
        });

        const glassesMat = new THREE.MeshStandardMaterial({
            color: 0x181818,
            roughness: 0.3,
            metalness: 0.85
        });

        const lensMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.35,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.7,
            reflectivity: 0.9
        });

        const wandWoodMat = new THREE.MeshStandardMaterial({
            color: 0x3d2314,
            roughness: 0.6,
            metalness: 0.1
        });

        // 1. Root / Pelvis (Center y ~ 1.0)
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.95;
        this.group.add(pelvis);
        this.bones.pelvis = pelvis;

        // 2. Torso / Sweater
        const torso = new THREE.Group();
        pelvis.add(torso);
        this.bones.torso = torso;

        // Torso mesh (Sweater)
        const sweaterGeom = new THREE.CylinderGeometry(0.24, 0.22, 0.52, 16);
        const sweaterMesh = new THREE.Mesh(sweaterGeom, sweaterMat);
        sweaterMesh.position.y = 0.26;
        sweaterMesh.castShadow = true;
        torso.add(sweaterMesh);

        // White shirt collar
        const collarGeom = new THREE.CylinderGeometry(0.13, 0.18, 0.1, 16);
        const collarMesh = new THREE.Mesh(collarGeom, shirtWhiteMat);
        collarMesh.position.y = 0.52;
        torso.add(collarMesh);

        // Gryffindor Tie
        const tieGeom = new THREE.BoxGeometry(0.065, 0.32, 0.02);
        const tieMesh = new THREE.Mesh(tieGeom, tieGryffindorMat);
        tieMesh.position.set(0, 0.34, 0.21);
        tieMesh.rotation.x = -0.05;
        torso.add(tieMesh);

        // Robe Outer Body (Flowing black cloak with open front)
        const robeBodyGeom = new THREE.CylinderGeometry(0.28, 0.38, 0.6, 16, 1, true, 0.4, Math.PI * 2 - 0.8);
        const robeBodyMesh = new THREE.Mesh(robeBodyGeom, robeBlackMat);
        robeBodyMesh.position.y = 0.24;
        robeBodyMesh.castShadow = true;
        torso.add(robeBodyMesh);

        // Robe Crimson Inner Lining (Visible at front edges)
        const liningGeom = new THREE.CylinderGeometry(0.278, 0.378, 0.59, 16, 1, true, 0.38, Math.PI * 2 - 0.76);
        const liningMesh = new THREE.Mesh(liningGeom, robeRedLiningMat);
        liningMesh.position.y = 0.24;
        liningMesh.scale.set(-1, 1, 1); // inner face
        torso.add(liningMesh);

        // Gryffindor Crest Badge on left chest
        const badgeGeom = new THREE.PlaneGeometry(0.065, 0.08);
        const badgeMat = this.createBadgeMaterial();
        const badgeMesh = new THREE.Mesh(badgeGeom, badgeMat);
        badgeMesh.position.set(-0.13, 0.38, 0.24);
        badgeMesh.rotation.y = -0.25;
        torso.add(badgeMesh);

        // Lower Robe Skirt (attached to pelvis, sways)
        const robeSkirt = new THREE.Group();
        robeSkirt.position.y = 0;
        pelvis.add(robeSkirt);
        this.bones.robeSkirt = robeSkirt;

        const skirtGeom = new THREE.CylinderGeometry(0.26, 0.48, 0.85, 16, 1, true, 0.3, Math.PI * 2 - 0.6);
        const skirtMesh = new THREE.Mesh(skirtGeom, robeBlackMat);
        skirtMesh.position.y = -0.42;
        skirtMesh.castShadow = true;
        robeSkirt.add(skirtMesh);

        const skirtLiningMesh = new THREE.Mesh(skirtGeom, robeRedLiningMat);
        skirtLiningMesh.position.y = -0.42;
        skirtLiningMesh.scale.set(-0.99, 1, 0.99);
        robeSkirt.add(skirtLiningMesh);

        // 3. Neck & Head
        const neck = new THREE.Group();
        neck.position.y = 0.55;
        torso.add(neck);
        this.bones.neck = neck;

        const head = new THREE.Group();
        head.position.y = 0.12;
        neck.add(head);
        this.bones.head = head;

        // Head Base
        const headGeom = new THREE.SphereGeometry(0.205, 24, 24);
        headGeom.scale(1.0, 1.15, 1.05);
        const headMesh = new THREE.Mesh(headGeom, skinMat);
        headMesh.castShadow = true;
        head.add(headMesh);

        // Nose
        const noseGeom = new THREE.ConeGeometry(0.032, 0.075, 8);
        const noseMesh = new THREE.Mesh(noseGeom, skinMat);
        noseMesh.position.set(0, -0.02, 0.215);
        noseMesh.rotation.x = 1.35;
        head.add(noseMesh);

        // Ears
        [-1, 1].forEach(side => {
            const earGeom = new THREE.SphereGeometry(0.045, 10, 10);
            earGeom.scale(0.5, 1.2, 0.8);
            const earMesh = new THREE.Mesh(earGeom, skinMat);
            earMesh.position.set(side * 0.19, 0, 0);
            earMesh.rotation.y = side * 0.2;
            head.add(earMesh);
        });

        // Vibrant Green Eyes (Harry's signature feature)
        [-1, 1].forEach(side => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.075, 0.035, 0.19);

            // Eyeball (white)
            const scleraGeom = new THREE.SphereGeometry(0.039, 16, 16);
            const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
            const scleraMesh = new THREE.Mesh(scleraGeom, scleraMat);
            scleraGeom.scale(1, 0.9, 0.6);
            eyeGroup.add(scleraMesh);

            // Iris (Vibrant Lily-Potter Emerald Green)
            const irisGeom = new THREE.CircleGeometry(0.022, 16);
            const irisMat = new THREE.MeshBasicMaterial({ color: 0x27ae60 });
            const irisMesh = new THREE.Mesh(irisGeom, irisMat);
            irisMesh.position.z = 0.024;
            eyeGroup.add(irisMesh);

            // Pupil (black)
            const pupilGeom = new THREE.CircleGeometry(0.011, 12);
            const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
            const pupilMesh = new THREE.Mesh(pupilGeom, pupilMat);
            pupilMesh.position.z = 0.026;
            eyeGroup.add(pupilMesh);

            head.add(eyeGroup);
        });

        // Eyebrows
        [-1, 1].forEach(side => {
            const browGeom = new THREE.BoxGeometry(0.07, 0.015, 0.015);
            const browMesh = new THREE.Mesh(browGeom, hairMat);
            browMesh.position.set(side * 0.075, 0.085, 0.207);
            browMesh.rotation.z = -side * 0.12;
            head.add(browMesh);
        });

        // Soft cheek color and a small smile give the face a friendly storybook look.
        const cheekMat = new THREE.MeshBasicMaterial({
            color: 0xe9968a,
            transparent: true,
            opacity: 0.42,
            depthWrite: false
        });
        [-1, 1].forEach(side => {
            const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.027, 16), cheekMat);
            cheek.position.set(side * 0.125, -0.055, 0.163);
            head.add(cheek);
        });

        const smileCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.035, -0.105, 0.187),
            new THREE.Vector3(0, -0.116, 0.194),
            new THREE.Vector3(0.035, -0.105, 0.187)
        ]);
        const smile = new THREE.Mesh(
            new THREE.TubeGeometry(smileCurve, 12, 0.004, 6, false),
            new THREE.MeshBasicMaterial({ color: 0x793e3b })
        );
        head.add(smile);

        // Lightning Bolt Scar on right forehead
        this.addLightningScar(head);

        // Round Dark Wire Glasses
        this.addGlasses(head, glassesMat, lensMat);

        // Messy Tousled Dark Hair
        this.addMessyHair(head, hairMat);
        head.scale.setScalar(1.3);

        // 4. Arms & Shoulders
        // Left Arm (Catching / Gesturing hand)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.28, 0.42, 0);
        torso.add(leftShoulder);
        this.bones.leftShoulder = leftShoulder;

        const leftUpperArm = new THREE.Group();
        leftShoulder.add(leftUpperArm);
        this.bones.leftUpperArm = leftUpperArm;

        // Sleeve upper
        const leftArmSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.32, 12), robeBlackMat);
        leftArmSleeve.position.y = -0.16;
        leftArmSleeve.castShadow = true;
        leftUpperArm.add(leftArmSleeve);

        const leftForearm = new THREE.Group();
        leftForearm.position.y = -0.32;
        leftUpperArm.add(leftForearm);
        this.bones.leftForearm = leftForearm;

        // Wide flared wizard sleeve
        const leftFlaredSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.28, 12), robeBlackMat);
        leftFlaredSleeve.position.y = -0.14;
        leftForearm.add(leftFlaredSleeve);

        // Left Hand
        const leftHand = new THREE.Group();
        leftHand.position.y = -0.28;
        leftForearm.add(leftHand);
        this.bones.leftHand = leftHand;

        const leftHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), skinMat);
        leftHandMesh.scale.set(0.8, 1.2, 0.9);
        leftHand.add(leftHandMesh);

        // Right Arm (Wand Hand)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.28, 0.42, 0);
        torso.add(rightShoulder);
        this.bones.rightShoulder = rightShoulder;

        const rightUpperArm = new THREE.Group();
        rightShoulder.add(rightUpperArm);
        this.bones.rightUpperArm = rightUpperArm;

        const rightArmSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.32, 12), robeBlackMat);
        rightArmSleeve.position.y = -0.16;
        rightArmSleeve.castShadow = true;
        rightUpperArm.add(rightArmSleeve);

        const rightForearm = new THREE.Group();
        rightForearm.position.y = -0.32;
        rightUpperArm.add(rightForearm);
        this.bones.rightForearm = rightForearm;

        const rightFlaredSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.28, 12), robeBlackMat);
        rightFlaredSleeve.position.y = -0.14;
        rightForearm.add(rightFlaredSleeve);

        // Right Hand
        const rightHand = new THREE.Group();
        rightHand.position.y = -0.28;
        rightForearm.add(rightHand);
        this.bones.rightHand = rightHand;

        const rightHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), skinMat);
        rightHandMesh.scale.set(0.8, 1.2, 0.9);
        rightHand.add(rightHandMesh);

        // The Holly Wand
        const wand = new THREE.Group();
        wand.position.set(0.02, -0.02, 0.05);
        wand.rotation.x = Math.PI / 2.3;
        rightHand.add(wand);
        this.bones.wand = wand;

        // Wand handle and shaft
        const wandHandleGeom = new THREE.CylinderGeometry(0.016, 0.02, 0.09, 8);
        const wandHandle = new THREE.Mesh(wandHandleGeom, wandWoodMat);
        wandHandle.position.y = 0.04;
        wand.add(wandHandle);

        const wandShaftGeom = new THREE.CylinderGeometry(0.007, 0.015, 0.32, 8);
        const wandShaft = new THREE.Mesh(wandShaftGeom, wandWoodMat);
        wandShaft.position.y = 0.24;
        wand.add(wandShaft);

        // Wand Tip (Anchor for spells, particles, and Lumos light)
        this.wandTip = new THREE.Group();
        this.wandTip.position.set(0, 0.41, 0);
        wand.add(this.wandTip);

        // Wand Tip Lumos Light
        this.lumosLight = new THREE.PointLight(0xfffae6, 0, 30, 1.6);
        this.lumosLight.castShadow = true;
        this.lumosLight.shadow.bias = -0.001;
        this.lumosLight.shadow.mapSize.width = 1024;
        this.lumosLight.shadow.mapSize.height = 1024;
        this.wandTip.add(this.lumosLight);

        // Lumos Visual Glow Orb Mesh
        const lumosGlowGeom = new THREE.SphereGeometry(0.07, 16, 16);
        const lumosGlowMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        this.lumosGlowMesh = new THREE.Mesh(lumosGlowGeom, lumosGlowMat);
        this.wandTip.add(this.lumosGlowMesh);

        // 5. Legs & Shoes
        [-1, 1].forEach(side => {
            const leg = new THREE.Group();
            leg.position.set(side * 0.12, 0, 0);
            pelvis.add(leg);

            // Pants
            const pantsGeom = new THREE.CylinderGeometry(0.08, 0.07, 0.85, 12);
            const pantsMesh = new THREE.Mesh(pantsGeom, pantsMat);
            pantsMesh.position.y = -0.42;
            pantsMesh.castShadow = true;
            leg.add(pantsMesh);

            // Shoes
            const shoeGeom = new THREE.BoxGeometry(0.1, 0.08, 0.22);
            const shoeMesh = new THREE.Mesh(shoeGeom, shoeMat);
            shoeMesh.position.set(0, -0.87, 0.04);
            shoeMesh.castShadow = true;
            leg.add(shoeMesh);

            if (side === -1) this.bones.leftLeg = leg;
            else this.bones.rightLeg = leg;
        });

        // Cache default rotations
        this.saveDefaultPose();
    }

    createTieMaterial() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Scarlet background
        ctx.fillStyle = '#7a0e12';
        ctx.fillRect(0, 0, 64, 256);

        // Gold diagonal stripes
        ctx.fillStyle = '#ffbe1a';
        ctx.lineWidth = 14;
        for (let y = -64; y < 320; y += 45) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(64, y + 40);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.65
        });
    }

    createBadgeMaterial() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');

        // Shield shape
        ctx.fillStyle = '#821115';
        ctx.beginPath();
        ctx.moveTo(32, 2);
        ctx.lineTo(60, 10);
        ctx.lineTo(58, 55);
        ctx.lineTo(32, 78);
        ctx.lineTo(6, 55);
        ctx.lineTo(4, 10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#f5c518';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Stylized golden lion
        ctx.fillStyle = '#f5c518';
        ctx.font = 'bold 26px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦁', 32, 48);

        const texture = new THREE.CanvasTexture(canvas);
        return new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    }

    addLightningScar(headGroup) {
        // Jagged lightning bolt scar on right forehead
        const points = [
            new THREE.Vector3(0.065, 0.13, 0.205),
            new THREE.Vector3(0.082, 0.108, 0.21),
            new THREE.Vector3(0.072, 0.106, 0.211),
            new THREE.Vector3(0.088, 0.085, 0.214)
        ];

        const scarCurve = new THREE.CatmullRomCurve3(points);
        const scarGeom = new THREE.TubeGeometry(scarCurve, 16, 0.0055, 6, false);
        const scarMat = new THREE.MeshBasicMaterial({
            color: 0xc42b2b
        });
        const scarMesh = new THREE.Mesh(scarGeom, scarMat);
        headGroup.add(scarMesh);
    }

    addGlasses(headGroup, frameMat, lensMat) {
        const glasses = new THREE.Group();
        glasses.position.set(0, 0.038, 0.208);

        [-1, 1].forEach(side => {
            // Round wire eye ring
            const rimGeom = new THREE.TorusGeometry(0.056, 0.006, 8, 24);
            const rimMesh = new THREE.Mesh(rimGeom, frameMat);
            rimMesh.position.x = side * 0.077;
            glasses.add(rimMesh);

            // Lens
            const lensGeom = new THREE.CircleGeometry(0.052, 24);
            const lensMesh = new THREE.Mesh(lensGeom, lensMat);
            lensMesh.position.x = side * 0.077;
            glasses.add(lensMesh);

            // Temple wire arms back to ears
            const armGeom = new THREE.CylinderGeometry(0.004, 0.004, 0.19, 6);
            const armMesh = new THREE.Mesh(armGeom, frameMat);
            armMesh.position.set(side * 0.137, 0, -0.09);
            armMesh.rotation.x = Math.PI / 2;
            glasses.add(armMesh);
        });

        // Center nose bridge
        const bridgeGeom = new THREE.CylinderGeometry(0.005, 0.005, 0.045, 6);
        const bridgeMesh = new THREE.Mesh(bridgeGeom, frameMat);
        bridgeMesh.rotation.z = Math.PI / 2;
        glasses.add(bridgeMesh);

        headGroup.add(glasses);
    }

    addMessyHair(headGroup, hairMat) {
        const hair = new THREE.Group();

        // Main hair volume cap
        const capGeom = new THREE.SphereGeometry(0.208, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
        capGeom.scale(1.02, 1.15, 1.05);
        const capMesh = new THREE.Mesh(capGeom, hairMat);
        capMesh.position.set(0, 0.02, -0.01);
        hair.add(capMesh);

        // Tousled spiky strands / tufts all over
        const tufts = [
            // Top messy spikes
            { pos: [0, 0.22, 0.05], rot: [0.3, 0.2, 0], scale: [0.08, 0.14, 0.07] },
            { pos: [0.08, 0.21, -0.02], rot: [0.1, -0.3, 0.4], scale: [0.07, 0.15, 0.07] },
            { pos: [-0.07, 0.21, 0.02], rot: [0.2, 0.4, -0.3], scale: [0.08, 0.13, 0.08] },
            { pos: [0.02, 0.22, -0.08], rot: [-0.4, 0.1, 0], scale: [0.07, 0.14, 0.07] },

            // Fringe / bangs (parted slightly on right to expose scar)
            { pos: [-0.09, 0.13, 0.18], rot: [0.5, 0.2, -0.3], scale: [0.065, 0.11, 0.05] },
            { pos: [-0.03, 0.14, 0.19], rot: [0.6, -0.1, -0.1], scale: [0.06, 0.12, 0.05] },
            { pos: [0.04, 0.15, 0.185], rot: [0.4, -0.4, 0.2], scale: [0.055, 0.1, 0.05] }, // parted over scar
            { pos: [0.11, 0.12, 0.17], rot: [0.5, -0.3, 0.4], scale: [0.065, 0.11, 0.05] },

            // Sideburns / sides
            { pos: [-0.18, 0.04, 0.06], rot: [0, 0, 0.2], scale: [0.05, 0.14, 0.08] },
            { pos: [0.18, 0.04, 0.06], rot: [0, 0, -0.2], scale: [0.05, 0.14, 0.08] },

            // Back fluff
            { pos: [0, 0.05, -0.18], rot: [-0.3, 0, 0], scale: [0.14, 0.16, 0.07] },
            { pos: [-0.08, 0.02, -0.17], rot: [-0.2, 0.3, 0], scale: [0.1, 0.14, 0.06] },
            { pos: [0.08, 0.02, -0.17], rot: [-0.2, -0.3, 0], scale: [0.1, 0.14, 0.06] }
        ];

        tufts.forEach(t => {
            const tuftGeom = new THREE.ConeGeometry(1, 1, 5);
            const tuft = new THREE.Mesh(tuftGeom, hairMat);
            tuft.position.set(...t.pos);
            tuft.rotation.set(...t.rot);
            tuft.scale.set(...t.scale);
            hair.add(tuft);
        });

        headGroup.add(hair);
    }

    saveDefaultPose() {
        this.defaultPose = {
            pelvis: { x: 0, y: 0, z: 0 },
            torso: { x: 0, y: 0, z: 0 },
            neck: { x: 0, y: 0, z: 0 },
            head: { x: 0, y: 0, z: 0 },
            leftUpperArm: { x: 0.15, y: 0, z: -0.25 },
            leftForearm: { x: 0.35, y: 0, z: 0.1 },
            leftHand: { x: 0, y: 0, z: 0 },
            rightUpperArm: { x: 0.3, y: -0.1, z: 0.2 },
            rightForearm: { x: 0.8, y: -0.15, z: -0.3 },
            rightHand: { x: 0.2, y: 0.1, z: 0 },
            robeSkirt: { x: 0, y: 0, z: 0 }
        };

        // Initialize target rotations
        for (const bone in this.defaultPose) {
            this.targetRotations[bone] = { ...this.defaultPose[bone] };
            if (this.bones[bone]) {
                this.bones[bone].rotation.set(
                    this.defaultPose[bone].x,
                    this.defaultPose[bone].y,
                    this.defaultPose[bone].z
                );
            }
        }
    }

    // Play Spell Casting Animations
    playCastAnimation(spellType, onCastPeak, onComplete) {
        this.isCasting = true;
        this.currentAnim = spellType;
        this.animTime = 0;
        this.onCastPeak = onCastPeak;
        this.onComplete = onComplete;
        this.peakTriggered = false;

        switch (spellType) {
            case 'expelliarmus':
                this.animDuration = 1.4;
                break;
            case 'wingardium':
                this.animDuration = 2.2;
                break;
            case 'lumos':
                this.animDuration = 1.6;
                break;
            case 'nox':
                this.animDuration = 1.3;
                break;
            case 'alohomora':
                this.animDuration = 1.8;
                break;
            case 'accio':
                this.animDuration = 2.0;
                break;
            default:
                this.animDuration = 1.2;
        }
    }

    setLumosVisual(active) {
        this.isLumosOn = active;
        if (!active) {
            this.lumosLight.intensity = 0;
            this.lumosGlowMesh.material.opacity = 0;
        }
    }

    update(delta) {
        // Handle Animations
        if (this.isCasting) {
            this.animTime += delta;
            const progress = Math.min(1.0, this.animTime / this.animDuration);

            this.evaluateCastAnimation(this.currentAnim, progress);

            if (progress >= 1.0) {
                this.isCasting = false;
                this.currentAnim = 'idle';
                this.resetToDefaultPose();
                if (this.onComplete) this.onComplete();
            }
        } else {
            // Natural Idle Animation (Breathing, subtle wand sway, posture)
            this.animTime += delta;
            const t = this.animTime;

            // Chest breathing
            const breath = Math.sin(t * 2.2) * 0.035;
            this.targetRotations.torso.x = this.defaultPose.torso.x + breath;
            this.targetRotations.neck.x = this.defaultPose.neck.x - breath * 0.5;

            // Subtle wand sway
            const wandSway = Math.cos(t * 1.8) * 0.05;
            this.targetRotations.rightForearm.x = this.defaultPose.rightForearm.x + wandSway;
            this.targetRotations.rightForearm.z = this.defaultPose.rightForearm.z + Math.sin(t * 1.4) * 0.03;

            // Idle robe skirt sway
            this.targetRotations.robeSkirt.z = Math.sin(t * 1.5) * 0.02;

            // Head curious tracking
            this.targetRotations.head.y = Math.sin(t * 0.7) * 0.06;
        }

        // Lumos smooth intensity interpolation
        if (this.isLumosOn) {
            this.lumosLight.intensity = THREE.MathUtils.lerp(this.lumosLight.intensity, 3.2, delta * 4.0);
            this.lumosGlowMesh.material.opacity = THREE.MathUtils.lerp(this.lumosGlowMesh.material.opacity, 0.95, delta * 4.0);
            // Subtle magical flame flicker on Lumos light
            this.lumosLight.intensity += (Math.random() - 0.5) * 0.08;
        } else {
            this.lumosLight.intensity = THREE.MathUtils.lerp(this.lumosLight.intensity, 0, delta * 5.0);
            this.lumosGlowMesh.material.opacity = THREE.MathUtils.lerp(this.lumosGlowMesh.material.opacity, 0, delta * 5.0);
        }

        // Smoothly interpolate bones towards targets
        const lerpSpeed = this.isCasting ? 12.0 : 6.0;
        for (const bone in this.targetRotations) {
            if (this.bones[bone]) {
                this.bones[bone].rotation.x = THREE.MathUtils.lerp(this.bones[bone].rotation.x, this.targetRotations[bone].x, delta * lerpSpeed);
                this.bones[bone].rotation.y = THREE.MathUtils.lerp(this.bones[bone].rotation.y, this.targetRotations[bone].y, delta * lerpSpeed);
                this.bones[bone].rotation.z = THREE.MathUtils.lerp(this.bones[bone].rotation.z, this.targetRotations[bone].z, delta * lerpSpeed);
            }
        }
    }

    evaluateCastAnimation(anim, p) {
        // Trigger peak effect callback
        if (!this.peakTriggered && p >= 0.38 && this.onCastPeak) {
            this.peakTriggered = true;
            this.onCastPeak();
        }

        switch (anim) {
            case 'expelliarmus': {
                // Dueling pullback (0 -> 0.35), violent forward thrust (0.35 -> 0.55), recoil & recover (0.55 -> 1.0)
                if (p < 0.35) {
                    const k = p / 0.35;
                    this.targetRotations.torso.y = -0.3 * k;
                    this.targetRotations.torso.x = -0.1 * k;
                    this.targetRotations.rightUpperArm.x = 0.3 + 0.5 * k;
                    this.targetRotations.rightUpperArm.z = 0.2 + 0.4 * k;
                    this.targetRotations.rightForearm.x = 0.8 + 0.8 * k; // pull back wand
                    this.targetRotations.leftUpperArm.z = -0.25 - 0.4 * k; // balance arm
                } else if (p < 0.55) {
                    const k = (p - 0.35) / 0.2;
                    this.targetRotations.torso.y = -0.3 + 0.45 * k;
                    this.targetRotations.torso.x = -0.1 + 0.25 * k;
                    this.targetRotations.rightUpperArm.x = 0.8 - 0.6 * k; // thrust forward
                    this.targetRotations.rightUpperArm.y = 0.2 * k;
                    this.targetRotations.rightUpperArm.z = 0.6 - 0.5 * k;
                    this.targetRotations.rightForearm.x = 1.6 - 1.45 * k; // extend wand directly forward
                    this.targetRotations.rightHand.x = -0.2 * k;
                } else {
                    const k = (p - 0.55) / 0.45;
                    this.lerpPose(this.targetRotations, this.defaultPose, k);
                }
                break;
            }

            case 'wingardium': {
                // "Swish and Flick":
                // 0 -> 0.4: Swish (wand swoops down-right and up in a curve)
                // 0.4 -> 0.65: Flick (crisp wrist snap downward and forward)
                // 0.65 -> 0.9: Hover hold (subtle telekinetic guidance)
                // 0.9 -> 1.0: Return
                if (p < 0.4) {
                    const k = p / 0.4;
                    this.targetRotations.rightUpperArm.x = 0.3 + 0.4 * Math.sin(k * Math.PI);
                    this.targetRotations.rightUpperArm.z = 0.2 + 0.6 * k;
                    this.targetRotations.rightForearm.x = 0.8 - 0.5 * k;
                    this.targetRotations.rightForearm.y = 0.4 * k;
                    this.targetRotations.leftUpperArm.z = -0.25 - 0.3 * k; // left hand guides
                } else if (p < 0.65) {
                    const k = (p - 0.4) / 0.25;
                    this.targetRotations.rightUpperArm.x = 0.3 + 0.3 * (1 - k);
                    this.targetRotations.rightUpperArm.z = 0.8 - 0.4 * k;
                    this.targetRotations.rightForearm.x = 0.3 + 0.6 * k; // sharp flick down
                    this.targetRotations.rightHand.x = 0.5 * k;
                } else if (p < 0.9) {
                    // Hold and gentle guidance float
                    const k = (p - 0.65) / 0.25;
                    this.targetRotations.rightForearm.x = 0.9 + Math.sin(k * Math.PI * 4) * 0.08;
                    this.targetRotations.leftForearm.x = 0.6 + Math.sin(k * Math.PI * 4) * 0.05;
                } else {
                    const k = (p - 0.9) / 0.1;
                    this.lerpPose(this.targetRotations, this.defaultPose, k);
                }
                break;
            }

            case 'lumos': {
                // Raise wand overhead/front (0 -> 0.4), ignite and hold (0.4 -> 0.8), settle to lantern carry (0.8 -> 1.0)
                if (p < 0.4) {
                    const k = p / 0.4;
                    this.targetRotations.rightUpperArm.x = 0.3 + 0.8 * k;
                    this.targetRotations.rightUpperArm.z = 0.2 + 0.3 * k;
                    this.targetRotations.rightForearm.x = 0.8 - 0.6 * k;
                    this.targetRotations.head.x = -0.2 * k; // look up at wand
                } else if (p < 0.8) {
                    this.targetRotations.rightUpperArm.x = 1.1;
                    this.targetRotations.rightForearm.x = 0.2;
                    this.targetRotations.head.x = -0.2;
                } else {
                    const k = (p - 0.8) / 0.2;
                    // Lower to lantern carry pose
                    const lanternPose = {
                        ...this.defaultPose,
                        rightUpperArm: { x: 0.5, y: -0.1, z: 0.25 },
                        rightForearm: { x: 0.4, y: 0.1, z: -0.2 }
                    };
                    this.lerpPose(this.targetRotations, lanternPose, k);
                }
                break;
            }

            case 'nox': {
                // Quick decisive extinguishing swipe across chest
                if (p < 0.4) {
                    const k = p / 0.4;
                    this.targetRotations.rightUpperArm.x = 0.5 + 0.4 * k;
                    this.targetRotations.rightUpperArm.y = -0.4 * k;
                    this.targetRotations.rightForearm.x = 0.5 + 0.5 * k;
                } else if (p < 0.7) {
                    const k = (p - 0.4) / 0.3;
                    this.targetRotations.rightUpperArm.x = 0.9 - 0.6 * k;
                    this.targetRotations.rightUpperArm.y = -0.4 + 0.8 * k; // sweep across
                    this.targetRotations.rightForearm.x = 1.0 - 0.8 * k;
                } else {
                    const k = (p - 0.7) / 0.3;
                    this.lerpPose(this.targetRotations, this.defaultPose, k);
                }
                break;
            }

            case 'alohomora': {
                // Turn towards chest (right), trace unlocking loop in air, point at lock
                if (p < 0.45) {
                    const k = p / 0.45;
                    this.targetRotations.torso.y = 0.4 * k;
                    this.targetRotations.head.y = 0.4 * k;
                    this.targetRotations.rightUpperArm.x = 0.3 + 0.4 * k;
                    // Circular trace motion
                    this.targetRotations.rightForearm.x = 0.8 + Math.sin(k * Math.PI * 2) * 0.3;
                    this.targetRotations.rightForearm.y = Math.cos(k * Math.PI * 2) * 0.3;
                } else if (p < 0.75) {
                    // Firm point at chest lock
                    this.targetRotations.torso.y = 0.4;
                    this.targetRotations.head.y = 0.4;
                    this.targetRotations.rightUpperArm.x = 0.6;
                    this.targetRotations.rightForearm.x = 0.3;
                } else {
                    const k = (p - 0.75) / 0.25;
                    this.lerpPose(this.targetRotations, this.defaultPose, k);
                }
                break;
            }

            case 'accio': {
                // Turn towards pedestal (left), summon pull gesture, left hand opens to catch grimoire
                if (p < 0.4) {
                    const k = p / 0.4;
                    this.targetRotations.torso.y = -0.35 * k;
                    this.targetRotations.head.y = -0.4 * k;
                    this.targetRotations.rightUpperArm.x = 0.3 + 0.5 * k;
                    this.targetRotations.rightForearm.x = 0.8 - 0.5 * k; // point at book
                    this.targetRotations.leftUpperArm.x = 0.15 + 0.4 * k;
                    this.targetRotations.leftForearm.x = 0.35 + 0.4 * k; // prepare catch hand
                } else if (p < 0.7) {
                    const k = (p - 0.4) / 0.3;
                    // Summon pull yank with wand
                    this.targetRotations.rightUpperArm.x = 0.8 + 0.3 * (1 - k);
                    this.targetRotations.rightForearm.x = 0.3 + 0.8 * k; // yank back
                    this.targetRotations.leftUpperArm.x = 0.55;
                    this.targetRotations.leftForearm.x = 0.75;
                } else if (p < 0.88) {
                    // Catch snap pose: left arm holds book firmly
                    this.targetRotations.leftUpperArm.x = 0.4;
                    this.targetRotations.leftForearm.x = 0.85;
                } else {
                    const k = (p - 0.88) / 0.12;
                    this.lerpPose(this.targetRotations, this.defaultPose, k);
                }
                break;
            }
        }
    }

    lerpPose(target, source, k) {
        for (const bone in source) {
            if (target[bone]) {
                target[bone].x = THREE.MathUtils.lerp(target[bone].x, source[bone].x, k);
                target[bone].y = THREE.MathUtils.lerp(target[bone].y, source[bone].y, k);
                target[bone].z = THREE.MathUtils.lerp(target[bone].z, source[bone].z, k);
            }
        }
    }

    resetToDefaultPose() {
        for (const bone in this.defaultPose) {
            this.targetRotations[bone] = { ...this.defaultPose[bone] };
        }
    }
}
