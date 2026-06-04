document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Simple hamburger animation toggle could be added here
        const spans = hamburger.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.slide-up, .fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // --- GSAP Animations ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // 1. Hero Reveal
        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero-reveal-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1, // Smooth scrubbing
            }
        });

        // Fade out hero text
        heroTl.to(".hero-text-section", { opacity: 0, y: -50, duration: 1 })
              // Scale up background image
              .to(".hero-bg-image", { scale: 1.1, duration: 2 }, "<")
              // Darken background
              .to(".hero-bg-overlay", { opacity: 1, duration: 2 }, "<")
              // Slide up value cards sequentially
              .to(".value-card", { y: 0, opacity: 1, duration: 1, stagger: 0.2 }, "-=1");

        // 2. Horizontal Scroll for Solutions
        const horizontalTrack = document.querySelector('.horizontal-track');
        if (horizontalTrack) {
            function getScrollAmount() {
                let trackWidth = horizontalTrack.scrollWidth;
                return -(trackWidth - window.innerWidth);
            }

            const horizontalTl = gsap.to(horizontalTrack, {
                x: getScrollAmount,
                ease: "none"
            });

            ScrollTrigger.create({
                trigger: ".horizontal-scroll-wrapper",
                start: "top top",
                end: () => `+=${getScrollAmount() * -1}`,
                animation: horizontalTl,
                scrub: 1,
                invalidateOnRefresh: true
            });

            // Before/After Soundproofing Effect inside horizontal scroll
            gsap.to(".sound-visual-inside", {
                x: "0%", // Slide it in to cover the outside noise visual
                ease: "none",
                scrollTrigger: {
                    trigger: ".soundproof-panel",
                    containerAnimation: horizontalTl,
                    start: "left right",
                    end: "right left",
                    scrub: 1
                }
                }
            });
        }

        // 3. Immersive Window Audio Experience
        const immersiveWrapper = document.querySelector('.immersive-window-wrapper');
        const cityAudio = document.getElementById('city-audio');
        const audioOverlay = document.getElementById('audio-start-overlay');
        const startAudioBtn = document.getElementById('start-audio-btn');

        if (immersiveWrapper && cityAudio) {
            // Set initial volume low (muffled)
            cityAudio.volume = 0.1;

            // Handle user interaction required for audio playback
            if (startAudioBtn) {
                startAudioBtn.addEventListener('click', () => {
                    cityAudio.play().then(() => {
                        audioOverlay.style.opacity = '0';
                        setTimeout(() => audioOverlay.style.display = 'none', 500);
                    }).catch(e => console.log("Audio play failed:", e));
                });
            }

            const immersiveTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".immersive-window-wrapper",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                    onUpdate: (self) => {
                        // Map progress (0 to 1) to volume (0.1 to 1.0)
                        if (!cityAudio.paused) {
                            let newVol = 0.1 + (self.progress * 0.9);
                            cityAudio.volume = Math.min(Math.max(newVol, 0), 1);
                        }
                    }
                }
            });

            // Animate panes sliding apart
            immersiveTl.to(".immersive-left-pane", { xPercent: -100, duration: 1 })
                       .to(".immersive-right-pane", { xPercent: 100, duration: 1 }, "<")
                       // Fade out blur effect on glass as it opens (simulate clarity)
                       .to(".immersive-pane", { backdropFilter: "blur(0px)", duration: 1 }, "<")
                       // Fade in text
                       .to(".view-text-overlay", { opacity: 1, duration: 0.5 }, "-=0.5");
        }
    }

    // Scroll-Animated Window Logic
    const windowTrack = document.getElementById('contact-scroll-track');
    const stickyContainer = document.querySelector('.window-sticky-container');

    if (windowTrack && stickyContainer) {
        window.addEventListener('scroll', () => {
            const trackRect = windowTrack.getBoundingClientRect();
            
            // The total scrollable distance within the track
            const scrollDistance = windowTrack.offsetHeight - window.innerHeight;
            
            // Approximate header height where sticky triggers
            const headerHeight = 100;
            
            // Progress starts when trackTop reaches the header
            let progress = (headerHeight - trackRect.top) / scrollDistance;
            
            // Clamp progress between 0 and 1
            progress = Math.max(0, Math.min(1, progress));
            
            // Update the CSS variable
            stickyContainer.style.setProperty('--scroll-progress', progress);
            
            // Disable pointer events on panels when fully open so users can interact with the form
            const panels = document.querySelectorAll('.window-panel');
            if (progress > 0.9) {
                panels.forEach(p => p.style.pointerEvents = 'none');
            } else {
                panels.forEach(p => p.style.pointerEvents = 'auto');
            }
        });
    }
});
