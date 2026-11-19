(() => {
  "use strict";

  const CURRENCY = "ر.س";
  const FREE_SHIPPING_MIN = 200;
  const SHIPPING_FEE = 25;
  const STORAGE_KEY = "mn-cart";

  const $ = (s) => document.querySelector(s);
  const fmt = (n) => `${n.toLocaleString("ar-SA")} ${CURRENCY}`;
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const state = { category: "all", query: "", sort: "default", cart: loadCart() };

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart)); } catch {}
  }

  /* ---------- Catalogue ---------- */
  function renderCategories() {
    $("#categories").innerHTML = CATEGORIES.map((c) =>
      `<button class="chip${c.id === state.category ? " is-active" : ""}" role="tab"
        aria-selected="${c.id === state.category}" data-cat="${c.id}">${esc(c.name)}</button>`
    ).join("");
  }

  function stars(r) {
    return `<span class="stars" aria-label="التقييم ${r} من 5">★ ${r.toFixed(1)}</span>`;
  }

  function visibleProducts() {
    const q = state.query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (state.category === "all" || p.category === state.category) &&
      (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
    );
    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
    };
    if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
    return list;
  }

  function renderGrid() {
    const list = visibleProducts();
    $("#empty").hidden = list.length > 0;
    $("#grid").innerHTML = list.map((p) => `
      <article class="card">
        <button class="card__media" style="--tile:${p.color}" data-view="${p.id}" aria-label="عرض ${esc(p.name)}">
          <span>${p.emoji}</span>
          ${p.oldPrice ? `<em class="tag">خصم ${Math.round((1 - p.price / p.oldPrice) * 100)}٪</em>` : ""}
        </button>
        <div class="card__body">
          <h3>${esc(p.name)}</h3>
          ${stars(p.rating)}
          <div class="price">
            <b>${fmt(p.price)}</b>
            ${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ""}
          </div>
          <button class="btn btn--primary btn--block" data-add="${p.id}">أضف إلى السلة</button>
        </div>
      </article>`).join("");
  }

  /* ---------- Cart ---------- */
  function cartLines() {
    return Object.entries(state.cart)
      .map(([id, qty]) => ({ product: byId(+id), qty }))
      .filter((l) => l.product && l.qty > 0);
  }

  function totals() {
    const subtotal = cartLines().reduce((s, l) => s + l.product.price * l.qty, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function addToCart(id, qty = 1) {
    state.cart[id] = (state.cart[id] || 0) + qty;
    saveCart();
    renderCart();
    toast(`تمت إضافة «${byId(id).name}» إلى السلة`);
  }

  function setQty(id, qty) {
    if (qty <= 0) delete state.cart[id];
    else state.cart[id] = Math.min(qty, 99);
    saveCart();
    renderCart();
  }

  function renderCart() {
    const lines = cartLines();
    const count = lines.reduce((s, l) => s + l.qty, 0);
    $("#cartCount").textContent = count;
    $("#cartCount").classList.toggle("is-empty", count === 0);

    $("#cartItems").innerHTML = lines.length
      ? lines.map(({ product: p, qty }) => `
        <div class="line">
          <div class="line__media" style="--tile:${p.color}">${p.emoji}</div>
          <div class="line__info">
            <b>${esc(p.name)}</b>
            <span>${fmt(p.price)}</span>
            <div class="qty">
              <button data-dec="${p.id}" aria-label="إنقاص">−</button>
              <span>${qty}</span>
              <button data-inc="${p.id}" aria-label="زيادة">+</button>
            </div>
          </div>
          <button class="icon-btn" data-remove="${p.id}" aria-label="حذف">🗑️</button>
        </div>`).join("")
      : `<div class="cart-empty">🛍️<p>سلتك فارغة</p></div>`;

    const t = totals();
    $("#subtotal").textContent = fmt(t.subtotal);
    $("#shipping").textContent = t.shipping ? fmt(t.shipping) : "مجاني";
    $("#total").textContent = fmt(t.total);
    $("#checkoutBtn").disabled = lines.length === 0;
  }

  function openCart() {
    $("#drawer").classList.add("is-open");
    $("#drawer").setAttribute("aria-hidden", "false");
    $("#overlay").hidden = false;
  }
  function closeCart() {
    $("#drawer").classList.remove("is-open");
    $("#drawer").setAttribute("aria-hidden", "true");
    $("#overlay").hidden = true;
  }

  /* ---------- Modal ---------- */
  const modal = $("#modal");
  function openModal(html) {
    $("#modalContent").innerHTML = html;
    modal.showModal();
  }

  function showProduct(id) {
    const p = byId(id);
    const cat = CATEGORIES.find((c) => c.id === p.category);
    openModal(`
      <div class="detail">
        <div class="detail__media" style="--tile:${p.color}">${p.emoji}</div>
        <div class="detail__info">
          <small>${esc(cat ? cat.name : "")}</small>
          <h2>${esc(p.name)}</h2>
          ${stars(p.rating)}
          <p>${esc(p.desc)}</p>
          <div class="price price--lg"><b>${fmt(p.price)}</b>${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ""}</div>
          <div class="detail__actions">
            <div class="qty qty--lg">
              <button type="button" data-step="-1" aria-label="إنقاص">−</button>
              <span id="detailQty">1</span>
              <button type="button" data-step="1" aria-label="زيادة">+</button>
            </div>
            <button class="btn btn--primary" data-add-detail="${p.id}">أضف إلى السلة</button>
          </div>
        </div>
      </div>`);
  }

  function showCheckout() {
    const t = totals();
    closeCart();
    openModal(`
      <form class="checkout" id="checkoutForm" novalidate>
        <h2>إتمام الطلب</h2>
        <div class="fields">
          <label>الاسم الكامل<input name="name" required minlength="3"></label>
          <label>رقم الجوال<input name="phone" type="tel" required pattern="^(05|\\+9665)[0-9]{8}$" placeholder="05xxxxxxxx" dir="ltr"></label>
          <label class="full">البريد الإلكتروني<input name="email" type="email" required dir="ltr"></label>
          <label>المدينة<input name="city" required></label>
          <label>الحي / الشارع<input name="address" required></label>
        </div>
        <fieldset class="pay">
          <legend>طريقة الدفع</legend>
          <label><input type="radio" name="pay" value="cod" checked> الدفع عند الاستلام</label>
          <label><input type="radio" name="pay" value="card"> بطاقة مدى / ائتمانية</label>
        </fieldset>
        <div class="summary">
          <div class="row"><span>المجموع الفرعي</span><b>${fmt(t.subtotal)}</b></div>
          <div class="row"><span>الشحن</span><b>${t.shipping ? fmt(t.shipping) : "مجاني"}</b></div>
          <div class="row total"><span>الإجمالي</span><b>${fmt(t.total)}</b></div>
        </div>
        <p class="form-error" id="formError" hidden>يرجى تعبئة جميع الحقول بشكل صحيح.</p>
        <button class="btn btn--primary btn--block" type="submit">تأكيد الطلب</button>
      </form>`);
  }

  function submitOrder(form) {
    if (!form.checkValidity()) {
      $("#formError").hidden = false;
      form.querySelectorAll("input").forEach((i) => i.classList.toggle("invalid", !i.checkValidity()));
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const order = {
      id: "MN-" + Date.now().toString().slice(-6),
      customer: data,
      items: cartLines().map((l) => ({ id: l.product.id, name: l.product.name, qty: l.qty, price: l.product.price })),
      ...totals(),
      createdAt: new Date().toISOString(),
    };
    // هنا يمكن إرسال الطلب إلى الخادم: fetch("/api/orders", { method: "POST", body: JSON.stringify(order) })
    try {
      const orders = JSON.parse(localStorage.getItem("mn-orders") || "[]");
      orders.push(order);
      localStorage.setItem("mn-orders", JSON.stringify(orders));
    } catch {}
    state.cart = {};
    saveCart();
    renderCart();
    openModal(`
      <div class="success">
        <div class="success__icon">✅</div>
        <h2>شكرًا لك، ${esc(data.name)}!</h2>
        <p>تم استلام طلبك بنجاح. رقم الطلب: <b dir="ltr">${order.id}</b></p>
        <p>الإجمالي: <b>${fmt(order.total)}</b></p>
        <button class="btn btn--primary" data-close>متابعة التسوق</button>
      </div>`);
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const d = t.dataset;
    if (d.cat) { state.category = d.cat; renderCategories(); renderGrid(); }
    else if (d.add) addToCart(+d.add);
    else if (d.view) showProduct(+d.view);
    else if (d.inc) setQty(+d.inc, (state.cart[d.inc] || 0) + 1);
    else if (d.dec) setQty(+d.dec, (state.cart[d.dec] || 0) - 1);
    else if (d.remove) setQty(+d.remove, 0);
    else if (d.step) {
      const el = $("#detailQty");
      el.textContent = Math.max(1, Math.min(99, +el.textContent + +d.step));
    } else if (d.addDetail) { addToCart(+d.addDetail, +$("#detailQty").textContent); modal.close(); }
    else if ("close" in d) modal.close();
  });

  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  document.addEventListener("submit", (e) => {
    if (e.target.id === "checkoutForm") { e.preventDefault(); submitOrder(e.target); }
  });

  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  $("#checkoutBtn").addEventListener("click", showCheckout);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  $("#search").addEventListener("input", (e) => { state.query = e.target.value; renderGrid(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });

  $("#year").textContent = new Date().getFullYear();
  renderCategories();
  renderGrid();
  renderCart();
})();
