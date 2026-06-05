    function showSource(options = {}) {
      stage.classList.add("source-active");
      editorShell.classList.remove("preview-mode", "log-mode");
      editorShell.classList.add("source-mode");
      sourcePane.style.display = "grid";
      previewPane.style.display = "none";
      mainLogPane.style.display = "none";
      if (options.hideChat !== false) hideChat();
      updateEditorView();
      latexInput.focus();
    }

    function highlightLatex(source) {
      return source.split("\n").map((line) => {
        const commentIndex = line.indexOf("%");
        const body = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
        const comment = commentIndex >= 0 ? line.slice(commentIndex) : "";
        let html = escapeHTML(body);
        const citationTarget = getCitationTargetText(activeCitationName);
        if (citationTarget) {
          html = html.replaceAll(
            escapeHTML(citationTarget),
            `<span class="citation-hit">${escapeHTML(citationTarget)}</span>`
          );
        }

        html = html.replace(/(\\(?:documentclass|usepackage|begin|end|newcommand|renewcommand))(?=({|\\s|$))/g, '<span class="syn-struct">$1</span>');
        html = html.replace(/(\\(?:title|author|date|section|subsection|textbf|item|maketitle|includegraphics))(?=({|\\s|$))/g, '<span class="syn-command">$1</span>');
        html = html.replace(/((?:begin|end)<\/span>\{)([^{}]+)(\})/g, '$1<span class="syn-env">$2</span>$3');
        html = html.replace(/(\$[^$]*\$|\\\[[\s\S]*?\\\])/g, '<span class="syn-math">$1</span>');

        if (comment) {
          html += `<span class="syn-comment">${escapeHTML(comment)}</span>`;
        }
        return html || " ";
      }).join("\n");
    }

    function measureLineHeight(line, width) {
      const measure = document.createElement("div");
      measure.style.position = "absolute";
      measure.style.visibility = "hidden";
      measure.style.pointerEvents = "none";
      measure.style.boxSizing = "border-box";
      measure.style.width = `${Math.max(width, 1)}px`;
      measure.style.font = getComputedStyle(latexInput).font;
      measure.style.lineHeight = getComputedStyle(latexInput).lineHeight;
      measure.style.whiteSpace = "pre-wrap";
      measure.style.overflowWrap = "break-word";
      measure.style.wordBreak = "normal";
      measure.textContent = line || " ";
      document.body.appendChild(measure);
      const height = Math.max(parseFloat(getComputedStyle(latexInput).lineHeight), measure.scrollHeight);
      measure.remove();
      return height;
    }

    function updateLineNumbers() {
      const lines = latexInput.value.split("\n");
      const width = latexInput.clientWidth;
      const lineHeight = parseFloat(getComputedStyle(latexInput).lineHeight);
      lineNumbers.innerHTML = lines.map((_, index) => {
        const height = measureLineHeight(lines[index], width);
        return `<div style="height:${height}px;line-height:${lineHeight}px">${index + 1}</div>`;
      }).join("");
      lineNumbers.scrollTop = latexInput.scrollTop;
    }

    function updateHighlight() {
      highlightLayer.innerHTML = highlightLatex(latexInput.value);
      highlightLayer.style.transform = `translate(${-latexInput.scrollLeft}px, ${-latexInput.scrollTop}px)`;
    }

    function getCitationTargetText(name) {
      if (name === "intro-distraction") {
        return "Maintaining attention in digital environments has become increasingly difficult as users are constantly exposed to notifications, highlighted interface elements, and competing visual stimuli. Even when users intend to focus on a primary task such as reading, writing, or studying, their attention can easily shift toward irrelevant content on the screen.";
      }
      if (name === "existing-approaches") {
        return "Existing approaches to distraction reduction often rely on manual settings such as ``Do Not Disturb'' modes, notification muting, or full-screen task environments.";
      }
      if (name === "responsive") {
        return "By using gaze behavior as an interaction signal, FocusFlow seeks to support a more personalized and dynamic form of attention assistance.";
      }
      if (name === "gaze") {
        return "monitors users' gaze behavior to detect moments of reduced concentration";
      }
      return "";
    }

    function updateEditorView() {
      updateHighlight();
      updateLineNumbers();
    }

    function escapeHTML(value) {
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function matchLatex(command, text) {
      const pattern = new RegExp("\\\\" + command + "\\{([\\s\\S]*?)\\}");
      const result = text.match(pattern);
      return result ? result[1].trim() : "";
    }

    function matchEnvironment(name, text) {
      const pattern = new RegExp("\\\\begin\\{" + name + "\\}([\\s\\S]*?)\\\\end\\{" + name + "\\}");
      const result = text.match(pattern);
      return result ? result[1].trim() : "";
    }

    function stripLatex(text) {
      return text
        .replace(/\\maketitle/g, "")
        .replace(/\\end\{document\}/g, "")
        .replace(/``/g, "\"")
        .replace(/''/g, "\"")
        .replace(/\\[a-zA-Z]+\*?(?:\{([^{}]*)\})?/g, (_, group) => group || "")
        .replace(/[{}]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function markCitations(text) {
      let html = escapeHTML(text);
      html = html.replace(
        /monitors users' gaze behavior to detect moments of reduced concentration/g,
        "<span data-cite=\"gaze\">monitors users' gaze behavior to detect moments of reduced concentration</span>"
      );
      html = html.replace(
        /By using gaze behavior as an interaction signal, FocusFlow seeks to support a more personalized and dynamic form of attention assistance\./g,
        "<span data-cite=\"responsive\">By using gaze behavior as an interaction signal, FocusFlow seeks to support a more personalized and dynamic form of attention assistance.</span>"
      );
      return html;
    }

    function renderPreview(source = lastCompiledSource) {
      const title = stripLatex(matchLatex("title", source)) || "Untitled";
      const author = stripLatex(matchLatex("author", source));
      const date = stripLatex(matchLatex("date", source));
      const abstract = stripLatex(matchEnvironment("abstract", source));
      const afterAbstract = source.split(/\\end\{abstract\}/)[1] || source;
      const sectionParts = afterAbstract.split(/\\section\{([^{}]+)\}/g).slice(1);

      let html = `<h2 class="compiled-title">${escapeHTML(title)}</h2>`;
      if (author) html += `<div class="compiled-authors">${escapeHTML(author)}</div>`;
      if (date) html += `<div class="compiled-date">${escapeHTML(date)}</div>`;
      if (abstract) {
        html += `<div class="abstract-title">Abstract</div><p class="compiled-abstract">${markCitations(abstract)}</p>`;
      }

      for (let i = 0; i < sectionParts.length; i += 2) {
        const sectionTitle = stripLatex(sectionParts[i]);
        const body = stripLatex(sectionParts[i + 1] || "");
        if (!sectionTitle) continue;
        html += `<h3 class="compiled-section"><span>${i / 2 + 1}</span><span>${escapeHTML(sectionTitle)}</span></h3>`;
        if (body) html += `<p class="compiled-body">${markCitations(body)}</p>`;
      }

      compiledPaper.innerHTML = html;
    }

    function textClip(text, max = 118) {
      const clean = text.replace(/\s+/g, " ").trim();
      return clean.length > max ? `${clean.slice(0, max)} ...` : clean;
    }

    function canAddContext() {
      const chatBoxOpen = !chat.classList.contains("closed") && chatTitle.textContent === "Chat Box";
      return chatBoxOpen && textMode.classList.contains("active") && sourcePane.style.display !== "none";
    }

    function getTextareaCaretPoint(textarea, index) {
      const rect = textarea.getBoundingClientRect();
      const style = getComputedStyle(textarea);
      const mirror = document.createElement("div");
      const marker = document.createElement("span");
      mirror.style.position = "fixed";
      mirror.style.left = `${rect.left - textarea.scrollLeft}px`;
      mirror.style.top = `${rect.top - textarea.scrollTop}px`;
      mirror.style.width = `${rect.width}px`;
      mirror.style.minHeight = `${rect.height}px`;
      mirror.style.padding = style.padding;
      mirror.style.border = style.border;
      mirror.style.boxSizing = style.boxSizing;
      mirror.style.font = style.font;
      mirror.style.lineHeight = style.lineHeight;
      mirror.style.letterSpacing = style.letterSpacing;
      mirror.style.whiteSpace = "pre-wrap";
      mirror.style.overflowWrap = "break-word";
      mirror.style.wordBreak = style.wordBreak;
      mirror.style.visibility = "hidden";
      mirror.style.pointerEvents = "none";
      mirror.style.zIndex = "-1";
      mirror.textContent = textarea.value.slice(0, index);
      marker.textContent = "\u200b";
      mirror.appendChild(marker);
      document.body.appendChild(mirror);
      const markerRect = marker.getBoundingClientRect();
      mirror.remove();
      return markerRect;
    }

    function placeAddButtonFromTextarea() {
      const rect = latexInput.getBoundingClientRect();
      const caretRect = getTextareaCaretPoint(latexInput, latexInput.selectionEnd);
      const left = Math.max(rect.left + 8, Math.min(caretRect.left - 18, rect.right - 146, window.innerWidth - 150));
      const top = Math.max(rect.top + 8, Math.min(caretRect.bottom + 4, rect.bottom - 36, window.innerHeight - 40));
      addContext.style.left = `${left}px`;
      addContext.style.top = `${top}px`;
      addContext.style.display = "inline-flex";
    }

    function updateSelectedText() {
      if (!canAddContext()) {
        addContext.style.display = "none";
        return;
      }
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      if (end <= start) {
        selectedText = "";
        addContext.style.display = "none";
        return;
      }
      selectedText = latexInput.value.slice(start, end).replace(/\s+/g, " ").trim();
      if (selectedText.length > 4) {
        placeAddButtonFromTextarea();
      } else {
        addContext.style.display = "none";
      }
    }

    latexInput.addEventListener("input", updateEditorView);
    latexInput.addEventListener("scroll", () => {
      lineNumbers.scrollTop = latexInput.scrollTop;
      updateHighlight();
    });
    latexInput.addEventListener("mouseup", updateSelectedText);
    latexInput.addEventListener("keyup", updateSelectedText);
    window.addEventListener("resize", updateEditorView);

    document.addEventListener("selectionchange", () => {
      if (!canAddContext()) {
        addContext.style.display = "none";
        return;
      }
      if (sourcePane.style.display !== "none") return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        addContext.style.display = "none";
        return;
      }
      const range = selection.getRangeAt(0);
      if (!compiledPaper.contains(range.commonAncestorContainer)) {
        addContext.style.display = "none";
        return;
      }
      selectedText = selection.toString().replace(/\s+/g, " ").trim();
      if (selectedText.length <= 4) {
        addContext.style.display = "none";
        return;
      }
      const rect = range.getBoundingClientRect();
      addContext.style.left = `${Math.max(12, Math.min(rect.right - 8, window.innerWidth - 150))}px`;
      addContext.style.top = `${rect.bottom + 3}px`;
      addContext.style.display = "inline-flex";
    });

    document.addEventListener("mousedown", (event) => {
      if (!addContext.contains(event.target)) addContext.style.display = "none";
    });

    addContext.addEventListener("click", () => {
      if (selectedText) addContextChip(selectedText);
      clearContextSelection();
    });

    function addContextChip(text) {
      showChat("Chat Box");
      composerShell.style.display = "flex";
      if (!contexts.includes(text)) contexts.unshift(text);
      renderContext();
    }

    function renderContext() {
      contextList.innerHTML = "";
      contexts.forEach((text, index) => {
        const chip = document.createElement("div");
        chip.className = "context-chip";
        chip.textContent = textClip(text);
        chip.title = "Click to highlight source text";
        chip.addEventListener("click", () => highlightCitation(text.includes("personalized") ? "responsive" : "gaze"));
        const x = document.createElement("button");
        x.className = "remove-chip";
        x.type = "button";
        x.textContent = "×";
        x.addEventListener("click", (event) => {
          event.stopPropagation();
          contexts.splice(index, 1);
          renderContext();
        });
        chip.appendChild(x);
        contextList.appendChild(chip);
      });
    }
