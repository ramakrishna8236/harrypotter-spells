/**
 * Harry Potter Spell-Casting Game - Web Audio API Sound Synthesizer
 * 100% Procedural & Self-Contained. No external audio files needed!
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.volume = 0.7;
        this.ambienceGain = null;
        this.ambienceRunning = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
            this.startAmbience();
        } catch (e) {
            console.warn('Web Audio API not supported or blocked:', e);
        }
    }

    resume() {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
        }
        return this.isMuted;
    }

    // Helper: create white noise buffer
    createNoiseBuffer(duration = 1.0) {
        if (!this.ctx) return null;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // Wand swish / swoosh sound
    playWandSwish(speed = 1.0) {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const dur = 0.28 / speed;

        // White noise filtered sweep
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(dur);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(4.0, now);
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + dur * 0.45);
        filter.frequency.exponentialRampToValueAtTime(350, now + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.65, now + dur * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        // Low tonal resonance
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + dur * 0.4);
        osc.frequency.exponentialRampToValueAtTime(140, now + dur);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(0.2, now + dur * 0.4);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        noise.start(now);
        osc.start(now);
        noise.stop(now + dur);
        osc.stop(now + dur);
    }

    // Expelliarmus: fiery discharge beam + explosive impact + wand clattering
    playExpelliarmus() {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;

        // 1. Initial powerful discharge zap
        const zap = this.ctx.createOscillator();
        zap.type = 'sawtooth';
        zap.frequency.setValueAtTime(1800, now);
        zap.frequency.exponentialRampToValueAtTime(120, now + 0.35);

        const zapFilter = this.ctx.createBiquadFilter();
        zapFilter.type = 'lowpass';
        zapFilter.frequency.setValueAtTime(4000, now);
        zapFilter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        const zapGain = this.ctx.createGain();
        zapGain.gain.setValueAtTime(0.8, now);
        zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        zap.connect(zapFilter);
        zapFilter.connect(zapGain);
        zapGain.connect(this.masterGain);
        zap.start(now);
        zap.stop(now + 0.35);

        // 2. High-energy electric crackle
        const crackle = this.ctx.createBufferSource();
        crackle.buffer = this.createNoiseBuffer(0.5);
        const crackleFilter = this.ctx.createBiquadFilter();
        crackleFilter.type = 'bandpass';
        crackleFilter.Q.setValueAtTime(8, now);
        crackleFilter.frequency.setValueAtTime(2400, now);
        crackleFilter.frequency.exponentialRampToValueAtTime(600, now + 0.4);

        const crackleGain = this.ctx.createGain();
        crackleGain.gain.setValueAtTime(0.6, now);
        crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        crackle.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(this.masterGain);
        crackle.start(now);
        crackle.stop(now + 0.5);

        // 3. Delayed impact on target (0.28s later)
        const impactTime = now + 0.28;
        const subBoom = this.ctx.createOscillator();
        subBoom.type = 'sine';
        subBoom.frequency.setValueAtTime(160, impactTime);
        subBoom.frequency.exponentialRampToValueAtTime(35, impactTime + 0.6);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.9, impactTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.6);

        subBoom.connect(subGain);
        subGain.connect(this.masterGain);
        subBoom.start(impactTime);
        subBoom.stop(impactTime + 0.6);

        // 4. Wand spinning and clattering on floor (0.6s later)
        setTimeout(() => {
            this.playWandClatter();
        }, 550);
    }

    // Wand clattering onto stone floor
    playWandClatter() {
        if (!this.ctx || this.isMuted) return;
        const clatterTimes = [0, 0.09, 0.16, 0.22, 0.27];
        clatterTimes.forEach((delay, idx) => {
            const hitTime = this.ctx.currentTime + delay;
            const click = this.ctx.createOscillator();
            click.type = 'triangle';
            click.frequency.setValueAtTime(700 + idx * 120, hitTime);
            click.frequency.exponentialRampToValueAtTime(250, hitTime + 0.05);

            const gain = this.ctx.createGain();
            const vol = 0.45 / (idx + 1);
            gain.gain.setValueAtTime(vol, hitTime);
            gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.05);

            click.connect(gain);
            gain.connect(this.masterGain);
            click.start(hitTime);
            click.stop(hitTime + 0.05);
        });
    }

    // Wingardium Leviosa: Swish & flick, ethereal harmonic chime, telekinetic drone
    playWingardium(isLifting = true) {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;

        if (isLifting) {
            // Swish and flick whoosh
            this.playWandSwish(1.2);

            // Ethereal rising chords (F#4, A#4, C#5, F5)
            const freqs = [370, 466, 554, 698, 880];
            freqs.forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + i * 0.09);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.001, now + i * 0.09);
                gain.gain.linearRampToValueAtTime(0.28, now + i * 0.09 + 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 1.8);

                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now + i * 0.09);
                osc.stop(now + i * 0.09 + 1.9);
            });

            // Sustained magical levitation hum
            const hum = this.ctx.createOscillator();
            hum.type = 'triangle';
            hum.frequency.setValueAtTime(220, now + 0.3);
            hum.frequency.linearRampToValueAtTime(277, now + 1.2);

            // Tremolo
            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(5.5, now);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(8, now);
            lfo.connect(hum.frequency);

            const humGain = this.ctx.createGain();
            humGain.gain.setValueAtTime(0.001, now + 0.3);
            humGain.gain.linearRampToValueAtTime(0.25, now + 0.8);
            humGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

            hum.connect(humGain);
            humGain.connect(this.masterGain);
            lfo.start(now);
            hum.start(now + 0.3);
            lfo.stop(now + 2.5);
            hum.stop(now + 2.5);
        } else {
            // Gentle descent and soft landing thud
            const desc = this.ctx.createOscillator();
            desc.type = 'sine';
            desc.frequency.setValueAtTime(320, now);
            desc.frequency.exponentialRampToValueAtTime(110, now + 0.8);

            const descGain = this.ctx.createGain();
            descGain.gain.setValueAtTime(0.3, now);
            descGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            desc.connect(descGain);
            descGain.connect(this.masterGain);
            desc.start(now);
            desc.stop(now + 0.8);

            // Soft wooden/iron thump
            setTimeout(() => {
                if (!this.ctx || this.isMuted) return;
                const t = this.ctx.currentTime;
                const thud = this.ctx.createOscillator();
                thud.type = 'sine';
                thud.frequency.setValueAtTime(120, t);
                thud.frequency.exponentialRampToValueAtTime(40, t + 0.25);
                const thudGain = this.ctx.createGain();
                thudGain.gain.setValueAtTime(0.5, t);
                thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                thud.connect(thudGain);
                thudGain.connect(this.masterGain);
                thud.start(t);
                thud.stop(t + 0.25);
            }, 750);
        }
    }

    // Lumos: Brilliant celestial strike chime & radiant light expansion
    playLumos() {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        this.playWandSwish(1.4);

        // Radiant crystal bell harmonics
        const harmonics = [1046.5, 1318.5, 1567.98, 2093.0, 3135.96]; // C6, E6, G6, C7, G7
        harmonics.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + 0.1);

            const gain = this.ctx.createGain();
            const delay = 0.1 + idx * 0.04;
            gain.gain.setValueAtTime(0.001, now + delay);
            gain.gain.linearRampToValueAtTime(0.3 / (idx + 1), now + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0005, now + delay + 2.2);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + delay);
            osc.stop(now + delay + 2.3);
        });

        // Warm shimmering resonance
        const shimmer = this.ctx.createOscillator();
        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(523.25, now + 0.2); // C5
        const shimGain = this.ctx.createGain();
        shimGain.gain.setValueAtTime(0.001, now + 0.2);
        shimGain.gain.linearRampToValueAtTime(0.2, now + 0.6);
        shimGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        shimmer.connect(shimGain);
        shimGain.connect(this.masterGain);
        shimmer.start(now + 0.2);
        shimmer.stop(now + 2.5);
    }

    // Nox: Snuffing whoosh, light vacuum extinguishment
    playNox() {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        this.playWandSwish(1.6);

        // Descending extinguishing vacuum whoosh
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.4);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.38);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.4);

        // Sub-bass puff
        const puff = this.ctx.createOscillator();
        puff.type = 'sine';
        puff.frequency.setValueAtTime(140, now);
        puff.frequency.exponentialRampToValueAtTime(30, now + 0.35);

        const puffGain = this.ctx.createGain();
        puffGain.gain.setValueAtTime(0.4, now);
        puffGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        puff.connect(puffGain);
        puffGain.connect(this.masterGain);
        puff.start(now);
        puff.stop(now + 0.35);
    }

    // Alohomora: Golden fairy chime stream + heavy lock tumbler click + wooden chest creak
    playAlohomora() {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        this.playWandSwish(1.1);

        // 1. Golden magical spark stream (fast pentatonic run)
        const notes = [659, 783, 987, 1174, 1318, 1567, 1975, 2349];
        notes.forEach((n, idx) => {
            const t = now + idx * 0.045;
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(n, t);

            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.2, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.45);
        });

        // 2. Mechanical brass tumbler unlocking click (two distinct crisp clacks)
        const lockTime = now + 0.48;
        [0, 0.06].forEach((offset, idx) => {
            const clickTime = lockTime + offset;
            const click = this.ctx.createOscillator();
            click.type = 'square';
            click.frequency.setValueAtTime(1400 + idx * 300, clickTime);
            click.frequency.exponentialRampToValueAtTime(400, clickTime + 0.04);

            const clickGain = this.ctx.createGain();
            clickGain.gain.setValueAtTime(0.65, clickTime);
            clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

            click.connect(clickGain);
            clickGain.connect(this.masterGain);
            click.start(clickTime);
            click.stop(clickTime + 0.05);
        });

        // 3. Wooden chest lid opening creak (0.7s later)
        setTimeout(() => {
            if (!this.ctx || this.isMuted) return;
            const t = this.ctx.currentTime;
            const creak = this.ctx.createOscillator();
            creak.type = 'sawtooth';
            creak.frequency.setValueAtTime(180, t);
            creak.frequency.linearRampToValueAtTime(260, t + 0.35);
            creak.frequency.linearRampToValueAtTime(190, t + 0.7);

            // Modulate frequency slightly for wooden creak texture
            const creakLfo = this.ctx.createOscillator();
            creakLfo.frequency.setValueAtTime(22, t);
            const lfoAmp = this.ctx.createGain();
            lfoAmp.gain.setValueAtTime(35, t);
            creakLfo.connect(creak.frequency);

            const creakFilter = this.ctx.createBiquadFilter();
            creakFilter.type = 'bandpass';
            creakFilter.Q.setValueAtTime(3, t);
            creakFilter.frequency.setValueAtTime(450, t);

            const creakGain = this.ctx.createGain();
            creakGain.gain.setValueAtTime(0.001, t);
            creakGain.gain.linearRampToValueAtTime(0.35, t + 0.15);
            creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

            creak.connect(creakFilter);
            creakFilter.connect(creakGain);
            creakGain.connect(this.masterGain);

            creakLfo.start(t);
            creak.start(t);
            creakLfo.stop(t + 0.8);
            creak.stop(t + 0.8);
        }, 650);
    }

    // Accio: Summoning tractor whistle, high-speed flight whoosh, crisp hand catch
    playAccio(phase = 'all') {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;

        if (phase === 'all' || phase === 'summon') {
            this.playWandSwish(1.3);

            // Rising tractor beam whistle (Doppler summoning frequency)
            const tractor = this.ctx.createOscillator();
            tractor.type = 'sine';
            tractor.frequency.setValueAtTime(350, now);
            tractor.frequency.exponentialRampToValueAtTime(1450, now + 0.75);

            const tractGain = this.ctx.createGain();
            tractGain.gain.setValueAtTime(0.001, now);
            tractGain.gain.linearRampToValueAtTime(0.4, now + 0.2);
            tractGain.gain.linearRampToValueAtTime(0.55, now + 0.6);
            tractGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

            tractor.connect(tractGain);
            tractGain.connect(this.masterGain);
            tractor.start(now);
            tractor.stop(now + 1.15);

            // Rushing air whoosh
            const air = this.ctx.createBufferSource();
            air.buffer = this.createNoiseBuffer(1.2);
            const airFilter = this.ctx.createBiquadFilter();
            airFilter.type = 'bandpass';
            airFilter.frequency.setValueAtTime(500, now + 0.2);
            airFilter.frequency.exponentialRampToValueAtTime(2600, now + 0.8);
            airFilter.frequency.exponentialRampToValueAtTime(700, now + 1.2);

            const airGain = this.ctx.createGain();
            airGain.gain.setValueAtTime(0.001, now + 0.2);
            airGain.gain.linearRampToValueAtTime(0.45, now + 0.8);
            airGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            air.connect(airFilter);
            airFilter.connect(airGain);
            airGain.connect(this.masterGain);
            air.start(now + 0.2);
            air.stop(now + 1.25);
        }

        // Satisfying catch snap (after 0.95 seconds)
        if (phase === 'all' || phase === 'catch') {
            const catchDelay = phase === 'all' ? 950 : 0;
            setTimeout(() => {
                if (!this.ctx || this.isMuted) return;
                const t = this.ctx.currentTime;

                // Crisp leather / book snap in hand
                const snap = this.ctx.createOscillator();
                snap.type = 'triangle';
                snap.frequency.setValueAtTime(900, t);
                snap.frequency.exponentialRampToValueAtTime(180, t + 0.08);

                const snapGain = this.ctx.createGain();
                snapGain.gain.setValueAtTime(0.7, t);
                snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

                snap.connect(snapGain);
                snapGain.connect(this.masterGain);
                snap.start(t);
                snap.stop(t + 0.1);

                // Thump of catching solid object
                const thump = this.ctx.createOscillator();
                thump.type = 'sine';
                thump.frequency.setValueAtTime(200, t);
                thump.frequency.exponentialRampToValueAtTime(65, t + 0.15);

                const thumpGain = this.ctx.createGain();
                thumpGain.gain.setValueAtTime(0.5, t);
                thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

                thump.connect(thumpGain);
                thumpGain.connect(this.masterGain);
                thump.start(t);
                thump.stop(t + 0.15);
            }, catchDelay);
        }
    }

    // Chamber Reset magical chime
    playReset() {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const chords = [523, 659, 783, 1046]; // C major restoration
        chords.forEach((c, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(c, now + idx * 0.06);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.7);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.75);
        });
    }

    // UI Click button sound
    playClick() {
        this.resume();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Subtle atmospheric castle drone (gentle wind, reverberant hum)
    startAmbience() {
        if (!this.ctx || this.ambienceRunning) return;
        this.ambienceRunning = true;

        const now = this.ctx.currentTime;
        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.setValueAtTime(0.001, now);
        this.ambienceGain.gain.linearRampToValueAtTime(0.08, now + 2.0);
        this.ambienceGain.connect(this.masterGain);

        // Very low sub harmonic drone
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(73.42, now); // D2

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110.0, now); // A2

        // Soft filtered atmospheric pinkish noise
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(5.0);
        noise.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(280, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.04, now);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ambienceGain);

        osc1.connect(this.ambienceGain);
        osc2.connect(this.ambienceGain);

        osc1.start(now);
        osc2.start(now);
        noise.start(now);
    }
}

// Global singleton instance
window.soundEngine = new SoundEngine();
