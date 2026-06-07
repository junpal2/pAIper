    plus.addEventListener("click", (event) => {
      event.stopPropagation();
      guardTip.style.display = "none";
      guardPanel.classList.remove("open");
      plusMenu.classList.toggle("open");
    });
    plusMenu.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    addFilesOption.addEventListener("click", () => {
      closePlusMenu();
    });
    openLensOption.addEventListener("click", () => {
      closePlusMenu();
      openLensOptions();
    });
    guardBack.addEventListener("click", () => {
      guardPanel.classList.remove("open");
      lensValidation.style.display = "none";
      promptBox.focus();
    });
    lensInfoToggle.addEventListener("click", () => {
      lensInfoPanel.classList.toggle("open");
    });
    document.addEventListener("click", (event) => {
      if (!plusMenu.contains(event.target) && event.target !== plus) closePlusMenu();
    });
    checks.forEach(check => {
      check.addEventListener("change", () => {
        updateSelectedLensState();
      });
    });
    customLensInput.addEventListener("input", () => {
      if (chatFlowState === "lens") updateSelectedLensState();
    });

    function resetLensChecks() {
      checks.forEach((item) => {
        item.checked = item.disabled;
      });
      selectedLens = checks.filter(item => item.checked).map(item => item.value);
    }

    applyGuard.addEventListener("click", () => {
      if (!validateLensSelection()) return;
      applyLensRewrite();
      safetyLensVisited = true;
      guardPanel.classList.remove("open");
      openReviewCard(rewrittenPrompt);
      setSendArrow("up");
    });

    promptBox.addEventListener("input", () => {
      sent = false;
      if (chatFlowState !== "lens") {
        setComposerReviewMode(false);
        chatFlowState = safetyLensVisited ? "ready" : "compose";
        originalPrompt = "";
        rewrittenPrompt = "";
        if (!safetyLensVisited) {
          resetLensChecks();
        }
      }
      setSendArrow(safetyLensVisited ? "up" : "right");
      autoSizePrompt();
    });

    function autoSizePrompt() {
      const isReviewing = composer.classList.contains("reviewing");
      const minPromptHeight = isReviewing ? 122 : 30;
      const maxPromptHeight = isReviewing ? 360 : 164;
      if (!isReviewing && !promptBox.value.trim()) {
        promptBox.style.height = `${minPromptHeight}px`;
        promptBox.style.overflowY = "hidden";
        promptBox.scrollTop = 0;
        return;
      }
      promptBox.style.height = `${minPromptHeight}px`;
      const nextHeight = Math.min(Math.max(promptBox.scrollHeight, minPromptHeight), maxPromptHeight);
      promptBox.style.height = `${nextHeight}px`;
      promptBox.style.overflowY = promptBox.scrollHeight > maxPromptHeight ? "auto" : "hidden";
      if (!promptBox.value.trim()) promptBox.scrollTop = 0;
    }

    function getLensDefinition(id) {
      return safetyLensMockResponses.find(lens => lens.id === id);
    }

    function getSelectedPaperText() {
      return contexts.length
        ? contexts.join("\n\n")
        : latexInput.value;
    }

    function getAppliedLensDefinitions(selectedLensIds) {
      const lensDefinitions = selectedLensIds.map(getLensDefinition).filter(Boolean);
      return lensDefinitions.length ? lensDefinitions : [baselineLens];
    }

    function buildFinalRewrittenPrompt(userQuestion, selectedTextForPrompt, selectedLensIds, customLensText) {
      if (!selectedLensIds.length) {
        return userQuestion;
      }
      const lensDefinitions = selectedLensIds.map(getLensDefinition).filter(Boolean);
      return lensDefinitions.map((lens) => {
        const customLine = lens.id === "custom" && customLensText
          ? ` Custom lens provided by user: ${customLensText}.`
          : "";
        return `${lens.rewrittenPrompt}${customLine}`;
      }).join("\n\n");
    }

    function normalizeLensPrompt(text) {
      let normalized = String(text || "");
      const wrappedMatch = normalized.match(/Apply the following safety lenses:\s*([\s\S]*?)\n\s*Task:/i);
      if (wrappedMatch) normalized = wrappedMatch[1];
      normalized = normalized
        .split(/\n+/)
        .map(line => line.replace(/^\*\s*[^:]+:\s*/, "").trim())
        .filter(Boolean)
        .join("\n\n")
        .trim();
      return normalized || String(text || "");
    }

    function normalizeSession(session) {
      const next = { ...session };
      next.messages = (session.messages || []).map((message) => {
        const prompt = normalizeLensPrompt(message.prompt);
        const result = message.result ? { ...message.result } : message.result;
        if (result?.rewrittenPrompt) result.rewrittenPrompt = normalizeLensPrompt(result.rewrittenPrompt);
        return { ...message, prompt, result };
      });
      next.title = sessionTitle(next.messages);
      return next;
    }

    function validateLensSelection(showMessage = true) {
      const customSelected = checks.some(item => item.value === "custom" && item.checked);
      const customLensText = customLensInput.value.trim();
      const invalid = customSelected && !customLensText;
      lensValidation.textContent = invalid ? "Enter a custom lens before applying this option." : "";
      lensValidation.style.display = invalid && showMessage ? "block" : "none";
      return !invalid;
    }

    function generateMockLLMResponse({ selectedText: sourceText, userQuestion, selectedLensIds, customLensText }) {
      const lensDefinitions = getAppliedLensDefinitions(selectedLensIds);
      const appliedLenses = lensDefinitions.map((lens) => (
        lens.id === "custom" && customLensText ? `${lens.label}: ${customLensText}` : lens.label
      ));
      const finalPrompt = buildFinalRewrittenPrompt(userQuestion, sourceText, selectedLensIds, customLensText);
      const directAnswer = selectedLensIds
        .map(id => lensAnswerText[id])
        .filter(Boolean)
        .join("\n\n");
      const safetyFindings = lensDefinitions.map((lens) => {
        const findings = lens.id === "custom" && customLensText
          ? [
            `Apply the custom perspective "${customLensText}" to the selected section before making improvement suggestions.`,
            "Check that the feedback stays grounded in the selected text and does not invent missing study results.",
            "Identify 2-4 concrete revision opportunities that match the custom perspective.",
            "Avoid overconfident conclusions that would require new evidence."
          ]
          : lens.mockResponse;
        return { lens: lens.label, findings };
      });

      return {
        originalQuestion: userQuestion,
        selectedText: sourceText,
        appliedLenses,
        rewrittenPrompt: finalPrompt,
        directAnswer,
        mainAnswer: "The selected section can be improved by making the research claims more precise, separating conceptual motivation from evaluated results, and explicitly stating what evidence is still missing. The feedback below is limited to the selected text and does not assume that an experiment, user study, or performance result already exists.",
        safetyFindings,
        suggestedRevisions: [
          "Add a short limitation sentence clarifying that the current section describes the system concept unless evaluation data is provided elsewhere.",
          "Specify what evidence would be needed to support claims about attention, focus improvement, or reduced cognitive load.",
          "Describe user control mechanisms such as pause, undo, sensitivity adjustment, or explanation of interventions.",
          "State how gaze-related data would be minimized, protected, and separated from personally identifiable information."
        ],
        unsupportedClaimsToAvoid: [
          "Do not claim that FocusFlow improves productivity unless a study result is provided.",
          "Do not claim that gaze behavior always indicates reduced concentration.",
          "Do not invent citations, participant numbers, statistical results, or implementation details.",
          "Do not recommend collecting additional sensitive gaze data unless it is necessary and justified."
        ]
      };
    }

    function inferCitationTarget(text) {
      const normalized = text.toLowerCase();
      if (/personalized|dynamic|attention assistance|context-sensitive|responsive/.test(normalized)) return "responsive";
      if (/gaze|eye-tracking|attention|concentration|focus|cognitive load|biometric/.test(normalized)) return "gaze";
      return "";
    }

    function eyeIcon(hidden = true) {
      const slash = hidden ? '<path d="M4 20 20 4"/>' : "";
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z"/>
          <path d="M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/>
          ${slash}
        </svg>`;
    }

    function clearSourceHighlightButtons() {
      chatBody.querySelectorAll(".source-highlight-button").forEach((button) => {
        button.classList.remove("active");
        button.innerHTML = eyeIcon(true);
      });
    }

    function clearCitationHighlight() {
      activeCitationName = "";
      activeSourceText = "";
      compiledPaper.querySelectorAll(".citation-hit").forEach(node => node.classList.remove("citation-hit"));
      renderPreview(lastCompiledSource);
      updateHighlight();
    }

    function applyCitationHighlight() {
      compiledPaper.querySelectorAll(".citation-hit").forEach(node => node.classList.remove("citation-hit"));
      renderPreview(lastCompiledSource);
      updateHighlight();
      if (!activeCitationName) return;
      const target = compiledPaper.querySelector(`[data-cite="${activeCitationName}"]`);
      if (target) target.classList.add("citation-hit");
    }

    function createSourceHighlightButton(sourceText) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "source-highlight-button";
      button.setAttribute("aria-label", "Highlight source used for this answer");
      button.innerHTML = eyeIcon(true);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const isActive = button.classList.contains("active");
        if (isActive) {
          clearSourceHighlightButtons();
          clearCitationHighlight();
          return;
        }
        clearSourceHighlightButtons();
        button.classList.add("active");
        button.innerHTML = eyeIcon(false);
        highlightSourceText(sourceText);
      });
      return button;
    }

    function appendEvidenceText(parent, text) {
      const row = document.createElement("div");
      row.className = "evidence-row";
      const content = document.createElement("span");
      content.textContent = text;
      row.appendChild(content);
      parent.appendChild(row);
    }

    function appendList(parent, items) {
      const list = document.createElement("ul");
      items.forEach((item) => {
        const li = document.createElement("li");
        appendEvidenceText(li, item);
        list.appendChild(li);
      });
      parent.appendChild(list);
    }

    const directAnswerHeadings = new Set([
      "Suggested revision",
      "Claims that require evidence",
      "Supported by the selected text",
      "Unsupported based on the selected text alone",
      "Potential limitation",
      "Safety-aware limitation",
      "Representation-related limitation"
    ]);

    function renderDirectAnswer(text) {
      const section = document.createElement("section");
      section.className = "result-section direct-answer";
      const blocks = text.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
      const appendDirectText = (parent, line) => {
        appendEvidenceText(parent, line);
      };
      blocks.forEach((block) => {
        const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
        if (!lines.length) return;
        if (lines.length === 1 && directAnswerHeadings.has(lines[0])) {
          const heading = document.createElement("h4");
          heading.textContent = lines[0];
          section.appendChild(heading);
          return;
        }
        if (lines.length > 1) {
          const list = document.createElement("ul");
          lines.forEach((line) => {
            const li = document.createElement("li");
            appendDirectText(li, line);
            list.appendChild(li);
          });
          section.appendChild(list);
          return;
        }
        const paragraph = document.createElement("div");
        appendDirectText(paragraph, lines[0]);
        section.appendChild(paragraph);
      });
      return section;
    }

    function renderMockResult(result) {
      const row = document.createElement("div");
      row.className = "bot-result-row";
      const card = document.createElement("div");
      card.className = "mock-result";

      if (result.directAnswer) {
        card.appendChild(renderDirectAnswer(result.directAnswer));
        row.append(card, createSourceHighlightButton(result.selectedText || ""));
        return row;
      }

      const main = document.createElement("section");
      main.className = "result-section";
      main.innerHTML = "<h4>Main answer</h4>";
      const mainText = document.createElement("div");
      appendEvidenceText(mainText, result.mainAnswer);
      main.appendChild(mainText);
      card.appendChild(main);

      const findings = document.createElement("section");
      findings.className = "result-section";
      findings.innerHTML = "<h4>Safety-related limitations</h4>";
      result.safetyFindings.forEach((group) => {
        const title = document.createElement("p");
        title.innerHTML = `<strong>${escapeHTML(group.lens)}</strong>`;
        findings.appendChild(title);
        appendList(findings, group.findings);
      });
      card.appendChild(findings);

      const revisions = document.createElement("section");
      revisions.className = "result-section";
      revisions.innerHTML = "<h4>Suggested revisions</h4>";
      appendList(revisions, result.suggestedRevisions);
      card.appendChild(revisions);

      const unsupported = document.createElement("section");
      unsupported.className = "result-section";
      unsupported.innerHTML = "<h4>Unsupported claims or risks to avoid</h4>";
      appendList(unsupported, result.unsupportedClaimsToAvoid);
      card.appendChild(unsupported);

      row.append(card, createSourceHighlightButton(result.selectedText || ""));
      return row;
    }

    sendButton.addEventListener("click", () => {
      showChat();
      composerShell.style.display = "flex";
      if (!promptBox.value.trim()) {
        promptBox.focus();
        autoSizePrompt();
        return;
      }
      if (chatFlowState === "compose" && !safetyLensVisited) {
        openLensOptions();
        return;
      }
      if (chatFlowState === "lens") {
        if (!validateLensSelection()) return;
        applyLensRewrite();
        safetyLensVisited = true;
        guardPanel.classList.remove("open");
        openReviewCard(rewrittenPrompt);
        setSendArrow("up");
        return;
      }
      if (chatFlowState === "review") {
        return;
      }
      sendPrompt();
    });

    function openLensOptions() {
      closePlusMenu();
      guardTip.style.display = "none";
      setComposerReviewMode(false);
      showChat();
      composerShell.style.display = "flex";
      if (chatFlowState !== "lens") {
        originalPrompt = promptBox.value.trim() || userPrompt;
      }
      chatFlowState = "lens";
      guardPanel.classList.add("open");
      updateSelectedLensState();
    }

    function updateSelectedLensState() {
      selectedLens = checks.filter(item => item.checked).map(item => item.value);
      applyGuard.classList.add("enabled");
      if (!originalPrompt) originalPrompt = promptBox.value.trim() || userPrompt;
      validateLensSelection(false);
    }

    function applyLensRewrite() {
      updateSelectedLensState();
      rewrittenPrompt = buildFinalRewrittenPrompt(originalPrompt, getSelectedPaperText(), selectedLens, customLensInput.value.trim());
      promptBox.value = rewrittenPrompt;
      autoSizePrompt();
    }

    function openReviewCard(text) {
      chatFlowState = "review";
      promptBox.value = text;
      setComposerReviewMode(true);
      autoSizePrompt();
    }

    function setComposerReviewMode(isReviewing) {
      composer.classList.toggle("reviewing", isReviewing);
    }

    function setSendArrow(direction) {
      sendButton.classList.toggle("arrow-right", direction !== "up");
    }

    setSendArrow("right");

    acceptRewrite.addEventListener("click", () => {
      rewrittenPrompt = promptBox.value;
      originalPrompt = "";
      safetyLensVisited = true;
      chatFlowState = "ready";
      setComposerReviewMode(false);
      setSendArrow("up");
      autoSizePrompt();
      promptBox.focus();
    });

    declineRewrite.addEventListener("click", () => {
      promptBox.value = originalPrompt || "";
      rewrittenPrompt = "";
      resetLensChecks();
      lensValidation.style.display = "none";
      safetyLensVisited = true;
      chatFlowState = "ready";
      setComposerReviewMode(false);
      setSendArrow("up");
      autoSizePrompt();
      promptBox.focus();
    });

    function contextPreview(text) {
      const chip = document.createElement("div");
      chip.className = "context-chip";
      const label = document.createElement("span");
      label.className = "context-chip-text";
      label.textContent = textClip(text, 190);
      chip.appendChild(label);
      chip.addEventListener("click", () => highlightCitation(text.includes("personalized") ? "responsive" : "gaze"));
      const x = document.createElement("button");
      x.className = "remove-chip";
      x.type = "button";
      x.textContent = "×";
      chip.appendChild(x);
      return chip;
    }

    function sendPrompt() {
      if (isGeneratingAnswer) return;
      const questionToSend = promptBox.value.trim() || originalPrompt || userPrompt;
      if (!questionToSend) return;
      if (!validateLensSelection()) {
        chatFlowState = "lens";
        guardPanel.classList.add("open");
        return;
      }
      lastSentPrompt = questionToSend;
      const pendingResult = generateMockLLMResponse({
        selectedText: getSelectedPaperText(),
        userQuestion: questionToSend,
        selectedLensIds: selectedLens,
        customLensText: customLensInput.value.trim()
      });
      chatBody.appendChild(createUserMessage(lastSentPrompt));
      const typing = createTypingMessage();
      chatBody.appendChild(typing);
      chatBody.scrollTop = chatBody.scrollHeight;
      isGeneratingAnswer = true;
      sent = true;
      answerShown = false;
      chatFlowState = "generating";
      setComposerReviewMode(false);
      guardPanel.classList.remove("open");
      promptBox.value = "";
      originalPrompt = "";
      rewrittenPrompt = "";
      autoSizePrompt();
      setTimeout(() => {
        lastMockResult = pendingResult;
        currentMessages.push({
          prompt: lastSentPrompt,
          result: lastMockResult
        });
        isGeneratingAnswer = false;
        answerShown = true;
        chatFlowState = "ready";
        safetyLensVisited = true;
        setSendArrow("up");
        saveCurrentSession();
        renderConversation();
      }, 2000);
    }

    function createUserMessage(text) {
      const user = document.createElement("div");
      user.className = "message user";
      user.textContent = text;
      return user;
    }

    function createTypingMessage() {
      const typing = document.createElement("div");
      typing.className = "typing-message";
      typing.innerHTML = 'Generating answer<span class="typing-dots"><span></span><span></span><span></span></span>';
      return typing;
    }

    function renderAnsweredChat() {
      if (currentMessages.length) {
        renderConversation();
        return;
      }
      if (!lastSentPrompt || !lastMockResult) return;
      chatBody.innerHTML = "";
      chatBody.append(createUserMessage(lastSentPrompt), renderMockResult(lastMockResult));
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function renderConversation() {
      chatBody.innerHTML = "";
      currentMessages.forEach((message) => {
        chatBody.append(createUserMessage(message.prompt), renderMockResult(message.result));
      });
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function getDefaultChatSessions() {
      const introContext = "Maintaining attention in digital environments has become increasingly difficult as users are constantly exposed to notifications, highlighted interface elements, and competing visual stimuli. Even when users intend to focus on a primary task such as reading, writing, or studying, their attention can easily shift toward irrelevant content on the screen.";
      const existingContext = "Existing approaches to distraction reduction often rely on manual settings such as ``Do Not Disturb'' modes, notification muting, or full-screen task environments.";
      const sourcePrompt = buildFinalRewrittenPrompt("What are the limitations?", introContext, ["source-citation"], "");
      const privacyPrompt = buildFinalRewrittenPrompt("What risks should be checked?", introContext, ["privacy"], "");
      const overReliancePrompt = buildFinalRewrittenPrompt("What should be improved?", existingContext, ["over-reliance"], "");
      return [
        {
          id: "dummy-source-citation",
          title: shortHistoryTitle(sourcePrompt),
          date: "June, 3rd",
          contexts: [introContext],
          messages: [{
            prompt: sourcePrompt,
            result: generateMockLLMResponse({
              selectedText: introContext,
              userQuestion: sourcePrompt,
              selectedLensIds: ["source-citation"],
              customLensText: ""
            })
          }]
        },
        {
          id: "dummy-privacy",
          title: shortHistoryTitle(privacyPrompt),
          date: "June, 2nd",
          contexts: [introContext],
          messages: [{
            prompt: privacyPrompt,
            result: generateMockLLMResponse({
              selectedText: introContext,
              userQuestion: privacyPrompt,
              selectedLensIds: ["privacy"],
              customLensText: ""
            })
          }]
        },
        {
          id: "dummy-over-reliance",
          title: shortHistoryTitle(overReliancePrompt),
          date: "June, 1st",
          contexts: [existingContext],
          messages: [{
            prompt: overReliancePrompt,
            result: generateMockLLMResponse({
              selectedText: existingContext,
              userQuestion: overReliancePrompt,
              selectedLensIds: ["over-reliance"],
              customLensText: ""
            })
          }]
        }
      ];
    }

    function loadChatSessions() {
      try {
        const saved = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
        if (Array.isArray(saved) && saved.length) {
          const normalized = saved.map(normalizeSession);
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        }
        return getDefaultChatSessions().map(normalizeSession);
      } catch {
        return getDefaultChatSessions().map(normalizeSession);
      }
    }

    function persistChatSessions() {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(chatSessions));
    }

    function shortHistoryTitle(text) {
      const summary = String(text || "Saved review")
        .replace(/\s+/g, " ")
        .trim();
      return summary.length > 42 ? `${summary.slice(0, 42)}...` : summary;
    }

    function sessionTitle(messages) {
      const latestPrompt = messages.at(-1)?.prompt || messages[0]?.prompt || "Saved review";
      return shortHistoryTitle(latestPrompt);
    }

    function sessionDate() {
      return "June, 3rd";
    }

    function saveCurrentSession() {
      if (!currentMessages.length) return;
      const snapshot = {
        id: activeSessionId || `chat-${Date.now()}`,
        title: sessionTitle(currentMessages),
        date: sessionDate(),
        messages: JSON.parse(JSON.stringify(currentMessages)),
        contexts: [...contexts]
      };
      const existingIndex = chatSessions.findIndex(session => session.id === snapshot.id);
      if (existingIndex >= 0) chatSessions.splice(existingIndex, 1);
      chatSessions.unshift(snapshot);
      activeSessionId = snapshot.id;
      persistChatSessions();
    }

    function resetCurrentChat() {
      currentMessages = [];
      activeSessionId = null;
      lastSentPrompt = "";
      lastMockResult = null;
      sent = false;
      answerShown = false;
      isGeneratingAnswer = false;
      safetyLensVisited = false;
      chatFlowState = "compose";
      originalPrompt = "";
      rewrittenPrompt = "";
      resetLensChecks();
      activeCitationName = "";
      activeSourceText = "";
      contexts.splice(0, contexts.length);
      renderContext();
      chatBody.innerHTML = "";
      clearSourceHighlightButtons();
      clearCitationHighlight();
      promptBox.value = "";
      setComposerReviewMode(false);
      setSendArrow("right");
      guardPanel.classList.remove("open");
      autoSizePrompt();
    }

    function openNewChat() {
      resetCurrentChat();
      showChat();
      composerShell.style.display = "flex";
      setActive(textMode);
      promptBox.focus();
    }

    function restoreChatSession(sessionId) {
      const session = chatSessions.find(item => item.id === sessionId);
      if (!session) return;
      activeSessionId = session.id;
      currentMessages = normalizeSession(session).messages;
      contexts.splice(0, contexts.length, ...(session.contexts || []));
      renderContext();
      lastSentPrompt = currentMessages.at(-1)?.prompt || "";
      lastMockResult = currentMessages.at(-1)?.result || null;
      sent = Boolean(currentMessages.length);
      answerShown = Boolean(currentMessages.length);
      isGeneratingAnswer = false;
      safetyLensVisited = true;
      chatFlowState = "compose";
      originalPrompt = "";
      rewrittenPrompt = "";
      resetLensChecks();
      activeCitationName = "";
      activeSourceText = "";
      promptBox.value = "";
      setComposerReviewMode(false);
      setSendArrow("up");
      guardPanel.classList.remove("open");
      clearCitationHighlight();
      showChat();
      composerShell.style.display = "flex";
      renderConversation();
      autoSizePrompt();
    }

    function handleCloseChat() {
      saveCurrentSession();
      showPreview();
    }

    function toggleAIPanel() {
      if (rightPane.classList.contains("ai-mode") || rightPane.classList.contains("history-mode")) {
        saveCurrentSession();
        showPreview();
        return;
      }
      showChat();
      composerShell.style.display = "flex";
      if (currentMessages.length) renderConversation();
      autoSizePrompt();
      promptBox.focus();
    }

    function highlightCitation(name) {
      activeCitationName = name;
      activeSourceText = "";
      showChat();
      composerShell.style.display = "flex";
      applyCitationHighlight();
      const targetText = getCitationTargetText(name);
      const targetIndex = latexInput.value.indexOf(targetText);
      if (targetIndex >= 0 && sourcePane.style.display !== "none") {
        const before = latexInput.value.slice(0, targetIndex);
        const line = before.split("\n").length - 1;
        latexInput.scrollTop = Math.max(0, line * 24 - 120);
        lineNumbers.scrollTop = latexInput.scrollTop;
        updateHighlight();
      } else if (targetIndex >= 0) {
        showSource({ hideChat: false });
        showChat();
        composerShell.style.display = "flex";
        const before = latexInput.value.slice(0, targetIndex);
        const line = before.split("\n").length - 1;
        latexInput.scrollTop = Math.max(0, line * 24 - 120);
        lineNumbers.scrollTop = latexInput.scrollTop;
        updateHighlight();
      }
    }

    function highlightSourceText(sourceText) {
      activeCitationName = "";
      activeSourceText = sourceText;
      showChat();
      composerShell.style.display = "flex";
      applyCitationHighlight();

      const targetIndex = latexInput.value.indexOf(sourceText);
      const fallbackTarget = targetIndex >= 0
        ? ""
        : sourceText.split("\n").map(line => line.trim()).find(line => line && latexInput.value.includes(line));
      const scrollIndex = targetIndex >= 0 ? targetIndex : (fallbackTarget ? latexInput.value.indexOf(fallbackTarget) : -1);
      if (scrollIndex < 0) return;
      if (sourcePane.style.display === "none") {
        showSource({ hideChat: false });
        showChat();
        composerShell.style.display = "flex";
      }
      const before = latexInput.value.slice(0, scrollIndex);
      const line = before.split("\n").length - 1;
      latexInput.scrollTop = Math.max(0, line * 24 - 120);
      lineNumbers.scrollTop = latexInput.scrollTop;
      updateHighlight();
    }

    function showHistory() {
      showChat("Chat History");
      composerShell.style.display = "none";
      chatBody.innerHTML = "";
      const newChatButton = document.createElement("button");
      newChatButton.className = "start-new-chat";
      newChatButton.type = "button";
      newChatButton.textContent = "Start new chat";
      newChatButton.addEventListener("click", openNewChat);
      chatBody.appendChild(newChatButton);
      chatSessions.forEach((session) => {
        const row = document.createElement("div");
        row.className = "history-row";
        row.innerHTML = `<strong>${escapeHTML(sessionTitle(session.messages || []))}</strong><span class="history-date">${escapeHTML(session.date)}</span>`;
        row.addEventListener("click", () => restoreChatSession(session.id));
        chatBody.appendChild(row);
      });
      setActive(textMode);
    }
