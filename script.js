(() => {
  const products = window.CRAFTY_PRODUCTS || [];
  const grid = document.querySelector("#product-grid");
  const bagCount = document.querySelector(".bag-count");
  const bagButton = document.querySelector(".bag-button");
  const toast = document.querySelector(".toast");
  const modal = document.querySelector(".product-modal");
  const modalImage = document.querySelector(".modal-image");
  let activeFilter = "All";
  let bag = JSON.parse(localStorage.getItem("crafty-demo-bag") || "[]");
  let saved = JSON.parse(localStorage.getItem("crafty-demo-saved") || "[]");
  let toastTimer;

  const price = value => `₹${Number(value).toLocaleString("en-IN")}`;
  const showToast = message => {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  };

  function renderProducts() {
    const visible = products.filter(product => activeFilter === "All" || product.category === activeFilter);
    grid.innerHTML = visible.map(product => `
      <article class="product-card" data-id="${product.id}">
        <div class="product-image" data-open="${product.id}" tabindex="0" role="button" aria-label="View ${product.name}">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <span class="product-badge">${product.badge}</span>
          <button class="save-button ${saved.includes(product.id) ? "saved" : ""}" data-save="${product.id}" aria-label="${saved.includes(product.id) ? "Remove from" : "Save to"} favourites">${saved.includes(product.id) ? "♥" : "♡"}</button>
          <button class="quick-add" data-add="${product.id}">Add a little lovely <span>＋</span></button>
        </div>
        <div class="product-meta"><div class="product-category">${product.category}</div><div class="product-title-row"><span class="product-title" data-open="${product.id}">${product.name}</span><span class="product-price">${price(product.price)}</span></div><p class="product-note">${product.note}</p></div>
      </article>`).join("");
    const count = products.filter(p => activeFilter === "All" || p.category === activeFilter).length;
    const everythingCount = document.querySelector('.filter-pill[data-filter="All"] span');
    if (everythingCount) everythingCount.textContent = String(products.length).padStart(2, "0");
    document.querySelectorAll(".category-link, .filter-pill").forEach(button => {
      button.classList.toggle("active", button.classList.contains("category-link") && button.dataset.filter === activeFilter);
      button.classList.toggle("selected", button.classList.contains("filter-pill") && button.dataset.filter === activeFilter);
    });
    grid.setAttribute("aria-label", `${count} products shown`);
  }

  function updateBag() {
    bagCount.textContent = bag.reduce((sum, item) => sum + item.quantity, 0);
    bagButton.setAttribute("aria-label", `Shopping bag, ${bagCount.textContent} items`);
    localStorage.setItem("crafty-demo-bag", JSON.stringify(bag));
  }

  function addToBag(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    const existing = bag.find(item => item.id === id);
    existing ? existing.quantity++ : bag.push({ id, quantity: 1 });
    updateBag();
    showToast(`${product.name} added to your bag ♡`);
  }

  function openProduct(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    modalImage.innerHTML = `<img src="${product.image}" alt="${product.name}" />`;
    document.querySelector(".modal-category").textContent = product.category;
    document.querySelector("#modal-title").textContent = product.name;
    document.querySelector(".modal-description").textContent = product.detail;
    document.querySelector(".modal-price").textContent = price(product.price);
    document.querySelector(".modal-add").dataset.add = product.id;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    document.querySelector(".modal-close").focus();
  }

  function closeProduct() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  document.addEventListener("click", event => {
    const filter = event.target.closest("[data-filter]");
    const open = event.target.closest("[data-open]");
    const add = event.target.closest("[data-add]");
    const save = event.target.closest("[data-save]");
    if (filter) {
      activeFilter = filter.dataset.filter;
      renderProducts();
      if (filter.classList.contains("category-link")) document.querySelector("#shop").scrollIntoView({ block: "start" });
    }
    if (save) {
      const id = save.dataset.save;
      saved = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
      localStorage.setItem("crafty-demo-saved", JSON.stringify(saved));
      renderProducts();
      showToast(saved.includes(id) ? "Saved to your little wishlist ♡" : "Removed from your wishlist");
    } else if (add) addToBag(add.dataset.add);
    else if (open) openProduct(open.dataset.open);
    if (event.target.closest(".modal-close") || event.target === modal) closeProduct();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) closeProduct();
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(".product-image[role=button]")) {
      event.preventDefault(); openProduct(event.target.dataset.open);
    }
  });

  bagButton.addEventListener("click", () => {
    if (!bag.length) return showToast("Your little bag is waiting for something lovely ♡");
    const summary = bag.map(item => {
      const product = products.find(p => p.id === item.id);
      return product ? `${item.quantity} × ${product.name}` : "";
    }).filter(Boolean).join(" · ");
    showToast(`Your bag: ${summary}`);
  });

  renderProducts();
  updateBag();
})();
