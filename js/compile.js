    function validateLatex(source) {
      const errors = [];
      if (!/\\documentclass\{[^{}]+\}/.test(source)) {
        errors.push("Missing required \\documentclass{...} declaration.");
      }
      if (!/\\begin\{document\}/.test(source)) {
        errors.push("Missing \\begin{document}.");
      }
      if (!/\\end\{document\}/.test(source)) {
        errors.push("Missing \\end{document}.");
      }
      const beginCount = (source.match(/\\begin\{/g) || []).length;
      const endCount = (source.match(/\\end\{/g) || []).length;
      if (beginCount !== endCount) {
        errors.push(`Environment mismatch: found ${beginCount} \\begin entries but ${endCount} \\end entries.`);
      }
      return errors;
    }

    function finishCompile(shouldHideChat) {
      editorShell.classList.remove("log-mode", "source-mode");
      editorShell.classList.add("preview-mode");
      lastCompiledSource = latexInput.value;
      renderPreview(lastCompiledSource);
      lastCompileLog = [
        "This is pdfTeX, Version 3.141592653-2.6-1.40.26 (prototype)",
        "entering extended mode",
        "(./main.tex",
        "LaTeX2e <2024-11-01> patch level 2",
        "Document Class: article 2024/06/29 v1.4n Standard LaTeX document class",
        "Package graphicx Info: Driver file pdftex.def loaded.",
        "[1]",
        "Output written on main.pdf (1 page, 42138 bytes).",
        "Transcript written on main.log."
      ].join("\n");
      terminalMode.classList.add("has-new-log");
      compileStrip.classList.remove("compiling");
      recompileButton.disabled = false;
      isCompiling = false;
      if (shouldHideChat) hideChat(compileMode);
    }

    function startCompile(options = {}) {
      if (isCompiling) return;
      const shouldHideChat = options.hideChat !== false;
      isCompiling = true;
      stage.classList.remove("source-active");
      setActive(compileMode);
      editorShell.classList.remove("source-mode", "log-mode");
      editorShell.classList.add("preview-mode");
      sourcePane.style.display = "none";
      previewPane.style.display = "block";
      mainLogPane.style.display = "none";
      compiledPaper.style.display = "block";
      pdfFrame.style.display = "none";
      compiledPaper.innerHTML = '<p class="compiled-body">Compiling LaTeX source...</p>';
      compileStrip.classList.add("compiling");
      recompileButton.disabled = true;
      if (shouldHideChat) hideChat(compileMode);
      setTimeout(() => finishCompile(shouldHideChat), 4000);
    }

    function showPreview(options = {}) {
      stage.classList.remove("source-active");
      setActive(compileMode);
      editorShell.classList.remove("source-mode", "log-mode");
      editorShell.classList.add("preview-mode");
      sourcePane.style.display = "none";
      previewPane.style.display = "block";
      mainLogPane.style.display = "none";
      compiledPaper.style.display = "block";
      pdfFrame.style.display = "none";
      if (options.hideChat !== false) hideChat(compileMode);
      renderPreview(lastCompiledSource);
      applyCitationHighlight();
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
      html = markActiveSourceText(text, html);
      return html;
    }

    function markActiveSourceText(text, html) {
      if (!activeSourceText) return html;
      const activeText = stripLatex(activeSourceText);
      const paragraphText = text.replace(/\s+/g, " ").trim();
      if (!activeText || !paragraphText) return html;
      if (activeText.includes(paragraphText)) {
        return `<span class="citation-hit">${html}</span>`;
      }
      if (paragraphText.includes(activeText)) {
        return html.replaceAll(
          escapeHTML(activeText),
          `<span class="citation-hit">${escapeHTML(activeText)}</span>`
        );
      }
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
