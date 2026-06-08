    function showTerminal(log = lastCompileLog) {
      setActive(terminalMode);
      terminalMode.classList.remove("has-new-log");
      setRightPaneMode("log");
      editorShell.classList.remove("preview-mode");
      editorShell.classList.add("log-mode");
      sourcePane.style.display = "grid";
      mainLogPane.style.display = "flex";
      const text = Array.isArray(log)
        ? log.map((error, index) => `Error ${index + 1}: ${error}`).join("\n")
        : String(log || "No compiler log is available.");
      mainLogBox.textContent = text;
    }
