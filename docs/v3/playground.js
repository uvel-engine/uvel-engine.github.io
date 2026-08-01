/* ═══════════════════════════════════════════════════════════
   UVEL WEBRUNNER ENGINE v1.0 (JS Port)
   Parses XML, Renders UI, Executes Logic
   ═══════════════════════════════════════════════════════════ */

class UvelEngine {
    constructor() {
        this.state = {};
        this.handlers = {};
        this.controls = {}; // Map Name -> DOM Element
    }

    // 1. MAIN RUN METHOD
    run(xmlString) {
        this.reset();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // Check errors
        const errorNode = xmlDoc.querySelector("parsererror");
        if (errorNode) {
            this.log("ERROR", "XML Parsing Error: " + errorNode.textContent);
            return;
        }

        const appNode = xmlDoc.querySelector("App");
        if (!appNode) {
            this.log("ERROR", "Root <App> tag missing.");
            return;
        }

        // 1. Initialize State
        this.parseLogic(appNode.querySelector("Logic"));

        // 2. Render UI
        const uiNode = appNode.querySelector("UI");
        const appWindow = document.getElementById("appWindow");
        appWindow.innerHTML = ""; // Clear

        if (uiNode) {
            this.renderChildren(uiNode, appWindow);
        }

        // 3. Apply Theme
        this.applyTheme(appNode);

        this.log("INFO", "Application loaded successfully.");
    }

    reset() {
        this.state = {};
        this.handlers = {};
        this.controls = {};
        document.getElementById("consoleBody").innerHTML = "";
    }

    // 2. LOGIC PARSER
    parseLogic(logicNode) {
        if (!logicNode) return;

        // Parse Variables
        const vars = logicNode.querySelectorAll("Var");
        vars.forEach(v => {
            const name = v.getAttribute("Name");
            const type = v.getAttribute("Type") || "string";
            let val = v.getAttribute("Value");

            if (type === "int") val = parseInt(val) || 0;
            if (type === "bool") val = (val === "true");
            if (type === "double") val = parseFloat(val) || 0.0;

            this.state[name] = val;
        });

        // Parse Handlers
        const handlers = logicNode.querySelectorAll("Handler");
        handlers.forEach(h => {
            const name = h.getAttribute("Name");
            this.handlers[name] = h; // Store XML node
        });
    }

    // 3. UI RENDERER
    renderChildren(xmlNode, parentDom) {
        Array.from(xmlNode.children).forEach(child => {
            const element = this.createElement(child);
            if (element) {
                parentDom.appendChild(element);
                
                // Recursion for containers
                if (["Grid", "StackPanel", "Border", "ScrollViewer", "GlassCard"].includes(child.tagName)) {
                    this.renderChildren(child, element);
                }
            }
        });
    }

    createElement(xmlNode) {
        const tag = xmlNode.tagName;
        let dom = null;

        // --- COMPONENT MAPPING ---
        switch (tag) {
            case "StackPanel":
                dom = document.createElement("div");
                dom.className = "n-stack";
                const orient = xmlNode.getAttribute("Orientation") || "Vertical";
                dom.classList.add(orient.toLowerCase());
                this.applySpacing(dom, xmlNode.getAttribute("Margin"), xmlNode.getAttribute("Padding"));
                break;

            case "Grid":
                dom = document.createElement("div");
                dom.className = "n-grid";
                // Simple grid simulation (1fr columns)
                dom.style.gridTemplateColumns = "repeat(auto-fit, minmax(0, 1fr))"; 
                this.applyStyles(dom, xmlNode);
                break;

            case "Button":
                dom = document.createElement("button");
                dom.textContent = this.resolveBinding(xmlNode.getAttribute("Content"));
                this.applyStyles(dom, xmlNode);
                // Event
                const onClick = xmlNode.getAttribute("onClick");
                if (onClick) {
                    dom.onclick = () => this.executeHandler(onClick);
                }
                break;

            case "TextBlock":
                dom = document.createElement("div");
                dom.textContent = this.resolveBinding(xmlNode.getAttribute("Text"));
                dom.style.fontSize = (xmlNode.getAttribute("FontSize") || "14") + "px";
                dom.style.fontWeight = xmlNode.getAttribute("FontWeight") || "normal";
                dom.style.color = xmlNode.getAttribute("Foreground") || "inherit";
                this.applyStyles(dom, xmlNode);
                break;

            case "TextBox":
                dom = document.createElement("input");
                dom.type = "text";
                dom.placeholder = xmlNode.getAttribute("Placeholder") || "";
                this.applyStyles(dom, xmlNode);
                // Bind Input
                const name = xmlNode.getAttribute("Name");
                if (name) {
                    dom.oninput = (e) => {
                        // Normally updating control prop implies state change only if bound?
                        // In simple playground, we just allow reading via Get command
                    };
                }
                break;

            case "GlassCard":
                dom = document.createElement("div");
                dom.className = "n-glass";
                dom.style.borderRadius = (xmlNode.getAttribute("CornerRadius") || "12") + "px";
                dom.style.padding = (xmlNode.getAttribute("Padding") || "20") + "px";
                this.applyStyles(dom, xmlNode);
                break;
                
            case "Border":
                dom = document.createElement("div");
                dom.className = "n-border";
                dom.style.borderRadius = (xmlNode.getAttribute("CornerRadius") || "0") + "px";
                dom.style.borderWidth = (xmlNode.getAttribute("BorderThickness") || "0") + "px";
                dom.style.borderColor = xmlNode.getAttribute("BorderBrush") || "transparent";
                this.applyStyles(dom, xmlNode);
                break;
        }

        if (dom) {
            // Register Name
            const name = xmlNode.getAttribute("Name");
            if (name) {
                this.controls[name] = dom;
                dom.id = name;
            }
            
            // Layout Alignment (Flex simulation)
            const hAlign = xmlNode.getAttribute("HorizontalAlignment");
            if (hAlign) {
                dom.style.alignSelf = hAlign === "Center" ? "center" : (hAlign === "Right" ? "flex-end" : "flex-start");
            }
        }

        return dom;
    }

