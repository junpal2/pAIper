const stage = document.getElementById("stage");
const editorShell = document.querySelector(".editor-shell");
const workspaceBody = document.querySelector(".workspace-body");
const rightPane = document.getElementById("rightPane");
const sourcePane = document.getElementById("sourcePane");
const previewPane = document.getElementById("previewPane");
const pdfFrame = document.getElementById("pdfFrame");
const compiledPaper = document.getElementById("compiledPaper");
const mainLogPane = document.getElementById("mainLogPane");
const mainLogBox = document.getElementById("mainLogBox");
const editorWrap = document.getElementById("editorWrap");
const highlightLayer = document.getElementById("highlightLayer");
const latexInput = document.getElementById("latexInput");
const lineNumbers = document.getElementById("lineNumbers");
const addContext = document.getElementById("addContext");
const chat = document.getElementById("chat");
const chatBody = document.getElementById("chatBody");
const chatTitle = document.getElementById("chatTitle");
const composerShell = document.getElementById("composerShell");
const composer = document.querySelector(".composer");
const contextList = document.getElementById("contextList");
const promptEnhancementStatus = document.getElementById("promptEnhancementStatus");
const promptBox = document.getElementById("prompt");
const sendButton = document.getElementById("send");
const acceptRewrite = document.getElementById("acceptRewrite");
const declineRewrite = document.getElementById("declineRewrite");
const plus = document.getElementById("plus");
const plusMenu = document.getElementById("plusMenu");
const addFilesOption = document.getElementById("addFilesOption");
const openLensOption = document.getElementById("openLensOption");
const guardTip = document.getElementById("guardTip");
const guardPanel = document.getElementById("guardPanel");
const guardBack = document.getElementById("guardBack");
const applyGuard = document.getElementById("applyGuard");
const lensInfoToggle = document.getElementById("lensInfoToggle");
const lensInfoPanel = document.getElementById("lensInfoPanel");
const customLensInput = document.getElementById("customLensInput");
const lensValidation = document.getElementById("lensValidation");
const closeChat = document.getElementById("closeChat");
const textMode = document.getElementById("textMode");
const compileMode = document.getElementById("compileMode");
const terminalMode = document.getElementById("terminalMode");
const railChat = document.getElementById("railChat");
const railHistory = document.getElementById("railHistory");
const fileRail = document.getElementById("fileRail");
const fileAddButton = document.getElementById("fileAddButton");
const latexFileInput = document.getElementById("latexFileInput");
const splitResizer = document.getElementById("splitResizer");
const pdfPrevButton = document.getElementById("pdfPrevButton");
const pdfNextButton = document.getElementById("pdfNextButton");
const pdfPageLabel = document.getElementById("pdfPageLabel");
const activeFileName = document.getElementById("activeFileName");
const sourceTabName = document.getElementById("sourceTabName");
const sourceZoomSlot = document.getElementById("sourceZoomSlot");
const switchPaneIcon = document.getElementById("switchPaneIcon");
const switchPaneLabel = document.getElementById("switchPaneLabel");
const rightModeTitleIcon = document.getElementById("rightModeTitleIcon");
const rightModeTitleText = document.getElementById("rightModeTitleText");
const compileStrip = document.getElementById("compileStrip");
const recompileButton = document.getElementById("recompileButton");
const zoomButton = document.getElementById("zoomButton");
const zoomLabel = document.getElementById("zoomLabel");
const zoomMenu = document.getElementById("zoomMenu");
const zoomOptions = [...document.querySelectorAll(".zoom-option")];
const toolButtons = [textMode, compileMode, terminalMode];
const checks = [...document.querySelectorAll(".guard-options input[type='checkbox']")];
const AI_CHAT_TITLE = "pAIper AI";

