(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => `${(+n).toLocaleString("ar-SA")} ر.س`;
  const clone = (x) => JSON.parse(JSON.stringify(x));

  let products = window.PRODUCTS;
  let categories = window.CATEGORIES;
  if (!categories.some((c) => c.id === "all")) categories.unshift({ id: "all", name: "الكل" });

  const realCats = () => categories.filter((c) => c.id !== "all");
  const catName = (id) => (categories.find((c) => c.id === id) || {}).name || "—";

  /* ---------- Persistence ---------- */
  function save() {
    try {
      localStorage.setItem("mn-products", JSON.stringify(products));
      localStorage.setItem("mn-categories", JSON.stringify(categories));
      return true;
    } catch (e) {
      toast("تعذّر الحفظ: مساحة التخزين ممتلئة. جرّب صورًا أقل أو أصغر.", true);
      return false;
    }
  }

  /* ---------- Stats ---------- */
  function renderStats() {
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem("mn-orders") || "[]"); } catch {}
    const out = products.filter((p) => p.stock !== "" && p.stock != null && +p.stock <= 0).length;
    const low = products.filter((p) => p.stock !== "" && p.stock != null && +p.stock > 0 && +p.stock <= 5).length;
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const tiles = [
      ["المنتجات", products.length.toLocaleString("ar-SA")],
      ["التصنيفات", realCats().length.toLocaleString("ar-SA")],
      ["نفدت / مخزون منخفض", `${out.toLocaleString("ar-SA")} / ${low.toLocaleString("ar-SA")}`],
      ["الطلبات (هذا المتصفح)", `${orders.length.toLocaleString("ar-SA")} · ${fmt(revenue)}`],
    ];
    $("#stats").innerHTML = tiles.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join("");
  }

  /* ---------- Products table ---------- */
  function renderFilter() {
    const sel = $("#pCat");
    const cur = sel.value || "all";
    sel.innerHTML = `<option value="all">كل التصنيفات</option>` +
      realCats().map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    sel.value = categories.some((c) => c.id === cur) ? cur : "all";
  }

  function stockCell(p) {
    if (p.stock === "" || p.stock == null) return `<span class="pill">غير محدود</span>`;
    const n = +p.stock;
    const cls = n <= 0 ? "pill--out" : n <= 5 ? "pill--low" : "pill--ok";
    return `<span class="pill ${cls}">${n <= 0 ? "نفد" : n.toLocaleString("ar-SA")}</span>`;
  }

  function renderProducts() {
    const q = $("#pSearch").value.trim().toLowerCase();
    const cat = $("#pCat").value;
    const list = products.filter((p) =>
      (cat === "all" || p.category === cat) && (!q || p.name.toLowerCase().includes(q)));
    $("#pEmpty").hidden = list.length > 0;
    $("#pRows").innerHTML = list.map((p) => `
      <tr>
        <td>
          <div class="prod">
            <div class="thumb" style="--tile:${esc(p.color || "#eef")}">${p.image ? `<img src="${esc(p.image)}" alt="">` : esc(p.emoji || "📦")}</div>
            <div><b>${esc(p.name)}</b><small>#${p.id}</small></div>
          </div>
        </td>
        <td>${esc(catName(p.category))}</td>
        <td><b>${fmt(p.price)}</b>${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ""}</td>
        <td>${stockCell(p)}</td>
        <td>★ ${(+p.rating || 0).toFixed(1)}</td>
        <td class="actions">
          <button class="icon-btn" data-edit="${p.id}" title="تعديل" aria-label="تعديل ${esc(p.name)}">✏️</button>
          <button class="icon-btn" data-dup="${p.id}" title="نسخ" aria-label="نسخ ${esc(p.name)}">📄</button>
          <button class="icon-btn" data-del="${p.id}" title="حذف" aria-label="حذف ${esc(p.name)}">🗑️</button>
        </td>
      </tr>`).join("");
  }

  /* ---------- Product form ---------- */
  const modal = $("#modal");
  const form = $("#productForm");
  const F = form.elements;
  let editingId = null;
  let image = "";

  function setPreview() {
    const color = F.color.value;
    $("#imgPreview").style.setProperty("--tile", color);
    $("#imgPreview").innerHTML = image ? `<img src="${esc(image)}" alt="">` : esc(F.emoji.value || "📦");
    $("#imgRemove").hidden = !image;
  }

  function openForm(p) {
    editingId = p ? p.id : null;
    image = (p && p.image) || "";
    form.reset();
    $("#formError").hidden = true;
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    F.category.innerHTML = realCats().map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    $("#formTitle").textContent = p ? "تعديل المنتج" : "منتج جديد";
    if (p) {
      for (const k of ["name", "category", "price", "oldPrice", "stock", "rating", "emoji", "desc"]) F[k].value = p[k] ?? "";
      F.color.value = /^#[0-9a-f]{6}$/i.test(p.color || "") ? p.color : "#eef2ff";
    } else if ($("#pCat").value !== "all") {
      F.category.value = $("#pCat").value;
    }
    setPreview();
    modal.showModal();
    F.name.focus();
  }

  function fail(msg, field) {
    $("#formError").textContent = msg;
    $("#formError").hidden = false;
    if (field) { field.classList.add("invalid"); field.focus(); }
  }

  function submitForm(e) {
    e.preventDefault();
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    const f = Object.fromEntries(new FormData(form));
    if (!realCats().length) return fail("أضف تصنيفًا واحدًا على الأقل أولًا من تبويب «التصنيفات».");
    if (f.name.trim().length < 2) return fail("اكتب اسمًا للمنتج.", F.name);
    if (f.price === "" || +f.price < 0) return fail("أدخل سعرًا صحيحًا.", F.price);
    if (f.oldPrice !== "" && +f.oldPrice <= +f.price) return fail("السعر قبل الخصم يجب أن يكون أكبر من السعر الحالي.", F.oldPrice);
    if (f.stock !== "" && (+f.stock < 0 || !Number.isInteger(+f.stock))) return fail("الكمية يجب أن تكون عددًا صحيحًا.", F.stock);
    const rating = Math.max(0, Math.min(5, +f.rating || 0));

    const data = {
      name: f.name.trim(),
      category: f.category,
      price: +f.price,
      oldPrice: f.oldPrice === "" ? undefined : +f.oldPrice,
      stock: f.stock === "" ? undefined : +f.stock,
      rating,
      emoji: f.emoji.trim() || "📦",
      color: f.color,
      image: image || undefined,
      desc: f.desc.trim(),
    };

    const prev = clone(products);
    if (editingId != null) {
      const i = products.findIndex((p) => p.id === editingId);
      products[i] = { id: editingId, ...data };
    } else {
      const id = products.reduce((m, p) => Math.max(m, +p.id || 0), 0) + 1;
      products.unshift({ id, ...data });
    }
    products = JSON.parse(JSON.stringify(products)); // strips undefined fields
    if (!save()) { products = prev; return; }
    modal.close();
    refresh();
    toast(editingId != null ? "تم حفظ التعديلات" : "تمت إضافة المنتج");
  }

  // تصغير الصورة قبل حفظها لتوفير مساحة التخزين
  function readImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const max = 600;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          const ctx = c.getContext("2d");
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.82));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Categories ---------- */
  function renderCategories() {
    const counts = {};
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    $("#catList").innerHTML = realCats().map((c) => `
      <li>
        <input class="input" value="${esc(c.name)}" data-cat-name="${esc(c.id)}" maxlength="40" aria-label="اسم التصنيف">
        <span class="muted">${(counts[c.id] || 0).toLocaleString("ar-SA")} منتج</span>
        <button class="icon-btn" data-cat-del="${esc(c.id)}" aria-label="حذف التصنيف">🗑️</button>
      </li>`).join("") || `<li class="muted">لا توجد تصنيفات بعد.</li>`;
  }

  /* ---------- Import / export ---------- */
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function productsJs() {
    const rows = (arr) => arr.map((x) => "  " + JSON.stringify(x)).join(",\n");
    return `// البيانات الافتراضية للمتجر. أي تعديل من لوحة التحكم (admin.html) يُحفظ في المتصفح ويتقدّم على هذه القيم.
window.DEFAULT_CATEGORIES = [
${rows(categories)},
];

window.DEFAULT_PRODUCTS = [
${rows(products)},
];

// تحميل البيانات المحفوظة من لوحة التحكم إن وُجدت
(function () {
  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : fallback;
    } catch (e) { return fallback; }
  }
  const clone = (x) => JSON.parse(JSON.stringify(x));
  window.CATEGORIES = load("mn-categories", clone(window.DEFAULT_CATEGORIES));
  window.PRODUCTS = load("mn-products", clone(window.DEFAULT_PRODUCTS));
})();
`;
  }

  async function importFile(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.products) || !Array.isArray(data.categories)) throw new Error("bad");
      const ok = data.products.every((p) => p && p.id != null && typeof p.name === "string" && !isNaN(+p.price));
      if (!ok) throw new Error("bad");
      if (!confirm(`سيتم استبدال البيانات الحالية بـ ${data.products.length} منتج. متابعة؟`)) return;
      const prev = [products, categories];
      products = data.products;
      categories = data.categories;
      if (!categories.some((c) => c.id === "all")) categories.unshift({ id: "all", name: "الكل" });
      if (!save()) { [products, categories] = prev; return; }
      refresh();
      toast("تم استيراد البيانات");
    } catch {
      toast("الملف غير صالح. تأكد أنه ملف JSON مُصدَّر من لوحة التحكم.", true);
    }
  }

  /* ---------- Toast ---------- */
  let timer;
  function toast(msg, isError) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.toggle("toast--error", !!isError);
    el.classList.add("is-show");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-show"), 2800);
  }

  function refresh() {
    renderStats();
    renderFilter();
    renderProducts();
    renderCategories();
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const d = b.dataset;
    if (d.tab) {
      document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-active", t === b));
      document.querySelectorAll(".panel").forEach((p) => { p.hidden = p.id !== "tab-" + d.tab; });
    } else if (d.edit) openForm(products.find((p) => p.id === +d.edit));
    else if (d.dup) {
      const src = products.find((p) => p.id === +d.dup);
      const id = products.reduce((m, p) => Math.max(m, +p.id || 0), 0) + 1;
      products.splice(products.indexOf(src) + 1, 0, { ...clone(src), id, name: src.name + " (نسخة)" });
      if (save()) { refresh(); toast("تم نسخ المنتج"); } else products = products.filter((p) => p.id !== id);
    } else if (d.del) {
      const p = products.find((x) => x.id === +d.del);
      if (!confirm(`حذف «${p.name}» نهائيًا؟`)) return;
      products = products.filter((x) => x !== p);
      save(); refresh(); toast("تم حذف المنتج");
    } else if (d.catDel) {
      const used = products.filter((p) => p.category === d.catDel).length;
      if (used) return toast(`لا يمكن حذف التصنيف لأنه يحتوي على منتجات (${used}). انقلها إلى تصنيف آخر أو احذفها أولًا.`, true);
      categories = categories.filter((c) => c.id !== d.catDel);
      save(); refresh(); toast("تم حذف التصنيف");
    } else if ("close" in d) modal.close();
  });

  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  form.addEventListener("submit", submitForm);
  F.emoji.addEventListener("input", setPreview);
  F.color.addEventListener("input", setPreview);
  $("#imgRemove").addEventListener("click", () => { image = ""; setPreview(); });
  $("#imgInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try { image = await readImage(file); setPreview(); }
    catch { toast("تعذّرت قراءة الصورة", true); }
  });

  $("#newProduct").addEventListener("click", () => openForm(null));
  $("#pSearch").addEventListener("input", renderProducts);
  $("#pCat").addEventListener("change", renderProducts);

  $("#catForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = e.target.elements.name.value.trim();
    if (!name) return;
    if (categories.some((c) => c.name === name)) return toast("هذا التصنيف موجود مسبقًا", true);
    categories.push({ id: "cat-" + Date.now().toString(36), name });
    if (save()) { e.target.reset(); refresh(); toast("تمت إضافة التصنيف"); }
  });
  $("#catList").addEventListener("change", (e) => {
    const id = e.target.dataset.catName;
    if (!id) return;
    const name = e.target.value.trim();
    const c = categories.find((x) => x.id === id);
    if (!name) { e.target.value = c.name; return; }
    c.name = name;
    save(); renderFilter(); renderProducts(); toast("تم تحديث اسم التصنيف");
  });

  $("#exportJson").addEventListener("click", () => {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`mn-store-${stamp}.json`, JSON.stringify({ products, categories }, null, 2), "application/json");
  });
  $("#exportJs").addEventListener("click", () => download("products.js", productsJs(), "text/javascript"));
  $("#importJson").addEventListener("change", (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) importFile(file);
  });
  $("#resetData").addEventListener("click", () => {
    if (!confirm("سيتم حذف كل التعديلات والعودة إلى المنتجات الأصلية. متابعة؟")) return;
    try { localStorage.removeItem("mn-products"); localStorage.removeItem("mn-categories"); } catch {}
    products = clone(window.DEFAULT_PRODUCTS);
    categories = clone(window.DEFAULT_CATEGORIES);
    refresh();
    toast("تمت استعادة البيانات الافتراضية");
  });

  refresh();
})();
