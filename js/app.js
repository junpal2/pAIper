chatSessions = loadChatSessions();
latexInput.value = initialLatex;
setSendArrow("right");
setActive(textMode);
setRightPaneMode("ai");
sourceZoomSlot.appendChild(document.querySelector(".zoom-wrap"));
textMode.addEventListener("click", showSource);
compileMode.addEventListener("click", () => showPreview());
recompileButton.addEventListener("click", () => startCompile());
terminalMode.addEventListener("click", () => showTerminal());
railChat.addEventListener("click", toggleAIPanel);
railHistory.addEventListener("click", showHistory);
closeChat.addEventListener("click", handleCloseChat);
fileRail.addEventListener("click", () => {
  workspaceBody.classList.toggle("file-open");
  workspaceBody.style.gridTemplateColumns = "";
  fileRail.classList.toggle("active", workspaceBody.classList.contains("file-open"));
  updateEditorView();
});
fileAddButton.addEventListener("click", () => latexFileInput.click());
latexFileInput.addEventListener("change", () => {
  const file = latexFileInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    latexInput.value = String(reader.result || "");
    const name = file.name || "main.tex";
    activeFileName.textContent = name;
    sourceTabName.textContent = name;
    lastCompiledSource = latexInput.value;
    currentPdfPage = 1;
    showSource({ hideChat: false });
    renderPreview(lastCompiledSource);
    updateEditorView();
  });
  reader.readAsText(file);
  latexFileInput.value = "";
});
pdfPrevButton.addEventListener("click", () => {
  if (currentPdfPage <= 1) return;
  currentPdfPage -= 1;
  renderPreview(lastCompiledSource);
});
pdfNextButton.addEventListener("click", () => {
  if (currentPdfPage >= totalPdfPages) return;
  currentPdfPage += 1;
  renderPreview(lastCompiledSource);
});
splitResizer.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  splitResizer.setPointerCapture(event.pointerId);
  const resize = (moveEvent) => {
    const rect = workspaceBody.getBoundingClientRect();
    const railWidth = 56;
    const fileWidth = workspaceBody.classList.contains("file-open") ? 300 : 0;
    const resizerWidth = 16;
    const minSource = 360;
    const minRight = 520;
    const available = rect.width - railWidth - fileWidth - resizerWidth;
    let sourceWidth = moveEvent.clientX - rect.left - railWidth - fileWidth;
    sourceWidth = Math.max(minSource, Math.min(sourceWidth, available - minRight));
    const rightWidth = available - sourceWidth;
    workspaceBody.style.gridTemplateColumns = workspaceBody.classList.contains("file-open")
      ? `${railWidth}px ${fileWidth}px ${sourceWidth}px ${resizerWidth}px ${rightWidth}px`
      : `${railWidth}px ${sourceWidth}px ${resizerWidth}px ${rightWidth}px`;
    updateEditorView();
  };
  const stop = () => {
    splitResizer.removeEventListener("pointermove", resize);
    splitResizer.removeEventListener("pointerup", stop);
    splitResizer.removeEventListener("pointercancel", stop);
  };
  splitResizer.addEventListener("pointermove", resize);
  splitResizer.addEventListener("pointerup", stop);
  splitResizer.addEventListener("pointercancel", stop);
});
document.getElementById("undoButton").addEventListener("click", () => {
  latexInput.focus();
  document.execCommand("undo");
  updateEditorView();
});
document.getElementById("redoButton").addEventListener("click", () => {
  latexInput.focus();
  document.execCommand("redo");
  updateEditorView();
});
renderPreview(lastCompiledSource);
updateEditorView();
autoSizePrompt();