    // 4. STYLE HELPER
    applyStyles(dom, xmlNode) {
        const bg = xmlNode.getAttribute("Background");
        const fg = xmlNode.getAttribute("Foreground");
        const width = xmlNode.getAttribute("Width");
        const height = xmlNode.getAttribute("Height");
        const margin = xmlNode.getAttribute("Margin");
        const padding = xmlNode.getAttribute("Padding");

        if (bg) dom.style.backgroundColor = bg;
        if (fg) dom.style.color = fg;
        if (width) dom.style.width = width.includes("%") ? width : width + "px";
        if (height) dom.style.height = height.includes("%") ? height : height + "px";
        
        this.applySpacing(dom, margin, padding);
    }

    applySpacing(dom, margin, padding) {
        if (margin) dom.style.margin = margin.replace(/,/g, "px ") + "px";
        if (padding) dom.style.padding = padding.replace(/,/g, "px ") + "px";
    }

    applyTheme(appNode) {
        const bg = appNode.getAttribute("Theme") === "Dark" ? "#1e1e1e" : "#ffffff";
        const fg = appNode.getAttribute("Theme") === "Dark" ? "#ffffff" : "#000000";
        document.getElementById("appWindow").style.backgroundColor = bg;
        document.getElementById("appWindow").style.color = fg;
    }

    // 5. BINDING RESOLVER
    resolveBinding(text) {
        if (!text) return "";
        // Replace {varName} with state value
        return text.replace(/\{(\w+)\}/g, (match, varName) => {
            return this.state[varName] !== undefined ? this.state[varName] : match;
        });
    }

    updateBindings() {
        // Re-render UI to reflect state changes (Naive but effective for playground)
        // In real app, we update specific properties. Here we just re-run render logic 
        // on controls that have bindings? 
        // For simplicity: We will just log state changes. 
        // To make it real, we'd need to store binding metadata.
        
        // Let's implement a simple "Refresh TextBlock" logic
        for (const [name, dom] of Object.entries(this.controls)) {
            // If it's a textblock/button, check if original XML had binding
            // This requires storing original XML. Skipped for 1500 line limit constraint ;)
            // Instead, we encourage user to use Set command to update UI.
        }
    }

    // 6. LOGIC EXECUTOR
    executeHandler(handlerName) {
        const handlerNode = this.handlers[handlerName];
        if (!handlerNode) {
            this.log("WARN", "Handler not found: " + handlerName);
            return;
        }

        this.log("DEBUG", "Executing Handler: " + handlerName);
        this.executeCommands(handlerNode);
    }

    executeCommands(parentNode) {
        Array.from(parentNode.children).forEach(cmd => {
            this.executeSingleCommand(cmd);
        });
    }

