const key = 'focusboard-data-v1';
const initialData = { goal: 3, notes: ['Remember to review chapter 4 before class.'], tasks: [
  {id: 1, title: 'Finish calculus problem set', date: '2026-09-20', priority: 'High', category: 'Math', completed: false},
  {id: 2, title: 'Review lecture notes', date: '2026-09-20', priority: 'Medium', category: 'Study', completed: false},
  {id: 3, title: 'Plan next week’s study sessions', date: '2026-09-21', priority: 'Low', category: 'Planning', completed: true}
]};
let data = JSON.parse(localStorage.getItem(key)) || initialData;
const $ = s => document.querySelector(s);
const save = () => localStorage.setItem(key, JSON.stringify(data));
const taskModal = $('#task-modal'), goalModal = $('#goal-modal');

function niceDate(date) { return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {month:'short', day:'numeric'}); }
function renderTasks() {
  const query = $('#task-search').value.toLowerCase(), filter = $('#status-filter').value;
  const tasks = data.tasks.filter(t => t.title.toLowerCase().includes(query) && (filter === 'all' || (filter === 'completed' ? t.completed : !t.completed)));
  $('#task-list').innerHTML = tasks.map(t => `<article class="task-item ${t.completed ? 'completed' : ''}"><input class="task-check" type="checkbox" ${t.completed ? 'checked' : ''} data-check="${t.id}" aria-label="Complete ${t.title}"><div class="task-copy"><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.category || 'General')} · Due ${niceDate(t.date)}</small></div><span class="badge ${t.priority}">${t.priority}</span><div class="task-actions"><button data-edit="${t.id}" aria-label="Edit ${t.title}">✎</button><button data-delete="${t.id}" aria-label="Delete ${t.title}">×</button></div></article>`).join('');
  $('#empty-tasks').hidden = tasks.length > 0;
  document.querySelectorAll('[data-check]').forEach(el => el.onchange = () => { data.tasks.find(t => t.id === +el.dataset.check).completed = el.checked; save(); render(); });
  document.querySelectorAll('[data-edit]').forEach(el => el.onclick = () => openEdit(+el.dataset.edit));
  document.querySelectorAll('[data-delete]').forEach(el => el.onclick = () => { data.tasks = data.tasks.filter(t => t.id !== +el.dataset.delete); save(); render(); });
}
function renderStats() { const total=data.tasks.length, done=data.tasks.filter(t=>t.completed).length, pending=total-done, percent=total?Math.round(done/total*100):0, goalDone=Math.min(done,data.goal), remaining=data.goal-goalDone; $('#total-count').textContent=total; $('#pending-count').textContent=pending; $('#done-count').textContent=done; $('#progress-value').textContent=`${percent}%`; $('#progress-bar').style.width=`${percent}%`; $('#progress-message').textContent=percent===100?'Amazing work — all done!':percent? 'You’re making great progress.':'Let’s get started!'; $('#goal-done').textContent=goalDone; $('#goal-total').textContent=data.goal; $('#goal-note').textContent=done>=data.goal?'Daily goal achieved — well done!':`Complete ${remaining} more task${remaining===1?'':'s'} to win the day.`; $('#goal-dots').innerHTML=Array.from({length:data.goal},(_,i)=>`<i class="${i<done?'done':''}"></i>`).join(''); }
function renderNotes() { $('#note-list').innerHTML=data.notes.map((n,i)=>`<div class="note">${escapeHtml(n)}<button class="note-delete" data-note="${i}" aria-label="Delete note">×</button></div>`).join(''); document.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{data.notes.splice(+b.dataset.note,1);save();renderNotes();}); }
function render(){renderTasks();renderStats();renderNotes();}
function escapeHtml(t){return t.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function openNew(){ $('#modal-title').textContent='Add a task'; $('#task-form').reset(); $('#task-id').value=''; $('#task-date').value=new Date().toISOString().slice(0,10); taskModal.showModal(); }
function openEdit(id){const t=data.tasks.find(t=>t.id===id);$('#modal-title').textContent='Edit task';$('#task-id').value=t.id;$('#task-title').value=t.title;$('#task-date').value=t.date;$('#task-priority').value=t.priority;$('#task-category').value=t.category;taskModal.showModal();}
document.querySelectorAll('#open-task-modal').forEach(b=>b.onclick=openNew);
$('#task-form').addEventListener('submit',e=>{e.preventDefault();const id=$('#task-id').value;const task={id:id?+id:Date.now(),title:$('#task-title').value.trim(),date:$('#task-date').value,priority:$('#task-priority').value,category:$('#task-category').value.trim()||'General',completed:id?data.tasks.find(t=>t.id===+id).completed:false};if(id)data.tasks=data.tasks.map(t=>t.id===+id?task:t);else data.tasks.unshift(task);save();taskModal.close();render();});
$('#edit-goal').onclick=()=>{$('#goal-input').value=data.goal;goalModal.showModal();};$('#goal-form').addEventListener('submit',e=>{e.preventDefault();data.goal=+$('#goal-input').value;save();goalModal.close();renderStats();});
$('#save-note').onclick=()=>{const note=$('#note-input').value.trim();if(!note)return;data.notes.unshift(note);$('#note-input').value='';save();renderNotes();};
$('#task-search').oninput=renderTasks;$('#status-filter').onchange=renderTasks;$('#reset-data').onclick=()=>{data=JSON.parse(JSON.stringify(initialData));save();render();};
$('#today-label').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}).toUpperCase();render();
