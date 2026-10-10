(() => {
  const products = window.CRAFTY_PRODUCTS || [];
  const page = document.body.dataset.page;
  const CART_KEY = "crafty-demo-bag";
  const ORDER_KEY = "crafty-demo-last-order";
  const price = value => `₹${Number(value).toLocaleString("en-IN")}`;
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };
  let cart = read(CART_KEY, []).filter(line => products.some(product => product.id === line.id) && line.quantity > 0);
  let saved = read("crafty-demo-saved", []);
  const toast = document.querySelector(".toast");
  let toastTimer;

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateHeaderBag();
  }
  function updateHeaderBag() {
    const count = cart.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
    document.querySelectorAll(".bag-count").forEach(el => el.textContent = String(count));
    document.querySelectorAll(".bag-button").forEach(el => el.setAttribute("aria-label", `Shopping bag, ${count} items`));
  }
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }
  function productCard(product) {
    return `<article class="product-card" data-id="${product.id}"><div class="product-image" data-open="${product.id}" tabindex="0" role="link" aria-label="View ${product.name}"><img src="${product.image}" alt="${product.name}" loading="lazy"/><span class="product-badge">${product.badge}</span><button class="save-button ${saved.includes(product.id) ? "saved" : ""}" data-save="${product.id}" aria-label="${saved.includes(product.id) ? "Remove from" : "Save to"} favourites">${saved.includes(product.id) ? "♥" : "♡"}</button><button class="quick-add" data-add="${product.id}">Add to your bag <span>＋</span></button></div><div class="product-meta"><div class="product-category">${product.category}</div><div class="product-title-row"><span class="product-title" data-open="${product.id}">${product.name}</span><span class="product-price">${price(product.price)}</span></div><p class="product-note">${product.note}</p></div></article>`;
  }
  function addToCart(id, quantity = 1, details = {}) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    const signature = JSON.stringify(details);
    const existing = cart.find(item => item.id === id && JSON.stringify(item.details || {}) === signature);
    if (existing) existing.quantity += quantity;
    else cart.push({ id, quantity, details });
    saveCart();
    showToast(`${product.name} added to your little bag ♡`);
  }
  function orderLines() {
    return cart.map(line => {
      const product = products.find(item => item.id === line.id);
      return product ? { ...line, product, lineTotal: product.price * line.quantity } : null;
    }).filter(Boolean);
  }
  function subtotal(lines = orderLines()) { return lines.reduce((sum, line) => sum + line.lineTotal, 0); }

  function renderCatalog() {
    const grid = document.querySelector("#product-grid");
    if (!grid) return;
    let category = "All";
    let query = "";
    let sort = "featured";
    const empty = document.querySelector("#empty-results");
    const count = document.querySelector("#results-count");
    function apply() {
      let result = products.filter(product => (category === "All" || product.category === category) && `${product.name} ${product.category} ${product.note}`.toLowerCase().includes(query));
      if (sort === "price-low") result.sort((a, b) => a.price - b.price);
      if (sort === "price-high") result.sort((a, b) => b.price - a.price);
      if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
      grid.innerHTML = result.map(productCard).join("");
      count.textContent = `${result.length} ${result.length === 1 ? "little lovely" : "little lovelies"}`;
      empty.hidden = result.length > 0;
      grid.hidden = result.length === 0;
      document.querySelectorAll(".filter-pill").forEach(button => button.classList.toggle("selected", button.dataset.filter === category));
    }
    document.addEventListener("click", event => {
      const filter = event.target.closest("[data-filter]");
      if (!filter) return;
      category = filter.dataset.filter;
      apply();
    });
    document.querySelector("#product-search").addEventListener("input", event => { query = event.target.value.trim().toLowerCase(); apply(); });
    document.querySelector("#product-sort").addEventListener("change", event => { sort = event.target.value; apply(); });
    document.querySelector("#clear-filters").addEventListener("click", () => {
      category = "All"; query = ""; sort = "featured";
      document.querySelector("#product-search").value = "";
      document.querySelector("#product-sort").value = "featured";
      apply();
    });
    apply();
  }

  function renderProduct() {
    const root = document.querySelector("#product-detail");
    if (!root) return;
    const product = products.find(item => item.id === new URLSearchParams(location.search).get("id"));
    if (!product) {
      root.innerHTML = `<div class="product-detail-empty"><span class="eyebrow">A little mix-up</span><h1>We couldn’t find that lovely.</h1><p>Let’s find something else for your little moment.</p><a class="button button-dark" href="shop.html">Shop all gifts ↗</a></div>`;
      return;
    }
    document.title = `${product.name} — Crafty Creations`;
    document.querySelector("#product-breadcrumb").textContent = product.name;
    root.innerHTML = `<div class="detail-gallery"><div class="detail-thumbnails"><button class="detail-thumb selected" aria-label="View product photo"><img src="${product.image}" alt=""/></button></div><div class="detail-image"><img src="${product.image}" alt="${product.name}"/></div><div class="detail-sticker">Made by<br/>hand ✳</div></div><div class="detail-copy"><span class="eyebrow">${product.category} · ${product.badge}</span><h1>${product.name}</h1><div class="detail-price">${price(product.price)}</div><p class="detail-description">${product.detail}</p><div class="detail-note"><span>✳</span> Every piece is handmade to order. Little details may vary from piece to piece.</div><div class="detail-options"><label>Choose a colour<select id="gift-colour"><option>As pictured</option><option>Blush & cream</option><option>Red & gold</option><option>Tell me what’s lovely</option></select></label><label>Gift wrap<select id="gift-wrap"><option>Classic Crafty wrap</option><option>Celebration wrap</option><option>Minimal wrap</option></select></label></div><div class="detail-buy-row"><div class="quantity-control"><button type="button" data-qty="minus" aria-label="Reduce quantity">−</button><output id="detail-quantity">1</output><button type="button" data-qty="plus" aria-label="Add quantity">＋</button></div><button class="button button-dark detail-add" data-add="${product.id}">Add to your bag <span>↗</span></button></div><a class="detail-custom" href="https://www.instagram.com/crafty._.creations/" target="_blank" rel="noreferrer">Have a custom idea? Ask us on Instagram ↗</a></div>`;
    document.querySelector("#related-grid").innerHTML = products.filter(item => item.id !== product.id).slice(0, 3).map(productCard).join("");
  }

  function summaryMarkup(lines, title = "A little order summary", checkout = false) {
    const amount = subtotal(lines);
    const items = checkout ? lines.map(line => `<div class="summary-item"><img src="${line.product.image}" alt=""/><div>${line.product.name}<small>Qty ${line.quantity}${line.details?.colour ? ` · ${line.details.colour}` : ""}</small></div><b>${price(line.lineTotal)}</b></div>`).join("") : "";
    return `<h2>${title}</h2>${items}<div class="summary-line"><span>Little lovelies</span><span>${price(amount)}</span></div><div class="summary-line"><span>Delivery</span><span>Arranged after order</span></div><div class="summary-line total"><span>Subtotal</span><span>${price(amount)}</span></div><p class="summary-note">${checkout ? "This is a local demo order. No payment or delivery request will be sent." : "Delivery details are confirmed with the maker. This demo does not take payment."}</p>${checkout ? "" : `<a class="button button-dark summary-cta" href="${lines.length ? "checkout.html" : "shop.html"}">${lines.length ? "Continue to order" : "Find something lovely"} <span>↗</span></a><a class="summary-continue" href="shop.html">Keep finding lovely things</a>`}`;
  }

  function renderCart() {
    const target = document.querySelector("#cart-items");
    if (!target) return;
    const lines = orderLines();
    if (!lines.length) {
      target.innerHTML = `<div class="empty-cart"><div class="empty-flower">✳</div><h2>Your little bag is empty.</h2><p>There’s a lovely thing here with someone’s name on it.</p><a class="button button-dark" href="shop.html">Take a little look <span>↗</span></a></div>`;
      document.querySelector("#cart-summary").hidden = true;
      return;
    }
    target.innerHTML = lines.map(line => `<article class="cart-item"><a class="cart-item-image" href="product.html?id=${line.id}"><img src="${line.product.image}" alt="${line.product.name}"/></a><div class="cart-item-info"><div class="product-category">${line.product.category}</div><h2>${line.product.name}</h2><p>${line.details?.colour ? `Colour: ${line.details.colour} · ` : ""}${line.details?.wrap || "Handmade to order"}</p><div class="cart-item-actions"><div class="quantity-control"><button data-cart-qty="minus" data-id="${line.id}" data-details='${JSON.stringify(line.details || {})}' aria-label="Reduce quantity">−</button><output>${line.quantity}</output><button data-cart-qty="plus" data-id="${line.id}" data-details='${JSON.stringify(line.details || {})}' aria-label="Add quantity">＋</button></div><button class="remove-item" data-remove="${line.id}" data-details='${JSON.stringify(line.details || {})}'>Remove</button></div></div><div class="cart-item-price">${price(line.lineTotal)}</div></article>`).join("");
    const summary = document.querySelector("#cart-summary");
    summary.hidden = false;
    summary.innerHTML = summaryMarkup(lines);
  }

  function renderCheckout() {
    const form = document.querySelector("#checkout-form");
    if (!form) return;
    const lines = orderLines();
    if (!lines.length) { location.replace("cart.html"); return; }
    document.querySelector("#checkout-summary").innerHTML = summaryMarkup(lines, "Your lovely things", true);
    const date = form.elements.date;
    date.min = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const formData = new FormData(form);
      const order = {
        id: `CC-${String(Date.now()).slice(-6)}`,
        createdAt: new Date().toISOString(),
        customer: Object.fromEntries(formData.entries()),
        items: lines.map(line => ({ id: line.id, name: line.product.name, quantity: line.quantity, unitPrice: line.product.price, details: line.details || {} })),
        subtotal: subtotal(lines),
        demoOnly: true
      };
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
      cart = [];
      saveCart();
      location.href = "order-confirmation.html";
    });
  }

  function renderConfirmation() {
    const root = document.querySelector("#confirmation-details");
    if (!root) return;
    const order = read(ORDER_KEY, null);
    if (!order) {
      document.querySelector(".confirmation-card").innerHTML = `<div class="confirmation-flower">✳</div><span class="eyebrow">Nothing to confirm just yet</span><h1>Let’s find a <em>little lovely.</em></h1><p>Choose something from the shop to see the demo order journey.</p><a href="shop.html" class="button button-dark">Shop all gifts ↗</a>`;
      return;
    }
    document.querySelector("#thanks-name").textContent = `${order.customer.name.split(" ")[0]}.`;
    document.querySelector("#order-number").textContent = `#${order.id}`;
    const orderText = order.items.map(item => `${item.quantity} × ${item.name}`).join(" · ");
    root.textContent = `${orderText} · Demo total ${price(order.subtotal)} · Occasion: ${order.customer.occasion}`;
  }

  document.addEventListener("click", event => {
    const add = event.target.closest("[data-add]");
    const save = event.target.closest("[data-save]");
    const open = event.target.closest("[data-open]");
    const qty = event.target.closest("[data-qty]");
    const cartQty = event.target.closest("[data-cart-qty]");
    const remove = event.target.closest("[data-remove]");
    if (save) {
      event.stopPropagation();
      const id = save.dataset.save;
      saved = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
      localStorage.setItem("crafty-demo-saved", JSON.stringify(saved));
      save.textContent = saved.includes(id) ? "♥" : "♡";
      save.classList.toggle("saved", saved.includes(id));
      showToast(saved.includes(id) ? "Saved to your little wishlist ♡" : "Removed from your wishlist");
    } else if (add) {
      event.preventDefault(); event.stopPropagation();
      const current = page === "product" ? Number(document.querySelector("#detail-quantity")?.value || document.querySelector("#detail-quantity")?.textContent || 1) : 1;
      const details = page === "product" ? { colour: document.querySelector("#gift-colour")?.value, wrap: document.querySelector("#gift-wrap")?.value } : {};
      addToCart(add.dataset.add, current, details);
    } else if (open) {
      location.href = `product.html?id=${encodeURIComponent(open.dataset.open)}`;
    } else if (qty) {
      const output = document.querySelector("#detail-quantity");
      output.textContent = String(Math.max(1, Math.min(9, Number(output.textContent) + (qty.dataset.qty === "plus" ? 1 : -1))));
    } else if (cartQty || remove) {
      const button = cartQty || remove;
      const details = JSON.parse(button.dataset.details || "{}");
      const index = cart.findIndex(line => line.id === button.dataset.id && JSON.stringify(line.details || {}) === JSON.stringify(details));
      if (index >= 0) {
        if (remove || cartQty.dataset.cartQty === "minus" && cart[index].quantity <= 1) cart.splice(index, 1);
        else cart[index].quantity += cartQty.dataset.cartQty === "plus" ? 1 : -1;
      }
      saveCart(); renderCart();
    }
  });
  document.addEventListener("keydown", event => {
    const open = event.target.closest?.("[data-open]");
    if (open && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); location.href = `product.html?id=${encodeURIComponent(open.dataset.open)}`; }
  });

  updateHeaderBag();
  if (page === "shop") renderCatalog();
  if (page === "product") renderProduct();
  if (page === "cart") renderCart();
  if (page === "checkout") renderCheckout();
  if (page === "confirmation") renderConfirmation();
})();