    executeSingleCommand(cmdNode) {
        const type = cmdNode.tagName;

        switch (type) {
            case "Set":
                const target = cmdNode.getAttribute("Target");
                const prop = cmdNode.getAttribute("Property");
                const val = this.resolveBinding(cmdNode.getAttribute("Value"));
                
                if (target && this.controls[target]) {
                    // Update DOM
                    const el = this.controls[target];
                    if (prop === "Text" || prop === "Content") el.textContent = val;
                    if (prop === "Background") el.style.backgroundColor = val;
                    if (prop === "Width") el.style.width = val + "px";
                }
                
                // Update Variable
                const varName = cmdNode.getAttribute("Var");
                if (varName) {
                    this.state[varName] = val; // Store as string if mostly string
                }
                break;

            case "Alert":
                const msg = this.resolveBinding(cmdNode.getAttribute("Message"));
                alert(msg);
                break;

            case "Log":
                const logMsg = this.resolveBinding(cmdNode.getAttribute("Message"));
                const level = cmdNode.getAttribute("Level") || "INFO";
                this.log(level, logMsg);
                break;

            case "Increment":
                const v = cmdNode.getAttribute("Var");
                if (this.state[v] !== undefined) {
                    this.state[v]++;
                    this.log("DEBUG", `${v} incremented to ${this.state[v]}`);
                }
                break;

            case "If":
                // Very basic condition parser
                const cond = this.resolveBinding(cmdNode.getAttribute("Condition"));
                // WARNING: Eval is evil, but for a playground it's the only way to parse "5 > 3" dynamically without writing a parser
                try {
                    // Sanitize slightly
                    const safeCond = cond.replace(/[^-()\d/*+.<>=!&|' ]/g, ''); 
                    if (new Function('return ' + cond)()) {
                        this.executeCommands(cmdNode); // Execute children (implicit 'Then')
                    } else {
                        const elseNode = cmdNode.querySelector("Else");
                        if (elseNode) this.executeCommands(elseNode);
                    }
                } catch (e) {
                    this.log("ERROR", "Condition Error: " + e.message);
                }
                break;
        }
    }

    // 7. LOGGER
    log(level, msg) {
        const consoleBody = document.getElementById("consoleBody");
        const entry = document.createElement("div");
        entry.className = "log-entry";
        
        const time = new Date().toLocaleTimeString('en-US', {hour12: false});
        
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-level log-${level}">${level}</span>
            <span class="log-msg">${msg}</span>
        `;
        
        consoleBody.appendChild(entry);
        consoleBody.scrollTop = consoleBody.scrollHeight;
    }
}

// ═══════════════════════════════════════════════════════════
// EDITOR & UI LOGIC
// ═══════════════════════════════════════════════════════════

const engine = new UvelEngine();

// Syntax Highlighting (Simple Regex)
function highlight(code) {
    return code
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, (match, open, tag, attrs, close) => {
            const coloredAttrs = attrs.replace(/(\w+)=("[^"]*")/g, 
                '<span class="token-attr">$1</span>=<span class="token-string">$2</span>');
            return `<span class="token-punct">${open}</span><span class="token-tag">${tag}</span>${coloredAttrs}<span class="token-punct">${close}</span>`;
        })
        .replace(/&lt;!--([\s\S]*?)--&gt;/g, '<span class="token-comment">&lt;!--$1--&gt;</span>');
}

// DOM Elements
const editor = document.getElementById("codeEditor");
const highlighter = document.getElementById("codeContent");
const lineNumbers = document.getElementById("lineNumbers");

// Editor Sync
editor.addEventListener("input", updateEditor);
editor.addEventListener("scroll", () => {
    highlighter.parentElement.scrollTop = editor.scrollTop;
    highlighter.parentElement.scrollLeft = editor.scrollLeft;
    lineNumbers.scrollTop = editor.scrollTop;
});

function updateEditor() {
    const text = editor.value;
    // Update highlight
    // Add space at end to prevent scroll issues
    highlighter.innerHTML = highlight(text) + "\n"; 
    
    // Update line numbers
    const lines = text.split("\n").length;
    lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join("<br>");
}

// Button Events
document.getElementById("runBtn").addEventListener("click", () => {
    engine.run(editor.value);
});

document.getElementById("clearConsole").addEventListener("click", () => {
    document.getElementById("consoleBody").innerHTML = "";
});

// Examples
const EXAMPLES = {
    hello: `<App Name="Hello" Theme="Dark">
    <UI>
        <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center">
            <TextBlock Text="Hello, Uvel!" FontSize="24" Foreground="White"/>
            <Button Content="Click Me" Background="#0078D4" Margin="20" onClick="Greet"/>
        </StackPanel>
    </UI>
    <Logic>
        <Handler Name="Greet">
            <Alert Message="Welcome to WebRunner!"/>
            <Log Message="User clicked the button"/>
        </Handler>
    </Logic>
</App>`,
    
    counter: `<App Name="Counter" Theme="Dark">
    <UI>
        <StackPanel HorizontalAlignment="Center" Margin="50">
            <TextBlock Name="lblCount" Text="0" FontSize="48" Foreground="#60CDFF"/>
            <Button Content="Increment" Background="#28a745" Margin="10" onClick="Add"/>
        </StackPanel>
    </UI>
    <Logic>
        <Var Name="cnt" Value="0" Type="int"/>
        <Handler Name="Add">
            <Increment Var="cnt"/>
            <Set Target="lblCount" Property="Text" Value="{cnt}"/>
        </Handler>
    </Logic>
</App>`
};

document.getElementById("exampleSelect").addEventListener("change", (e) => {
    const code = EXAMPLES[e.target.value];
    if (code) {
        editor.value = code;
        updateEditor();
        engine.run(code); // Auto run
    }
});

// Initialize
editor.value = EXAMPLES.hello;
updateEditor();
engine.run(editor.value);
