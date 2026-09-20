const form = document.querySelector('#study-form');
const promptInput = document.querySelector('#prompt');
const button = document.querySelector('#ask-button');
const responseBox = document.querySelector('#response');
const answer = document.querySelector('#answer-content');
const status = document.querySelector('#status');
let mode = 'explain';

document.querySelectorAll('[data-mode]').forEach(tab => tab.addEventListener('click', () => {
  mode = tab.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(t => t.classList.toggle('active', t === tab));
  promptInput.placeholder = mode === 'quiz' ? 'What should I quiz you on?' : mode === 'summarize' ? 'Paste your notes here…' : 'Ask anything… e.g. Explain photosynthesis in simple words';
  promptInput.focus();
}));
document.querySelectorAll('[data-example]').forEach(example => example.addEventListener('click', () => { promptInput.value = example.dataset.example; promptInput.focus(); }));
form.addEventListener('submit', async event => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (prompt.length < 3) return showStatus('Please enter a study question with at least 3 characters.');
  setLoading(true); responseBox.hidden = true;
  try {
    const result = await fetch('/api/study', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({prompt, mode}) });
    const data = await result.json();
    if (!result.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    answer.textContent = data.answer; responseBox.hidden = false; showStatus('');
  } catch (error) { showStatus(error.message); } finally { setLoading(false); }
});
document.querySelector('#copy-answer').addEventListener('click', async () => { await navigator.clipboard.writeText(answer.textContent); document.querySelector('#copy-answer').textContent = 'Copied!'; setTimeout(() => document.querySelector('#copy-answer').textContent = 'Copy', 1400); });
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') form.requestSubmit(); });
function setLoading(isLoading) { button.disabled = isLoading; button.innerHTML = isLoading ? 'Thinking… <span>✦</span>' : 'Ask StudySpark <span>→</span>'; status.className = isLoading ? 'status loading' : 'status'; if(isLoading) status.textContent = 'StudySpark is thinking…'; }
function showStatus(message) { status.textContent = message; if(message) status.className = 'status'; }
