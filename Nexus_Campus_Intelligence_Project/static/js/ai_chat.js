/**
 * Interactive AI Decision Advisor Chat Interface
 * Allows conversational querying of student data, cohort risks, and syllabus pacing.
 */

window.AIChat = {
  currentStudentId: null,

  init(studentId = null) {
    this.currentStudentId = studentId;
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const input = document.getElementById('ai-chat-input');

    if (sendBtn && input) {
      sendBtn.onclick = () => this.handleSend();
      input.onkeypress = (e) => {
        if (e.key === 'Enter') this.handleSend();
      };
    }
  },

  askPrompt(text) {
    const input = document.getElementById('ai-chat-input');
    if (input) {
      input.value = text;
      this.handleSend();
    }
  },

  async handleSend() {
    const input = document.getElementById('ai-chat-input');
    const container = document.getElementById('ai-chat-messages');
    if (!input || !container) return;

    const query = input.value.trim();
    if (!query) return;

    // Append user message
    this.appendMessage('user', query);
    input.value = '';

    // Append loading indicator
    const loadingId = 'ai-loading-' + Date.now();
    const loadingEl = document.createElement('div');
    loadingEl.id = loadingId;
    loadingEl.className = 'flex items-start gap-3 my-3';
    loadingEl.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">AI</div>
      <div class="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
        <span class="animate-spin inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
        Synthesizing student data and predictive models...
      </div>
    `;
    container.appendChild(loadingEl);
    container.scrollTop = container.scrollHeight;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          student_id: this.currentStudentId
        })
      });

      const data = await res.json();
      const loader = document.getElementById(loadingId);
      if (loader) loader.remove();

      this.appendMessage('assistant', data.reply);
    } catch (err) {
      const loader = document.getElementById(loadingId);
      if (loader) loader.remove();
      this.appendMessage('assistant', "⚠️ Unable to query AI Advisor right now. Please verify backend connection.");
    }
  },

  appendMessage(role, text) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start gap-3 my-3 ' + (role === 'user' ? 'justify-end' : '');

    // Format markdown basics
    let formattedText = text
      .replace(/^### (.*$)/gim, '<h4 class="font-bold text-slate-800 text-base mb-1">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono font-bold">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 text-sm mb-1">$1</li>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br/>');

    if (role === 'user') {
      msgDiv.innerHTML = `
        <div class="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] shadow-sm">
          ${queryEscape(text)}
        </div>
        <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">ME</div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">AI</div>
        <div class="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-800 max-w-[85%] shadow-sm leading-relaxed">
          ${formattedText}
        </div>
      `;
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }
};

function queryEscape(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

