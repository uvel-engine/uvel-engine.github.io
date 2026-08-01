/* ═══════════════════════════════════════════════════════════
   UVEL FRAMEWORK - MAIN JS
   Interactions, Animations, and Logic
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navigation Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });

    // 3. Showcase Tabs
    const tabs = document.querySelectorAll('.showcase-tab');
    const panels = document.querySelectorAll('.showcase-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active to current
            tab.classList.add('active');
            const targetId = 'panel-' + tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 4. Copy Code Functionality
    const copyBtn = document.getElementById('copyCode');
    const codeBlock = document.getElementById('heroCode');
    
    copyBtn.addEventListener('click', () => {
        const text = codeBlock.innerText;
        navigator.clipboard.writeText(text).then(() => {
            // Visual feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
            copyBtn.style.color = '#4ade80';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.color = '';
            }, 2000);
        });
    });

    // 5. Scroll Reveal Animation (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .section-header, .download-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.5, 0, 0, 1)';
        observer.observe(el);
    });

    // Add CSS class for reveal animation
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // 6. Settings Toggle Animation (Showcase)
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('on');
        });
    });

    // 7. Chat Input Simulation
    const chatInput = document.querySelector('.chat-input input');
    const chatBtn = document.querySelector('.chat-input button');
    const chatMessages = document.querySelector('.chat-messages');

    if (chatBtn && chatInput) {
        chatBtn.addEventListener('click', () => {
            const text = chatInput.value.trim();
            if (text) {
                // Add sent message
                const msg = document.createElement('div');
                msg.className = 'chat-bubble sent';
                msg.textContent = text;
                chatMessages.appendChild(msg);
                
                chatInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Simulate reply
                setTimeout(() => {
                    const reply = document.createElement('div');
                    reply.className = 'chat-bubble received';
                    reply.textContent = 'Auto-reply: ' + text;
                    chatMessages.appendChild(reply);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
            }
        });
    }
});