const initialLatex = `\\documentclass{article}
\\usepackage{graphicx} % Required for inserting images

\\title{FocusFlow: An Adaptive AI System Minimizing Digital Distractions via Real-time Eye-tracking}
\\author{Junseo Jang, Seohyun Kang, Jiyeon Park, Chaeyoung Huh, Jiho Lee}

\begin{document}

\\maketitle

\\begin{abstract}
Digital distractions such as notifications, visually salient interface elements, and irrelevant on-screen content often interrupt users' attention during focused tasks. This paper presents FocusFlow, an adaptive AI system that minimizes digital distractions through real-time eye-tracking. The proposed system monitors users' gaze behavior to detect moments of reduced concentration and dynamically responds by blurring non-essential screen elements or suppressing disruptive notifications. Rather than applying static focus modes, FocusFlow aims to provide context-sensitive intervention based on the user's attentional state. We describe the design motivation of the system, its core interaction concept, and its potential to support sustained attention in digitally demanding environments.
\\end{abstract}

\\section{Introduction}
Maintaining attention in digital environments has become increasingly difficult as users are constantly exposed to notifications, highlighted interface elements, and competing visual stimuli. Even when users intend to focus on a primary task such as reading, writing, or studying, their attention can easily shift toward irrelevant content on the screen. These repeated interruptions may reduce task efficiency, increase cognitive load, and make it harder for users to return to their original focus.

Existing approaches to distraction reduction often rely on manual settings such as “Do Not Disturb” modes, notification muting, or full-screen task environments. While these methods can be helpful, they usually apply the same level of restriction regardless of the user's real-time attentional state. As a result, they may either be too passive to prevent distraction or too rigid to adapt to changing task contexts.

In this paper, we propose FocusFlow, an adaptive AI system that uses real-time eye-tracking to detect moments when a user's concentration appears to weaken. When the system identifies signs of attentional drift, it selectively intervenes by blurring visually distracting interface components or temporarily blocking incoming notifications. The goal of FocusFlow is not simply to hide information, but to provide lightweight and timely support that helps users remain engaged with their main task.

Our work is motivated by the idea that distraction management should be responsive rather than static. By using gaze behavior as an interaction signal, FocusFlow seeks to support a more personalized and dynamic form of attention assistance. We explore how such a system can be positioned as an HCI research prototype and how adaptive interface interventions may improve focus in everyday digital work settings.

\\end{document}`;

const exampleLatex = `\\documentclass{article}
\\usepackage{graphicx} % Required for inserting images

\\title{FocusFlow: An Adaptive AI System Minimizing Digital Distractions via Real-time Eye-tracking}
\\author{Junseo Jang, Seohyun Kang, Jiyeon Park, Chaeyoung Huh, Jiho Lee}

\\begin{document}

\\maketitle

\\begin{abstract}
Digital distractions such as notifications, visually salient interface elements, and irrelevant on-screen content often interrupt users' attention during focused tasks. This paper presents FocusFlow, an adaptive AI system that minimizes digital distractions through real-time eye-tracking. The proposed system monitors users' gaze behavior to detect moments of reduced concentration and dynamically responds by blurring non-essential screen elements or suppressing disruptive notifications. Rather than applying static focus modes, FocusFlow aims to provide context-sensitive intervention based on the user's attentional state. We describe the design motivation of the system, its core interaction concept, and its potential to support sustained attention in digitally demanding environments.
\\end{abstract}

\\section{Introduction}
Maintaining attention in digital environments has become increasingly difficult as users are constantly exposed to notifications, highlighted interface elements, and competing visual stimuli. Even when users intend to focus on a primary task such as reading, writing, or studying, their attention can easily shift toward irrelevant content on the screen. These repeated interruptions may reduce task efficiency, increase cognitive load, and make it harder for users to return to their original focus.

Existing approaches to distraction reduction often rely on manual settings such as \`\`Do Not Disturb'' modes, notification muting, or full-screen task environments. While these methods can be helpful, they usually apply the same level of restriction regardless of the user's real-time attentional state. As a result, they may either be too passive to prevent distraction or too rigid to adapt to changing task contexts.

In this paper, we propose FocusFlow, an adaptive AI system that uses real-time eye-tracking to detect moments when a user's concentration appears to weaken. When the system identifies signs of attentional drift, it selectively intervenes by blurring visually distracting interface components or temporarily blocking incoming notifications. The goal of FocusFlow is not simply to hide information, but to provide lightweight and timely support that helps users remain engaged with their main task.

Our work is motivated by the idea that distraction management should be responsive rather than static. By using gaze behavior as an interaction signal, FocusFlow seeks to support a more personalized and dynamic form of attention assistance. We explore how such a system can be positioned as an HCI research prototype and how adaptive interface interventions may improve focus in everyday digital work settings.

\\section{Introduction}

\\end{document}`;

