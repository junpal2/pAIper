    function setActive(button) {
      if (toolButtons.includes(button)) {
        toolButtons.forEach(item => item.classList.toggle("active", item === button));
      }
    }

    function setChatRailActive(button) {
      railChat.classList.toggle("active", button === railChat);
      railHistory.classList.toggle("active", button === railHistory);
    }

    function setRightPaneMode(mode) {
      rightPane.classList.remove("pdf-mode", "ai-mode", "history-mode", "log-mode");
      rightPane.classList.add(`${mode}-mode`);
      if (mode === "pdf" || mode === "log") {
        switchPaneIcon.src = "assets/icons/chatbox-button.svg";
        switchPaneLabel.textContent = "Switch to pAIper AI";
        rightModeTitleIcon.src = "assets/icons/chatbox-button.svg";
        rightModeTitleText.textContent = "pAIper AI";
        setChatRailActive(null);
      } else {
        switchPaneIcon.src = "assets/icons/fi-rr-file-pdf.svg";
        switchPaneLabel.textContent = "Switch to PDF";
        rightModeTitleIcon.src = mode === "history" ? "assets/icons/fi-rr-time-past.svg" : "assets/icons/chatbox-button.svg";
        rightModeTitleText.textContent = mode === "history" ? "Chat History" : "pAIper AI";
        setChatRailActive(mode === "history" ? railHistory : railChat);
      }
      previewPane.style.display = mode === "pdf" ? "block" : "none";
      mainLogPane.style.display = mode === "log" ? "flex" : "none";
      chat.style.display = mode === "ai" || mode === "history" ? "grid" : "none";
    }

    function showChat(title = AI_CHAT_TITLE) {
      chat.classList.remove("closed");
      chat.classList.toggle("history-open", title === "Chat History");
      chatTitle.textContent = title;
      setRightPaneMode(title === "Chat History" ? "history" : "ai");
    }

    function clearContextSelection() {
      selectedText = "";
      addContext.style.display = "none";
      window.getSelection()?.removeAllRanges();
      if (latexInput.selectionStart !== latexInput.selectionEnd) {
        const collapseAt = latexInput.selectionEnd;
        latexInput.setSelectionRange(collapseAt, collapseAt);
      }
    }

    function closePlusMenu() {
      plusMenu.classList.remove("open");
    }

    function hideChat(activeButton = textMode) {
      chat.classList.remove("history-open");
      setRightPaneMode("pdf");
      clearContextSelection();
      closePlusMenu();
      setActive(activeButton);
    }

    function applyZoom(zoom) {
      currentZoom = zoomLevels.includes(zoom) ? zoom : 100;
      const codeSize = 20 * zoom / 100;
      const codeLineHeight = 24 * zoom / 100;
      const logSize = 16 * zoom / 100;
      const logLineHeight = 21.6 * zoom / 100;
      zoomLabel.textContent = `${zoom}%`;
      zoomOptions.forEach(option => option.classList.toggle("active", Number(option.dataset.zoom) === zoom));
      compiledPaper.style.transform = "none";
      compiledPaper.style.transformOrigin = "top center";
      editorWrap.style.fontSize = `${codeSize}px`;
      editorWrap.style.lineHeight = `${codeLineHeight}px`;
      lineNumbers.style.fontSize = `${codeSize}px`;
      lineNumbers.style.lineHeight = `${codeLineHeight}px`;
      mainLogBox.style.fontSize = `${logSize}px`;
      mainLogBox.style.lineHeight = `${logLineHeight}px`;
      updateEditorView();
    }

    function closeZoomMenu() {
      zoomMenu.classList.remove("open");
      zoomButton.setAttribute("aria-expanded", "false");
    }

    zoomButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = zoomMenu.classList.toggle("open");
      zoomButton.setAttribute("aria-expanded", String(isOpen));
    });

    zoomOptions.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        applyZoom(Number(option.dataset.zoom));
        closeZoomMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (!zoomMenu.contains(event.target) && event.target !== zoomButton) closeZoomMenu();
    });
