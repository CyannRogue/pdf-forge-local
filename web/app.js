const $ = (sel) => document.querySelector(sel);
const api = (path) => (window.location.origin + path);

function setBusy(el, busy) {
  if (!el) return;
  el.disabled = !!busy;
  if (busy) {
    el.dataset._orig = el.textContent;
    el.textContent = 'Working…';
  } else if (el.dataset._orig) {
    el.textContent = el.dataset._orig;
  }
}

function toast(msg, type = 'info') {
  const box = $("#toasts");
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.textContent = msg;
  box.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

let currentPdfFile = null;

async function uploadFile(input) {
  const f = input.files[0];
  if (!f) return null;
  const fd = new FormData();
  fd.append("file", f);
  return { file: f, form: fd };
}

function buildThumb(src, index) {
  const div = document.createElement("div");
  div.className = "thumb";
  div.draggable = true;
  div.dataset.index = index;
  div.tabIndex = 0;
  div.setAttribute('role', 'option');
  div.innerHTML = `
    <img src="${src}" alt="p${index+1}">
    <label><input type="checkbox" class="sel"> Select</label>
    <div>Page ${index+1}</div>
  `;
  div.addEventListener("dragstart", (e) => {
    div.classList.add("dragging");
    e.dataTransfer.setData("text/plain", index.toString());
  });
  div.addEventListener("dragend", () => div.classList.remove("dragging"));
  // Keyboard reorder
  div.addEventListener('keydown', (e) => {
    const container = $("#thumbs");
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const siblings = [...container.querySelectorAll('.thumb')];
      const idx = siblings.indexOf(div);
      if (e.key === 'ArrowUp' && idx > 0) {
        container.insertBefore(div, siblings[idx - 1]);
      }
      if (e.key === 'ArrowDown' && idx < siblings.length - 1) {
        container.insertBefore(siblings[idx + 1], div);
      }
      // renumber dataset indices
      [...container.querySelectorAll('.thumb')].forEach((el, i) => el.dataset.index = i);
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const cb = div.querySelector('.sel');
      cb.checked = !cb.checked;
    }
  });
  return div;
}

function enableDrag(container) {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = container.querySelector(".dragging");
    const afterElement = getDragAfterElement(container, e.clientY);
    if (afterElement == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggables = [...container.querySelectorAll(".thumb:not(.dragging)")];
  return draggables.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function listTmp() {
  const r = await fetch(api("/files/list?ext=pdf&ext=png"));
  const j = await r.json();
  const ul = $("#fileList");
  ul.innerHTML = "";
  j.files.forEach(f => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = api("/files/download?name=") + encodeURIComponent(f.name);
    a.textContent = `${f.name} (${Math.round(f.size/1024)} KB)`;
    a.target = "_blank";
    li.appendChild(a);
    ul.appendChild(li);
  });
}

async function pdfToThumbs(file) {
  // Call /convert/pdf-to-images then render as thumbnails
  const fd = new FormData();
  fd.append("file", file);
  fd.append("dpi", "120");
  const r = await fetch(api("/convert/pdf-to-images"), { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); return; }
  const container = $("#thumbs");
  container.innerHTML = "";
  j.images.forEach((p, i) => container.appendChild(buildThumb(api("/files/download?name=") + encodeURIComponent(p.split("/").pop()), i)));
  enableDrag(container);
}

$("#thumbBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0];
  if (!f) return;
  currentPdfFile = f;
  try { await pdfToThumbs(f); toast('Thumbnails ready'); } catch { /* handled */ }
  setBusy(e.target, false);
});

