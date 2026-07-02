/* ==========================================================================
   URBAN HISTORY - SCÉNOGRAPHIE DE LA CULTURE URBAINE
   INTERACTIONS JS & GENERATION AUDIO PROCEDURALE (WEB AUDIO API)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // 1. GESTION DU CURSEUR PERSONNALISÉ NÉON
    // ==========================================================================
    const cursor = document.querySelector(".custom-cursor");
    const cursorGlow = document.querySelector(".custom-cursor-glow");
    
    if (cursor && cursorGlow) {
        document.addEventListener("mousemove", (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            
            cursorGlow.style.left = `${e.clientX}px`;
            cursorGlow.style.top = `${e.clientY}px`;
        });
        
        // Effets au survol des éléments interactifs
        const hoverables = document.querySelectorAll("a, button, select, .accordion-header, .filter-btn, .museum-card");
        hoverables.forEach(item => {
            item.addEventListener("mouseenter", () => {
                cursor.style.transform = "translate(-50%, -50%) scale(1.5)";
                cursor.style.backgroundColor = "var(--accent-neon-pink)";
                cursorGlow.style.transform = "translate(-50%, -50%) scale(1.3)";
                cursorGlow.style.borderColor = "var(--accent-neon-cyan)";
            });
            item.addEventListener("mouseleave", () => {
                cursor.style.transform = "translate(-50%, -50%) scale(1)";
                cursor.style.backgroundColor = "var(--accent-neon-cyan)";
                cursorGlow.style.transform = "translate(-50%, -50%) scale(1)";
                cursorGlow.style.borderColor = "var(--accent-neon-pink)";
            });
        });
    }

    // ==========================================================================
    // 2. TIMELINE ANIMÉE & INTERACTION AU SCROLL
    // ==========================================================================
    const timelineItems = document.querySelectorAll(".timeline-item");
    const timelineProgressBar = document.querySelector(".timeline-progress-bar");
    
    const updateTimeline = () => {
        let totalItems = timelineItems.length;
        let activeIndex = 0;
        
        timelineItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            if (rect.left < window.innerWidth * 0.7) {
                item.classList.add("active");
                activeIndex = index;
            } else {
                item.classList.remove("active");
            }
        });
        
        // Progression de la barre de progression
        if (totalItems > 1) {
            const progress = (activeIndex / (totalItems - 1)) * 100;
            if (timelineProgressBar) {
                timelineProgressBar.style.width = `${progress}%`;
            }
        }
    };
    
    const timelineWrapper = document.querySelector(".timeline-wrapper");
    if (timelineWrapper) {
        timelineWrapper.addEventListener("scroll", updateTimeline);
    }
    window.addEventListener("scroll", updateTimeline);
    updateTimeline();

    // ==========================================================================
    // 3. ACCORDÉON INTERACTIF (STALINGRAD)
    // ==========================================================================
    const accordionHeaders = document.querySelectorAll(".accordion-header");
    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const parent = header.parentElement;
            const content = header.nextElementSibling;
            
            // Fermer les autres accordéons
            document.querySelectorAll(".accordion-item").forEach(item => {
                if (item !== parent && item.classList.contains("active")) {
                    item.classList.remove("active");
                    item.querySelector(".accordion-content").style.maxHeight = null;
                }
            });
            
            // Ouvrir / fermer celui cliqué
            if (parent.classList.contains("active")) {
                parent.classList.remove("active");
                content.style.maxHeight = null;
            } else {
                parent.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // ==========================================================================
    // 4. SCROLL REVEAL (INTERSECTION OBSERVER)
    // ==========================================================================
    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    reveals.forEach(el => revealObserver.observe(el));

    // ==========================================================================
    // 5. FILTRAGE INTERACTIF DE LA GALERIE (EXPOSITION)
    // ==========================================================================
    const filterButtons = document.querySelectorAll(".filter-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");
    
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Mettre à jour l'état actif des boutons
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const filterValue = btn.getAttribute("data-filter");
            
            galleryItems.forEach(item => {
                const category = item.getAttribute("data-category");
                if (filterValue === "all" || category === filterValue) {
                    item.classList.remove("hidden");
                } else {
                    item.classList.add("hidden");
                }
            });
        });
    });

    // ==========================================================================
    // 6. LIGHTBOX MODAL POUR CARTES MUSÉALES
    // ==========================================================================
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxTitle = document.getElementById("lightboxTitle");
    const lightboxDate = document.getElementById("lightboxDate");
    const lightboxLoc = document.getElementById("lightboxLoc");
    const lightboxDesc = document.getElementById("lightboxDesc");
    const lightboxArchive = document.getElementById("lightboxArchive");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxDownloadBtn = document.getElementById("lightboxDownloadBtn");
    
    let currentDownloadUrl = "";
    let currentFilename = "exposition_photo.jpg";
    
    const museumCards = document.querySelectorAll(".museum-card");
    museumCards.forEach(card => {
        card.addEventListener("click", () => {
            const img = card.querySelector(".museum-img").src;
            const title = card.querySelector(".museum-title").innerText;
            const date = card.querySelector(".museum-date").innerText;
            const loc = card.querySelector(".museum-loc").innerText;
            const desc = card.querySelector(".museum-desc").innerText;
            const archive = card.querySelector(".museum-archive").innerText;
            
            lightboxImg.src = img;
            lightboxTitle.innerText = title;
            lightboxDate.innerText = date;
            lightboxLoc.innerText = loc;
            lightboxDesc.innerText = desc;
            lightboxArchive.innerText = archive;
            
            // Extraction de l'URL de base et construction de la version HD
            const baseUrl = img.split('?')[0];
            if (img.startsWith('http')) {
                currentDownloadUrl = `${baseUrl}?q=100&w=3200&auto=format&fit=crop`;
            } else {
                currentDownloadUrl = baseUrl; // Fichier local, déjà en haute résolution
            }
            
            // Assainir le nom de fichier pour le téléchargement
            const sanitizedTitle = title.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Retire les accents
                .replace(/[^a-z0-9]+/g, "_")                    // Remplace caractères spéciaux par _
                .trim();
            currentFilename = `expo_${sanitizedTitle}.jpg`;
            
            lightbox.classList.add("active");
        });
    });
    
    if (lightboxDownloadBtn) {
        lightboxDownloadBtn.addEventListener("click", async () => {
            if (!currentDownloadUrl) return;
            
            const originalText = lightboxDownloadBtn.innerHTML;
            lightboxDownloadBtn.innerHTML = `
                <svg class="icon-svg spinner-icon" viewBox="0 0 24 24" style="fill: #fff; width: 18px; height: 18px; margin-right: 8px; animation: spin-loader 1s linear infinite;"><path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 16v2c5.52 0 10-4.48 10-10h-2c0 4.41-3.59 8-8 8z"/></svg>
                Téléchargement...
            `;
            lightboxDownloadBtn.disabled = true;
            
            try {
                // Fetch de l'image et conversion en Blob pour forcer le téléchargement du navigateur
                const response = await fetch(currentDownloadUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = currentFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.warn("Échec du téléchargement direct (CORS / Local), ouverture dans un nouvel onglet.");
                // Fallback si la politique CORS ou le protocole local file:// bloque l'accès Blob
                window.open(currentDownloadUrl, "_blank");
            } finally {
                lightboxDownloadBtn.innerHTML = originalText;
                lightboxDownloadBtn.disabled = false;
            }
        });
    }
    
    // ==========================================================================
    // 6.b BOUTON DE TÉLÉCHARGEMENT GROUPÉ (Toutes les images HD)
    // ==========================================================================
    const downloadAllBtn = document.getElementById("downloadAllBtn");
    const localImagesList = [
        { url: "images/hero_bg.jpg", name: "expo_00_hero_background.jpg" },
        { url: "images/analysis_roots.jpg", name: "expo_01_roots_sociologiques.jpg" },
        { url: "images/analysis_stalingrad.jpg", name: "expo_02_stalingrad_underground.jpg" },
        { url: "images/analysis_pochoir.jpg", name: "expo_03_pochoir_francais.jpg" },
        { url: "images/analysis_skate.jpg", name: "expo_04_skateboard_streetwear.jpg" },
        { url: "images/gallery_roots_1.jpg", name: "expo_05_roots_enfants_bronx.jpg" },
        { url: "images/gallery_roots_2.jpg", name: "expo_06_roots_graffiti_metro.jpg" },
        { url: "images/gallery_pionniers_1.jpg", name: "expo_07_pionniers_blek_le_rat.jpg" },
        { url: "images/gallery_pionniers_2.jpg", name: "expo_08_pionniers_jef_aerosol.jpg" },
        { url: "images/gallery_stalingrad_1.jpg", name: "expo_09_stalingrad_breakdance.jpg" },
        { url: "images/gallery_stalingrad_2.jpg", name: "expo_10_stalingrad_criminal_art.jpg" },
        { url: "images/gallery_glisse_1.jpg", name: "expo_11_glisse_slalom_trocadero.jpg" },
        { url: "images/gallery_glisse_2.jpg", name: "expo_12_glisse_luxembourg_grind.jpg" },
        { url: "images/gallery_inst_1.jpg", name: "expo_13_inst_philharmonie_paris.jpg" },
        { url: "images/gallery_inst_2.jpg", name: "expo_14_inst_street_art_mural.jpg" }
    ];

    if (downloadAllBtn) {
        downloadAllBtn.addEventListener("click", () => {
            const originalText = downloadAllBtn.innerHTML;
            downloadAllBtn.innerHTML = `
                <svg class="icon-svg spinner-icon" viewBox="0 0 24 24" style="fill: #fff; width: 18px; height: 18px; margin-right: 8px; animation: spin-loader 1s linear infinite;"><path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 16v2c5.52 0 10-4.48 10-10h-2c0 4.41-3.59 8-8 8z"/></svg>
                Téléchargement...
            `;
            downloadAllBtn.disabled = true;

            localImagesList.forEach((img, index) => {
                setTimeout(() => {
                    const a = document.createElement("a");
                    a.href = img.url;
                    a.download = img.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    // Quand c'est fini pour la dernière image
                    if (index === localImagesList.length - 1) {
                        downloadAllBtn.innerHTML = originalText;
                        downloadAllBtn.disabled = false;
                    }
                }, index * 250); // Un délai de 250ms empêche le navigateur de bloquer les téléchargements simultanés
            });
        });
    }

    if (lightboxClose) {
        lightboxClose.addEventListener("click", () => {
            lightbox.classList.remove("active");
        });
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                lightbox.classList.remove("active");
            }
        });
    }

    // ==========================================================================
    // 7. INTERACTION DU TÉLÉPROMPTEUR (DISCOURS D'INAUGURATION)
    // ==========================================================================
    const speechLines = document.querySelectorAll(".speech-line");
    const telePlay = document.getElementById("telePlay");
    const telePause = document.getElementById("telePause");
    const teleReset = document.getElementById("teleReset");
    const teleSpeed = document.getElementById("teleSpeed");
    const teleViewport = document.getElementById("teleprompterViewport");
    const teleContent = document.getElementById("teleprompterContent");
    const teleprompterCard = document.querySelector(".teleprompter-card");
    
    let activeLineIndex = 0;
    let isPlayingSpeech = false;
    let speechTimer = null;
    
    const speedDelays = {
        slow: 4000,
        normal: 2500,
        fast: 1500
    };
    
    const highlightLine = (index) => {
        speechLines.forEach((line, idx) => {
            line.classList.remove("highlight", "past");
            if (idx === index) {
                line.classList.add("highlight");
            } else if (idx < index) {
                line.classList.add("past");
            }
        });
        
        // Centrer la ligne dans le viewport
        if (speechLines[index]) {
            const lineOffset = speechLines[index].offsetTop;
            const viewportHalfHeight = teleViewport.offsetHeight / 2;
            const lineHalfHeight = speechLines[index].offsetHeight / 2;
            
            // Calcul du défilement
            const scrollAmount = lineOffset - viewportHalfHeight + lineHalfHeight;
            teleContent.style.transform = `translateY(-${Math.max(0, scrollAmount)}px)`;
        }
    };
    
    const playNextSpeechLine = () => {
        if (activeLineIndex < speechLines.length) {
            highlightLine(activeLineIndex);
            
            let speed = teleSpeed.value;
            let delay = speedDelays[speed] || 2500;
            
            activeLineIndex++;
            speechTimer = setTimeout(playNextSpeechLine, delay);
        } else {
            stopSpeech();
        }
    };
    
    const startSpeech = () => {
        if (!isPlayingSpeech) {
            isPlayingSpeech = true;
            teleprompterCard.classList.add("playing");
            telePlay.disabled = true;
            telePause.disabled = false;
            
            // Démarrer la lecture à la ligne courante
            playNextSpeechLine();
        }
    };
    
    const pauseSpeech = () => {
        if (isPlayingSpeech) {
            isPlayingSpeech = false;
            teleprompterCard.classList.remove("playing");
            telePlay.disabled = false;
            telePause.disabled = true;
            clearTimeout(speechTimer);
        }
    };
    
    const stopSpeech = () => {
        pauseSpeech();
        activeLineIndex = 0;
    };
    
    const resetSpeech = () => {
        stopSpeech();
        teleContent.style.transform = "translateY(0px)";
        speechLines.forEach(line => line.classList.remove("highlight", "past"));
    };
    
    if (telePlay && telePause && teleReset) {
        telePlay.addEventListener("click", startSpeech);
        telePause.addEventListener("click", pauseSpeech);
        teleReset.addEventListener("click", resetSpeech);
        teleSpeed.addEventListener("change", () => {
            if (isPlayingSpeech) {
                // Relancer le timer pour appliquer la nouvelle vitesse
                clearTimeout(speechTimer);
                playNextSpeechLine();
            }
        });
    }

    // ==========================================================================
    // 8. GENERATION AUDIO PROCEDURALE (RETRO BOOMBOX)
    // ==========================================================================
    // Utilisation de la Web Audio API pour générer de la musique Hip-Hop/Electro
    // sans nécessiter de fichiers musicaux externes (respect de la consigne)
    
    let audioCtx = null;
    let isPlayingBeat = false;
    let beatInterval = null;
    let vinylNode = null;
    
    const boombox = document.querySelector(".boombox");
    const bbPlay = document.getElementById("bbPlay");
    const bbStop = document.getElementById("bbStop");
    const bbStyle = document.getElementById("bbStyle");
    const lcdStatus = document.getElementById("lcdStatus");
    const currentStyleText = document.getElementById("currentStyleText");
    const navAudioBtn = document.getElementById("navAudioBtn");
    
    const styles = [
        { name: "Boom-Bap Old School", bpm: 88 },
        { name: "Electro-Funk 1984", bpm: 115 }
    ];
    let activeStyleIndex = 0;
    let currentStep = 0;
    
    // Initialiser l'audio
    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    };
    
    // Génération du bruit blanc (pour le vinyle, snare, hi-hat)
    const createNoiseBuffer = () => {
        const bufferSize = audioCtx.sampleRate * 2; // 2 secondes
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };
    
    // Son 1 : Kick (Grosse Caisse)
    const playKick = (time) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        osc.start(time);
        osc.stop(time + 0.3);
    };
    
    // Son 2 : Snare (Caisse Claire)
    const playSnare = (time) => {
        // Source de bruit
        const noise = audioCtx.createBufferSource();
        noise.buffer = createNoiseBuffer();
        
        // Filtre passe-bande pour affiner le bruit du snare
        const filter = audioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1000, time);
        
        const gain = audioCtx.createGain();
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        // Fréquence additionnelle
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = "triangle";
        osc.connect(oscGain);
        oscGain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(180, time);
        oscGain.gain.setValueAtTime(0.5, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        noise.start(time);
        noise.stop(time + 0.2);
        osc.start(time);
        osc.stop(time + 0.15);
    };
    
    // Son 3 : Hi-Hat (Cymbale)
    const playHiHat = (time) => {
        const noise = audioCtx.createBufferSource();
        noise.buffer = createNoiseBuffer();
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(7000, time);
        
        const gain = audioCtx.createGain();
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        
        noise.start(time);
        noise.stop(time + 0.05);
    };
    
    // Son 4 : Ligne de basse funky
    const playBassNote = (freq, time, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = "triangle";
        osc.connect(gain);
        
        // Filtre passe-bas pour une basse bien lourde
        const lpFilter = audioCtx.createBiquadFilter();
        lpFilter.type = "lowpass";
        lpFilter.frequency.setValueAtTime(250, time);
        
        gain.connect(lpFilter);
        lpFilter.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.linearRampToValueAtTime(0.4, time + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    };

    // Synthèse du bruit de craquement de vinyle (effet rétro permanent)
    const startVinylCrackle = () => {
        if (vinylNode) return;
        
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Mélange bruit blanc léger + petits clics aléatoires
        for (let i = 0; i < bufferSize; i++) {
            let whiteNoise = (Math.random() * 2 - 1) * 0.015; // Bruit de fond discret
            let crackle = 0;
            
            // Générer un clic aléatoire
            if (Math.random() < 0.00015) {
                crackle = (Math.random() * 2 - 1) * 0.8;
            }
            
            data[i] = whiteNoise + crackle;
        }
        
        vinylNode = audioCtx.createBufferSource();
        vinylNode.buffer = buffer;
        vinylNode.loop = true;
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime); // discret
        
        vinylNode.connect(gain);
        gain.connect(audioCtx.destination);
        vinylNode.start(0);
    };
    
    const stopVinylCrackle = () => {
        if (vinylNode) {
            vinylNode.stop();
            vinylNode.disconnect();
            vinylNode = null;
        }
    };
    
    // Notes de basse pour les boucles
    // Boom-Bap notes: Ré (73.42Hz), Fa (87.31Hz), Sol (98.00Hz), Sib (116.54Hz)
    const boombapBass = [73.42, 0, 73.42, 87.31, 98.00, 0, 98.00, 116.54];
    // Electro notes: Do (65.41Hz), Mib (77.78Hz), Sol (98.00Hz), Sib (116.54Hz)
    const electroBass = [65.41, 65.41, 77.78, 0, 98.00, 98.00, 116.54, 0];
    
    // Séquenceur d'étapes (16 pas, divisé par pas de croche ou double croche)
    const playBeatSequence = () => {
        const bpm = styles[activeStyleIndex].bpm;
        const stepTime = 60 / bpm / 2; // division par croche (8 pas par mesure)
        
        const scheduler = () => {
            const time = audioCtx.currentTime;
            
            // 1. Rythme selon le style actif
            if (activeStyleIndex === 0) {
                // === BOOM-BAP OLD SCHOOL ===
                // Kick sur 1, 3 (offbeat), 9
                if (currentStep === 0 || currentStep === 5 || currentStep === 8) {
                    playKick(time);
                }
                // Snare sur 4, 12
                if (currentStep === 4 || currentStep === 12) {
                    playSnare(time);
                }
                // Hi-Hat constant
                if (currentStep % 2 === 0) {
                    playHiHat(time);
                }
                // Basse (basé sur 8 étapes répétées)
                const bassNote = boombapBass[currentStep % 8];
                if (bassNote > 0) {
                    playBassNote(bassNote, time, stepTime * 0.8);
                }
            } else {
                // === ELECTRO-FUNK 1984 ===
                // Kick sur 1, 5, 9, 13 (four on the floor breakbeat)
                if (currentStep === 0 || currentStep === 6 || currentStep === 10) {
                    playKick(time);
                }
                // Snare sur 4, 12, 14
                if (currentStep === 4 || currentStep === 10 || currentStep === 12) {
                    playSnare(time);
                }
                // Hi-hat syncope
                if (currentStep % 2 === 1) {
                    playHiHat(time);
                }
                // Basse electro
                const bassNote = electroBass[currentStep % 8];
                if (bassNote > 0) {
                    playBassNote(bassNote, time, stepTime * 0.9);
                }
            }
            
            // Animation visuelle de l'equalizer pendant le beat
            animateEqualizer();
            
            // Prochain pas
            currentStep = (currentStep + 1) % 16;
            
            // Réordonner la fonction
            const lookAhead = stepTime * 1000;
            beatInterval = setTimeout(scheduler, lookAhead);
        };
        
        scheduler();
    };
    
    // Animation de l'equalizer LCD
    const eqBars = document.querySelectorAll("#eqBars span");
    const animateEqualizer = () => {
        eqBars.forEach(bar => {
            const h = Math.floor(Math.random() * 16) + 2;
            bar.style.height = `${h}px`;
        });
    };
    
    const resetEqualizer = () => {
        eqBars.forEach(bar => {
            bar.style.height = `2px`;
        });
    };
    
    // Activer le mode visuel et audio playing
    const startAudioSystem = () => {
        initAudio();
        isPlayingBeat = true;
        
        boombox.classList.add("playing");
        navAudioBtn.classList.add("playing");
        
        bbPlay.disabled = true;
        bbStop.disabled = false;
        
        lcdStatus.innerText = "PLAYING TAPE";
        navAudioBtn.querySelector(".audio-status-text").innerText = "ON";
        
        startVinylCrackle();
        playBeatSequence();
    };
    
    const stopAudioSystem = () => {
        isPlayingBeat = false;
        
        boombox.classList.remove("playing");
        navAudioBtn.classList.remove("playing");
        
        bbPlay.disabled = false;
        bbStop.disabled = true;
        
        lcdStatus.innerText = "TAPE STOPPED";
        navAudioBtn.querySelector(".audio-status-text").innerText = "OFF";
        
        stopVinylCrackle();
        clearTimeout(beatInterval);
        resetEqualizer();
    };
    
    // Changement de style musical
    const switchStyle = () => {
        activeStyleIndex = (activeStyleIndex + 1) % styles.length;
        const currentStyle = styles[activeStyleIndex];
        
        currentStyleText.innerText = currentStyle.name;
        lcdStatus.innerText = `STYLE: ${currentStyle.bpm} BPM`;
        
        if (isPlayingBeat) {
            // Relancer le séquenceur pour appliquer le nouveau tempo immédiatement
            clearTimeout(beatInterval);
            currentStep = 0;
            playBeatSequence();
        }
    };
    
    // Event listeners
    if (bbPlay && bbStop && bbStyle) {
        bbPlay.addEventListener("click", startAudioSystem);
        bbStop.addEventListener("click", stopAudioSystem);
        bbStyle.addEventListener("click", switchStyle);
        navAudioBtn.addEventListener("click", () => {
            if (isPlayingBeat) {
                stopAudioSystem();
            } else {
                startAudioSystem();
            }
        });
    }
});
