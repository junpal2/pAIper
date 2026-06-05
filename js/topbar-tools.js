    function setActive(button) {
      toolButtons.forEach(item => item.classList.toggle("active", item === button));
    }

    function showChat(title = "Chat Box") {
      chat.classList.remove("closed");
      chat.classList.toggle("history-open", title === "Chat History");
      stage.classList.remove("chat-hidden");
      chatTitle.textContent = title;
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
      chat.classList.add("closed");
      stage.classList.add("chat-hidden");
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
      compiledPaper.style.transform = `scale(${zoom / 100})`;
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
