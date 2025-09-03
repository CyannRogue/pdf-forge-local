const $ = (sel) => document.querySelector(sel);
const api = (path) => (window.location.origin + path);

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
  const container = $("#thumbs");
  container.innerHTML = "";
  j.images.forEach((p, i) => container.appendChild(buildThumb(api("/files/download?name=") + encodeURIComponent(p.split("/").pop()), i)));
  enableDrag(container);
}

$("#thumbBtn").addEventListener("click", async () => {
  const f = $("#pdfFile").files[0];
  if (!f) return;
  currentPdfFile = f;
  await pdfToThumbs(f);
});

$("#reorderBtn").addEventListener("click", async () => {
  if (!currentPdfFile) return;
  const order = [...document.querySelectorAll(".thumb")].map(div => parseInt(div.dataset.index, 10) + 1);
  const fd = new FormData();
  fd.append("file", currentPdfFile);
  fd.append("order", order.join(","));
  fd.append("outfile", "reordered.pdf");
  const r = await fetch(api("/organize/reorder"), { method: "POST", body: fd });
  const j = await r.json();
  $("#fileList").innerHTML = "";
  await listTmp();
  alert("Reordered → " + j.outfile);
});

$("#deleteBtn").addEventListener("click", async () => {
  if (!currentPdfFile) return;
  const indices = [...document.querySelectorAll(".thumb")].map((div, i) => [i, div.querySelector(".sel").checked]).filter(([i, sel]) => sel).map(([i]) => i + 1);
  if (indices.length === 0) return;
  const fd = new FormData();
  fd.append("file", currentPdfFile);
  fd.append("ranges", indices.join(","));
  fd.append("outfile", "pruned.pdf");
  const r = await fetch(api("/organize/delete-pages"), { method: "POST", body: fd });
  const j = await r.json();
  await listTmp();
  alert("Pruned → " + j.outfile);
});

$("#img2pdfBtn").addEventListener("click", async () => {
  const files = $("#imgFiles").files;
  if (!files.length) return;
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  fd.append("outfile", "images.pdf");
  const r = await fetch(api("/convert/images-to-pdf"), { method: "POST", body: fd });
  const j = await r.json();
  $("#img2pdfOut").textContent = "Created: " + j.outfile;
  await listTmp();
});

$("#ocrBtn").addEventListener("click", async () => {
  const f = $("#pdfFile").files[0];
  if (!f) return;
  const lang = $("#ocrLang").value || "eng";
  const fd = new FormData();
  fd.append("file", f);
  fd.append("lang", lang);
  fd.append("outfile", "searchable.pdf");
  const r = await fetch(api("/ocr/searchable"), { method: "POST", body: fd });
  const j = await r.json();
  $("#ocrOut").textContent = "Searchable PDF: " + j.outfile;
  await listTmp();
});

$("#wmBtn").addEventListener("click", async () => {
  const f = $("#pdfFile").files[0];
  if (!f) return;
  const text = $("#wmText").value || "CONFIDENTIAL";
  const fd = new FormData();
  fd.append("file", f);
  fd.append("text", text);
  fd.append("outfile", "watermarked.pdf");
  const r = await fetch(api("/format/watermark"), { method: "POST", body: fd });
  const j = await r.json();
  $("#fmtOut").textContent = "Watermarked: " + j.outfile;
  await listTmp();
});

$("#numBtn").addEventListener("click", async () => {
  const f = $("#pdfFile").files[0];
  if (!f) return;
  const pos = $("#numPos").value;
  const fd = new FormData();
  fd.append("file", f);
  fd.append("position", pos);
  fd.append("outfile", "numbered.pdf");
  const r = await fetch(api("/format/page-numbers"), { method: "POST", body: fd });
  const j = await r.json();
  $("#fmtOut").textContent = "Numbered: " + j.outfile;
  await listTmp();
});

$("#cmpBtn").addEventListener("click", async () => {
  const f = $("#pdfFile").files[0];
  if (!f) return;
  const q = $("#cmpQ").value || "0.6";
  const fd = new FormData();
  fd.append("file", f);
  fd.append("image_quality", q);
  fd.append("outfile", "compressed.pdf");
  const r = await fetch(api("/format/compress"), { method: "POST", body: fd });
  const j = await r.json();
  $("#fmtOut").textContent = "Compressed: " + j.outfile;
  await listTmp();
});

$("#listBtn").addEventListener("click", listTmp);

// Initial
listTmp();