const contexts = [];
let selectedText = "";
let selectedLens = [];
let sent = false;
let answerShown = false;
let isGeneratingAnswer = false;
let safetyLensVisited = false;
let chatFlowState = "compose";
let originalPrompt = "";
let rewrittenPrompt = "";
let lastSentPrompt = "";
let lastMockResult = null;
let activeCitationName = "";
let activeSourceText = "";
const HISTORY_STORAGE_KEY = "wrtEvalChatSessions";
let chatSessions = [];
let currentMessages = [];
let activeSessionId = null;
let lastCompileLog = "No compile has been run yet.";
let lastCompiledSource = initialLatex;
let lastPdfUrl = "";
let isCompiling = false;
let currentPdfPage = 1;
let totalPdfPages = 1;
let previewPages = [];
const zoomLevels = [75, 100, 125, 150];
let currentZoom = 100;

const userPrompt = "이 부분에서 부족한 점이 뭐야?";
const safetyLensMockResponses = [
  {
    id: "source-citation",
    label: "Source & Citation Verification",
    description: "Checks whether claims are supported by credible sources.",
    rewrittenPrompt: "Identify the limitations of the selected paper section while verifying whether the claims are supported by credible sources. Check whether major statements require citations, distinguish evidence-based claims from unsupported assertions, and suggest where references should be added. Do not invent citations or assume that a source supports a claim unless it is explicitly provided.",
    mockResponse: [
      "Identify unsupported claims about digital distractions, cognitive load, real-time eye-tracking, and adaptive intervention.",
      "Suggest adding citations from HCI, cognitive psychology, eye-tracking research, and adaptive interface literature.",
      "Warn that claims about effectiveness should not be presented as proven unless evaluation data exists."
    ]
  },
  {
    id: "hallucination",
    label: "Hallucination Detection",
    description: "Restricts feedback to information present in the selected text.",
    rewrittenPrompt: "Identify the limitations of the selected paper section using only information that is explicitly present in the text. Clearly separate what is supported by the selected text from what is speculative or unsupported. Avoid inventing experimental results, user study findings, citations, implementation details, performance metrics, or conclusions that are not provided.",
    mockResponse: [
      "Confirm only what is present in the selected text.",
      "Flag claims such as improved productivity, reduced cognitive load, accurate attention detection, or user preference as unsupported unless they appear in the selected text.",
      "Tell the user that the current paper section is mostly conceptual if no evaluation is included."
    ]
  },
  {
    id: "clear-structured",
    label: "Clear & Structured Responses",
    description: "Encourages clear, organized answers that are easier to verify.",
    rewrittenPrompt: "Provide clear, structured feedback on the selected paper section. Organize the answer into concise sections, separate evidence-based observations from revision suggestions, and make the reasoning easy for users to verify.",
    mockResponse: [
      "Organize feedback into clear sections that users can scan and verify.",
      "Separate limitations, evidence gaps, and suggested revisions.",
      "Use concise wording and avoid vague or unsupported conclusions."
    ]
  },
  {
    id: "assumption",
    label: "Alternative Perspectives",
    description: "Challenges hidden assumptions and weak causal claims.",
    rewrittenPrompt: "Identify the limitations of the selected paper section by challenging hidden assumptions, weak causal claims, and design choices that may require further justification. Examine whether the argument relies on unproven assumptions, whether alternative explanations are possible, and whether additional evidence is needed to support the paper’s reasoning.",
    mockResponse: [
      "Challenge the assumption that gaze behavior reliably indicates reduced concentration.",
      "Challenge the assumption that blurring interface elements improves focus.",
      "Challenge the assumption that suppressing notifications is always beneficial.",
      "Ask whether adaptive focus support is actually better than static focus modes."
    ]
  },
  {
    id: "over-reliance",
    label: "Over-reliance Prevention",
    description: "Checks automation dependency and loss of user control.",
    rewrittenPrompt: "Identify the limitations of the selected paper section while examining whether the proposed AI system may encourage users to over-rely on automated decisions or reduce their own control. Check for risks related to automation dependency, loss of user agency, reduced self-regulation, and insufficient transparency. Suggest ways to keep users informed and in control.",
    mockResponse: [
      "Explain that users may become dependent on the system to manage attention.",
      "Point out risks of reduced user control if the system automatically blurs content or blocks notifications.",
      "Suggest override controls such as undo blur, allow notification, pause FocusFlow, and sensitivity settings.",
      "Suggest lightweight explanations when the system intervenes."
    ]
  },
  {
    id: "privacy",
    label: "Privacy Protection",
    description: "Checks anonymity, confidentiality, and gaze data safeguards.",
    rewrittenPrompt: "Identify the limitations of the selected paper section while explicitly checking risks related to participant anonymity, confidentiality, data minimization, re-identification, biometric or behavioral data sensitivity, and unintended disclosure. Avoid suggestions that require unnecessary sensitive data collection, and recommend safeguards for storing, processing, and sharing user data.",
    mockResponse: [
      "Explain that real-time eye-tracking may involve sensitive behavioral or biometric data.",
      "Ask what gaze data is collected, whether raw gaze data is stored, and how long it is retained.",
      "Recommend local processing, data minimization, encryption, access control, deletion policies, and avoiding raw gaze data release.",
      "Mention re-identification risk from gaze patterns."
    ]
  },
  {
    id: "ethical-bias",
    label: "Ethical Bias Reduction",
    description: "Checks representation, accessibility, and fairness concerns.",
    rewrittenPrompt: "Identify the limitations of the selected paper section while reviewing whether the research may exclude certain groups, misrepresent users, reinforce stereotypes, or rely on biased assumptions about attention, productivity, disability, neurodiversity, or digital behavior. Evaluate whether the proposed system would work fairly across different users, contexts, devices, and accessibility needs.",
    mockResponse: [
      "Explain that attention and gaze behavior vary across individuals.",
      "Mention neurodiversity and accessibility concerns, including ADHD, autism, visual impairments, fatigue, and different reading behaviors.",
      "Warn against treating non-standard attention patterns as simply problematic.",
      "Suggest diverse participant recruitment and careful reporting of demographic and contextual limitations."
    ]
  },
  {
    id: "custom",
    label: "Add Custom Enhancement",
    description: "Applies the user's custom safety review perspective.",
    rewrittenPrompt: "Rewrite the user's question according to the custom enhancement provided by the user. Apply the custom enhancement as the main review perspective while still avoiding unsupported claims, unnecessary sensitive data collection, and overconfident conclusions. Clearly explain how the selected text should be evaluated under this custom perspective.",
    mockResponse: [
      "Use the user's custom enhancement input.",
      "Generate a short custom rewritten prompt.",
      "Generate 2-4 mock findings based on the custom enhancement.",
      "Example: if the custom enhancement is Accessibility, discuss blur-based intervention risks, eye-tracking hardware availability, fallback modes, and inclusive interaction design."
    ]
  }
];