$("#reorderBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  if (!currentPdfFile) return;
  const order = [...document.querySelectorAll(".thumb")].map(div => parseInt(div.dataset.index, 10) + 1);
  const fd = new FormData();
  fd.append("file", currentPdfFile);
  fd.append("order", order.join(","));
  fd.append("outfile", "reordered.pdf");
  const r = await fetch(api("/organize/reorder"), { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#fileList").innerHTML = "";
  await listTmp();
  toast("Reordered ✓", 'success');
  setBusy(e.target, false);
});

$("#deleteBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  if (!currentPdfFile) return;
  const indices = [...document.querySelectorAll(".thumb")].map((div, i) => [i, div.querySelector(".sel").checked]).filter(([i, sel]) => sel).map(([i]) => i + 1);
  if (indices.length === 0) return;
  const fd = new FormData();
  fd.append("file", currentPdfFile);
  fd.append("ranges", indices.join(","));
  fd.append("outfile", "pruned.pdf");
  const r = await fetch(api("/organize/delete-pages"), { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  await listTmp();
  toast("Pruned ✓", 'success');
  setBusy(e.target, false);
});

$("#splitBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const ranges = $("#splitRanges").value || "1";
  const fd = new FormData(); fd.append('file', f); fd.append('ranges', ranges);
  const r = await fetch(api('/organize/split'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast(`Split into ${j.outputs.length} files ✓`, 'success');
  await listTmp();
  setBusy(e.target, false);
});

$("#img2pdfBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  const files = $("#imgFiles").files;
  if (!files.length) return;
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  fd.append("outfile", "images.pdf");
  const r = await fetch(api("/convert/images-to-pdf"), { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#img2pdfOut").textContent = "Created: " + j.outfile;
  await listTmp();
  setBusy(e.target, false);
});

$("#ocrBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0];
  if (!f) return;
  const lang = $("#ocrLang").value || "eng";
  const fd = new FormData();
  fd.append("file", f);
  fd.append("lang", lang);
  fd.append("outfile", "searchable.pdf");
  const ctrl = new AbortController();
  const cancelBtn = $("#ocrCancelBtn");
  cancelBtn.disabled = false;
  cancelBtn.onclick = () => { ctrl.abort(); };
  let r;
  try {
    r = await fetch(api("/ocr/searchable"), { method: "POST", body: fd, signal: ctrl.signal });
  } catch (err) {
    toast('OCR cancelled', 'error');
    setBusy(e.target, false);
    cancelBtn.disabled = true;
    cancelBtn.onclick = null;
    return;
  }
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#ocrOut").textContent = "Searchable PDF: " + j.outfile;
  await listTmp();
  setBusy(e.target, false);
  cancelBtn.disabled = true;
  cancelBtn.onclick = null;
});

$("#wmBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0];
  if (!f) return;
  const text = $("#wmText").value || "CONFIDENTIAL";
  const fd = new FormData();
  fd.append("file", f);
  fd.append("text", text);
  fd.append("outfile", "watermarked.pdf");
  const r = await fetch(api("/format/watermark"), { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#fmtOut").textContent = "Watermarked: " + j.outfile;
  await listTmp();
  setBusy(e.target, false);
});

$("#numBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0];
  if (!f) return;
  const pos = $("#numPos").value;
  const fd = new FormData();
  fd.append("file", f);
  fd.append("position", pos);
  fd.append("outfile", "numbered.pdf");
  const r = await fetch(api("/format/page-numbers"), { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#fmtOut").textContent = "Numbered: " + j.outfile;
  await listTmp();
  setBusy(e.target, false);
});

$("#cmpBtn").addEventListener("click", async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0];
  if (!f) return;
  const q = $("#cmpQ").value || "0.6";
  const fd = new FormData();
  fd.append("file", f);
  fd.append("image_quality", q);
  fd.append("outfile", "compressed.pdf");
  const r = await fetch(api("/format/compress"), { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#fmtOut").textContent = "Compressed: " + j.outfile;
  await listTmp();
  setBusy(e.target, false);
});

$("#listBtn").addEventListener("click", async (e) => { setBusy(e.target, true); await listTmp(); setBusy(e.target, false); });

// Initial
listTmp();

// Metadata
$("#metaGetBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData(); fd.append('file', f);
  const r = await fetch(api('/metadata/get'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#metaGetOut").textContent = JSON.stringify(j.info, null, 2);
  setBusy(e.target, false);
});

$("#metaSetBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('title', $("#metaTitle").value);
  fd.append('author', $("#metaAuthor").value);
  fd.append('subject', $("#metaSubject").value);
  fd.append('keywords', $("#metaKeywords").value);
  const r = await fetch(api('/metadata/set'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Metadata set ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

$("#bmListBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData(); fd.append('file', f);
  const r = await fetch(api('/metadata/bookmarks/list'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#bmListOut").textContent = JSON.stringify(j.bookmarks, null, 2);
  setBusy(e.target, false);
});

$("#bmAddBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('text', $("#bmText").value);
  fd.append('page', $("#bmPage").value);
  const r = await fetch(api('/metadata/bookmarks/add'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Bookmark added ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

// Forms
$("#formsListBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData(); fd.append('file', f);
  const r = await fetch(api('/forms/list'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#formsListOut").textContent = JSON.stringify(j.fields, null, 2);
  setBusy(e.target, false);
});

$("#formsFillBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('data_json', $("#formsJson").value);
  fd.append('flatten', $("#formsFlatten").checked ? 'true' : 'false');
  const r = await fetch(api('/forms/fill'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Form filled ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

// Redact
$("#redactTextsBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('texts', $("#redactTexts").value);
  const r = await fetch(api('/redact/texts'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Redacted by texts ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

$("#redactBoxesBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('boxes_json', $("#redactBoxes").value);
  const r = await fetch(api('/redact/boxes'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Redacted by boxes ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

// Compliance
$("#pdfaBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('level', $("#pdfaLevel").value);
  fd.append('outfile', 'pdfa.pdf');
  const r = await fetch(api('/compliance/pdfa'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#compOut").textContent = 'PDF/A: ' + j.outfile;
  await listTmp();
  setBusy(e.target, false);
});

$("#linearizeBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('outfile', 'linearized.pdf');
  const r = await fetch(api('/compliance/linearize'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#compOut").textContent = 'Linearized: ' + j.outfile;
  await listTmp();
  setBusy(e.target, false);
});

// Security
$("#encryptBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('password', $("#secPwd").value);
  fd.append('outfile', 'locked.pdf');
  const r = await fetch(api('/secure/encrypt'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Encrypted ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

$("#decryptBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) return setBusy(e.target, false);
  const fd = new FormData();
  fd.append('file', f);
  fd.append('password', $("#secPwd2").value);
  fd.append('outfile', 'unlocked.pdf');
  const r = await fetch(api('/secure/decrypt'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Decrypted ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

// Deep link: /ui?tool=ID → scroll to panel
function focusPanelByTool() {
  const params = new URLSearchParams(window.location.search);
  const tool = (params.get('tool') || '').toLowerCase();
  if (!tool) return;
  const map = {
    // Organize
    'merge': 'panel-organize', 'split': 'panel-organize', 'remove-pages': 'panel-organize', 'extract-pages': 'panel-organize', 'organize': 'panel-organize',
    // Convert
    'images-to-pdf': 'panel-images', 'jpg-to-pdf': 'panel-images',
    'pdf-to-jpg': 'panel-organize',
    // OCR
    'ocr': 'panel-ocr', 'scan-to-pdf': 'panel-ocr',
    // Format
    'compress': 'panel-format', 'page-numbers': 'panel-format', 'watermark': 'panel-format',
    // Security
    'unlock': 'panel-security', 'protect': 'panel-security',
    // Metadata
    'metadata': 'panel-metadata', 'bookmarks': 'panel-metadata',
    // Forms
    'forms': 'panel-forms',
    // Redact
    'redact': 'panel-redact',
    // Compliance
    'pdfa': 'panel-compliance', 'linearize': 'panel-compliance',
    // Files
    'files': 'panel-downloads'
  };
  const id = map[tool];
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const btn = el.querySelector('button');
    if (btn) btn.focus();
  }
}

document.addEventListener('DOMContentLoaded', focusPanelByTool);

// Advanced: Extract Tables
$("#xtBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) { setBusy(e.target, false); return; }
  const fd = new FormData();
  fd.append('file', f);
  fd.append('max_pages', $("#xtMaxPages").value || '25');
  fd.append('outfile_prefix', $("#xtPrefix").value || 'table');
  const r = await fetch(api('/extract/tables'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#xtOut").textContent = `Tables: ${j.tables.length} files`;
  await listTmp();
  setBusy(e.target, false);
});

// Advanced: Form Automation
function csvToJsonKV(csv) {
  const lines = csv.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const obj = {};
  for (const line of lines) {
    const [k, ...rest] = line.split(',');
    if (k) obj[k.trim()] = rest.join(',').trim();
  }
  return obj;
}

$("#faListBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) { setBusy(e.target, false); return; }
  const fd = new FormData(); fd.append('file', f);
  const r = await fetch(api('/forms/list'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#faListOut").textContent = JSON.stringify(j.fields, null, 2);
  setBusy(e.target, false);
});

$("#faFillBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) { setBusy(e.target, false); return; }
  const raw = $("#faData").value || '{}';
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = csvToJsonKV(raw);
  }
  const fd = new FormData();
  fd.append('file', f);
  fd.append('data_json', JSON.stringify(data));
  fd.append('flatten', $("#faFlatten").checked ? 'true' : 'false');
  fd.append('outfile', 'auto-filled.pdf');
  const r = await fetch(api('/forms/fill'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Form filled ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

// Advanced: Bookmarks Manager (remove is placeholder)
$("#bm2ListBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) { setBusy(e.target, false); return; }
  const fd = new FormData(); fd.append('file', f);
  const r = await fetch(api('/metadata/bookmarks/list'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#bm2ListOut").textContent = JSON.stringify(j.bookmarks, null, 2);
  setBusy(e.target, false);
});

$("#bm2AddBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) { setBusy(e.target, false); return; }
  const fd = new FormData();
  fd.append('file', f);
  fd.append('text', $("#bm2Text").value);
  fd.append('page', $("#bm2Page").value);
  fd.append('outfile', 'bookmarked.pdf');
  const r = await fetch(api('/metadata/bookmarks/add'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  toast('Bookmark added ✓', 'success');
  await listTmp();
  setBusy(e.target, false);
});

$("#bm2RemoveBtn").addEventListener('click', () => {
  toast('Remove bookmark is coming soon', 'error');
});

// AI placeholders
$("#aiSummBtn").addEventListener('click', () => toast('Summarise is coming soon', 'error'));
$("#aiTransBtn").addEventListener('click', () => toast('Translate is coming soon', 'error'));

// Accessibility
$("#accPdfBtn").addEventListener('click', () => toast('Accessible PDF conversion is coming soon', 'error'));

$("#ttsExtractBtn").addEventListener('click', async (e) => {
  setBusy(e.target, true);
  const f = $("#pdfFile").files[0]; if (!f) { setBusy(e.target, false); return; }
  const fd = new FormData(); fd.append('file', f);
  const r = await fetch(api('/extract/text'), { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { toast(`${j.error.message} (${j.error.code}) [${j.error.request_id}]`, 'error'); setBusy(e.target, false); return; }
  $("#ttsText").value = j.text || '';
  const u = new SpeechSynthesisUtterance(j.text?.slice(0, 1000) || '');
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  setBusy(e.target, false);
});

$("#ttsSpeakBtn").addEventListener('click', () => {
  const t = $("#ttsText").value || '';
  if (!t) return;
  const u = new SpeechSynthesisUtterance(t.slice(0, 2000));
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
});

$("#ttsStopBtn").addEventListener('click', () => {
  window.speechSynthesis.cancel();
});

$("#hcToggleBtn").addEventListener('click', () => {
  document.documentElement.classList.toggle('high-contrast');
});

// Workflows (UI only, run is placeholder)
const wf = { steps: [] };
function renderWf() {
  const ul = $("#wfList"); ul.innerHTML = '';
  wf.steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${i+1}. ${s.action}</span>`;
    const ctrl = document.createElement('div'); ctrl.className = 'controls';
    const up = document.createElement('button'); up.textContent = '↑'; up.onclick = () => { if (i>0) { const t=wf.steps[i-1]; wf.steps[i-1]=wf.steps[i]; wf.steps[i]=t; renderWf(); } };
    const down = document.createElement('button'); down.textContent = '↓'; down.onclick = () => { if (i<wf.steps.length-1) { const t=wf.steps[i+1]; wf.steps[i+1]=wf.steps[i]; wf.steps[i]=t; renderWf(); } };
    const del = document.createElement('button'); del.textContent = '✕'; del.onclick = () => { wf.steps.splice(i,1); renderWf(); };
    ctrl.append(up, down, del); li.appendChild(ctrl); ul.appendChild(li);
  });
  $("#wfJsonOut").textContent = JSON.stringify(wf, null, 2);
}
$("#wfAddBtn").addEventListener('click', () => {
  const sel = $("#wfAction");
  wf.steps.push({ action: sel.value });
  renderWf();
});
$("#wfExportBtn").addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(wf, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'workflow.json'; a.click(); URL.revokeObjectURL(url);
});
$("#wfImportBtn").addEventListener('click', () => { $("#wfImportFile").click(); });
$("#wfImportFile").addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = () => {
    try { const obj = JSON.parse(reader.result); if (Array.isArray(obj.steps)) { wf.steps = obj.steps; renderWf(); toast('Workflow imported', 'success'); } }
    catch { toast('Invalid workflow JSON', 'error'); }
  }; reader.readAsText(file);
});
$("#wfRunBtn").addEventListener('click', () => { toast('Workflow run is coming soon', 'error'); });
