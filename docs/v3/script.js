/* ═══════════════════════════════════════════════════════════
   UVEL DOCS V3 - CORE LOGIC
   Handles: Theme, Sidebar Generation, Versioning, Copy Code
   ═══════════════════════════════════════════════════════════ */

// Navigatsiya ma'lumotlari (Sitemap)
const NAV_DATA = [
    {
        label: "The Basics",
        items: [
            { icon: "home", text: "Introduction", link: "index.html" },
            { icon: "code", text: "Syntax & Grammar", link: "syntax.html" },
            { icon: "download", text: "Installation", link: "installation.html" },
            { icon: "rocket_launch", text: "Examples", link: "examples.html" }
        ]
    },
    {
        label: "UI & Design",
        items: [
            { icon: "dashboard", text: "Layouts", link: "ui-layout.html" },
            { icon: "toggle_on", text: "Controls", link: "ui-controls.html" },
            { icon: "widgets", text: "Custom Components", link: "ui-custom.html" },
            { icon: "palette", text: "Styling & Effects", link: "ui-styling.html" },
            { icon: "chat", text: "Alerts & Dialogs", link: "ui-popups.html" }
        ]
    },
    {
        label: "Logic & Behavior",
        items: [
            { icon: "touch_app", text: "Events & Handlers", link: "logic-handlers.html" },
            { icon: "database", text: "State & Binding", link: "logic-state.html" },
            { icon: "account_tree", text: "Control Flow", link: "logic-flow.html" },
            { icon: "animation", text: "UI Manipulation", link: "logic-ui.html" },
            { icon: "cloud", text: "Data & HTTP", link: "logic-data.html" },
            { icon: "build_circle", text: "Utilities", link: "logic-utils.html" },
            { icon: "javascript", text: "ManualC (C#)", link: "manual-c.html" }
        ]
    },
    {
        label: "Advanced",
        items: [
            { icon: "extension", text: "Plugins", link: "plugins.html" },
            { icon: "bug_report", text: "DevTools", link: "devtools.html" },
            { icon: "inventory_2", text: "Building EXE", link: "building.html" },
            { icon: "architecture", text: "Engineering", link: "engineering.html" }
        ]
    },
    {
        label: "Reference",
        items: [
            { icon: "terminal", text: "CLI Reference", link: "cli.html" },
            { icon: "menu_book", text: "API Cheat Sheet", link: "api.html" }
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {

    // 0. GITHUB LINK FIX
    // ----------------------------------------------------
    const githubLink = document.querySelector('.github-btn');
    if (githubLink) {
        githubLink.href = 'https://github.com/uvel-engine/uvel';
    }
    
    // 1. SIDEBAR GENERATION
    // ----------------------------------------------------
    const navMenu = document.querySelector('.nav-menu');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    if (navMenu) {
        let navHTML = '';

        NAV_DATA.forEach(group => {
            navHTML += `<div class="nav-group">`;
            navHTML += `<span class="nav-label">${group.label}</span>`;
            
            group.items.forEach(item => {
                const isActive = item.link === currentPath ? 'active' : '';
                navHTML += `
                    <a href="${item.link}" class="nav-link ${isActive}">
                        <span class="material-symbols-rounded">${item.icon}</span>
                        ${item.text}
                    </a>
                `;
            });
            
            navHTML += `</div>`;
        });

        navMenu.innerHTML = navHTML;
    }

    // 2. THEME SWITCHER
    // ----------------------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;
    const storedTheme = localStorage.getItem('uvel-theme');
    
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
        htmlEl.setAttribute('data-theme', storedTheme);
    } else {
        htmlEl.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('uvel-theme', newTheme);
        });
    }

    // 3. MOBILE SIDEBAR TOGGLE
    // ----------------------------------------------------
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const mainWrapper = document.querySelector('.main-wrapper');

    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }

    if (openBtn) openBtn.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

    if (mainWrapper) {
        mainWrapper.addEventListener('click', () => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // 4. VERSION SELECTOR
    // ----------------------------------------------------
    const versionSelect = document.getElementById('versionSelect');
    if (versionSelect) {
        versionSelect.addEventListener('change', (e) => {
            window.location.href = e.target.value;
        });
    }

    // 5. COPY CODE BUTTON
    // ----------------------------------------------------
    window.copyCode = function(btn) {
        const codeHeader = btn.parentElement;
        const codeBlock = codeHeader.nextElementSibling;
        
        if (codeBlock) {
            const codeText = codeBlock.innerText;
            
            navigator.clipboard.writeText(codeText).then(() => {
                const icon = btn.querySelector('.material-symbols-rounded');
                const originalText = icon.textContent;
                
                icon.textContent = 'check';
                btn.style.color = '#4ade80';
                
                setTimeout(() => {
                    icon.textContent = originalText;
                    btn.style.color = '';
                }, 2000);
            });
        }
    };
});