const lensAnswerText = {
  "source-citation": `The selected passage presents a broad motivation for the paper, but its main limitation is that it makes several claims without citing supporting evidence.

First, the statement that maintaining attention in digital environments has become "increasingly difficult" requires empirical support. The paper should cite prior work on digital distraction, notification overload, attention switching, or cognitive load.

Second, the passage claims that notifications, highlighted interface elements, and competing visual stimuli can shift users' attention away from primary tasks. This is plausible, but it should be grounded in HCI or cognitive psychology research rather than presented as self-evident.

Third, the phrase "irrelevant content" is not clearly defined. The paper should explain what counts as irrelevant content and whether this classification is based on user intention, task context, or system inference.

Suggested revision

The authors should add citations and define key concepts more carefully. For example:

Prior studies on digital interruption and attention switching suggest that notifications and visually salient interface elements can disrupt focused tasks such as reading, writing, or studying.

Claims that require evidence

Maintaining attention in digital environments has become increasingly difficult.
Notifications and visual stimuli frequently interrupt attention.
Users' attention easily shifts toward irrelevant content.
These interruptions affect reading, writing, or studying tasks.`,
  "hallucination": `Based only on the selected text, the passage states that digital environments contain notifications, highlighted interface elements, and competing visual stimuli, and that these may draw users' attention away from focused tasks.

A limitation is that the text does not provide evidence, examples, citations, measurements, or user study results. It also does not specify how attention shift is detected or how often it occurs.

The answer should not claim that these distractions reduce productivity, increase cognitive load, or harm learning outcomes unless those claims are supported elsewhere in the paper. The selected passage only supports the narrower claim that users' attention may shift toward irrelevant on-screen content.

Supported by the selected text

Users are exposed to notifications and visual stimuli.
Users may intend to focus on tasks such as reading, writing, or studying.
Attention can shift toward irrelevant on-screen content.

Unsupported based on the selected text alone

Notifications reduce productivity.
Visual stimuli increase cognitive load.
Users perform worse because of these distractions.
FocusFlow solves this problem effectively.

Suggested revision

The paper should either provide evidence for these claims or frame them as motivation rather than established findings.`,
  "clear-structured": `The response should be organized so that the user can quickly verify what is being claimed.

Suggested structure

Evidence-based observations
List only what is directly supported by the selected text.

Limitations
Identify missing evidence, unclear definitions, or unsupported claims.

Revision suggestions
Provide concrete edits or additions that would make the paper stronger.

Verification reminders
Mark which points require citations, user study results, implementation details, or additional explanation.`,
  "assumption": `A key limitation is that the passage relies on several assumptions that are not yet justified.

First, it assumes that notifications, highlighted interface elements, and competing visual stimuli are primarily distracting. However, some notifications may be urgent, useful, or directly related to the user's task.

Second, it assumes that attention shifting is undesirable. In some contexts, shifting attention may be necessary for multitasking, monitoring updates, collaboration, or responding to time-sensitive information.

Third, the passage assumes that "irrelevant content" can be clearly identified. However, relevance is highly contextual. Something that appears irrelevant to the system may actually be meaningful to the user.

Fourth, it assumes that digital environments have become more difficult for attention in general, but does not specify compared to what time period, user group, or type of environment.

Suggested revision

The authors should weaken the causal certainty and acknowledge context:

In many digital work settings, notifications and visually salient interface elements may contribute to attentional shifts away from a user's primary task, although the relevance and disruptiveness of such stimuli can vary depending on task context and user goals.`,
  "over-reliance": `A limitation is that the passage frames digital distraction as a problem that may invite automated intervention, but it does not yet address how users can remain in control of their own attention management.

If a system later uses this motivation to automatically suppress notifications or hide interface elements, users may become dependent on the system to decide what is relevant or irrelevant. This could reduce users' ability to self-regulate, prioritize information, or make their own judgments about interruptions.

The phrase "irrelevant content" is especially important. If the system decides what is irrelevant on behalf of the user, it may remove or hide information that the user actually wants to see.

Suggested revision

The paper should clarify that the system is intended to support, not replace, user agency. It should include user controls such as:

pause or disable interventions
manually restore hidden content
adjust sensitivity
choose which notifications should never be blocked
see why the system intervened

Potential limitation

The paper should avoid implying that automated distraction management is always better than user-controlled focus strategies.`,
  "privacy": `A limitation is that the selected passage motivates attention monitoring but does not discuss what data would be required to identify notifications, visual stimuli, or shifts in user attention.

To support the claim or build the proposed system, the research may need to collect sensitive information such as screen activity, notification content, app usage, task context, or gaze behavior. These data could reveal private work habits, personal interests, communication patterns, or sensitive on-screen information.

The passage also does not explain how "irrelevant content" would be detected without exposing or analyzing private screen content.

Suggested revision

The paper should include privacy safeguards early in the motivation. It should clarify:

whether raw screen or gaze data is collected
whether processing happens locally
whether notification content is stored
how long data is retained
how user identity is protected
whether users can delete or export their data

Safety-aware limitation

The system should follow data minimization principles and avoid collecting detailed behavioral or screen data unless strictly necessary.`,
  "ethical-bias": `A limitation is that the passage generalizes the experience of digital distraction without considering differences across users, tasks, and accessibility needs.

Not all users experience notifications or visual stimuli in the same way. For example, students, office workers, neurodivergent users, users with ADHD, users with visual impairments, and users working in collaborative settings may have different attention patterns and different needs.

The passage may also risk framing attention shifts as a universal problem, when in some contexts attention switching is normal, useful, or required. For some users, frequent attention shifts may reflect task demands rather than lack of focus.

The phrase "irrelevant content" may also introduce bias if the system assumes a standard model of productivity or attention. What counts as irrelevant may differ by user, culture, task, or working style.

Suggested revision

The paper should avoid universal claims and specify the target context more carefully:

For some users and task contexts, notifications and visually salient interface elements may contribute to attentional shifts away from a primary task. However, the impact of such stimuli can vary across users, accessibility needs, and work practices.

Representation-related limitation

The evaluation should include diverse users and should not treat one attention pattern as the default or ideal standard.`
};

const baselineLens = {
  id: "baseline",
  label: "Baseline Ethical Review",
  rewrittenPrompt: "Evaluate the selected paper section and the user's question with a cautious research-review perspective. Identify limitations, missing evidence, overconfident claims, and safety-relevant issues without inventing results, citations, or implementation details.",
  mockResponse: [
    "Separate confirmed statements from claims that still need evidence.",
    "Identify missing evaluation details and possible research limitations.",
    "Suggest revisions that make the paper more precise and less overconfident."
  ]
};
