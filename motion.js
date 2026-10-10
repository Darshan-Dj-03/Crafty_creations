(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("motion-ready");
  document.querySelectorAll(".site-header").forEach(header => {
    const toggle = header.querySelector(".menu-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const nav = header.querySelector(".main-nav");
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    header.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => {
      header.querySelector(".main-nav").classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  });

  document.querySelectorAll(".hero-copy > *, .hero-art, .category-intro, .category-link, .shop-section .section-heading, .filter-row, .story-section > *, .custom-section > *, .site-footer > *, .catalog-toolbar, .cart-item, .detail-gallery, .detail-copy, .confirmation-card > *").forEach(element => element.setAttribute("data-reveal", ""));

  function observeReveals() {
    const targets = document.querySelectorAll("[data-reveal], .product-card:not(.revealed), .category-link:not(.revealed)");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(target => target.classList.add("revealed"));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    }), { threshold: .12, rootMargin: "0px 0px -38px 0px" });
    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 75}ms`);
      observer.observe(target);
    });
  }
  observeReveals();
  new MutationObserver(observeReveals).observe(document.body, { childList: true, subtree: true });

  if (!reduceMotion && document.querySelector(".hero-art")) {
    let frame = 0;
    window.addEventListener("scroll", () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const art = document.querySelector(".hero-art");
        if (art) art.style.setProperty("--scroll-shift", `${Math.min(25, window.scrollY * .065)}px`);
        frame = 0;
      });
    }, { passive: true });
  }

  if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll(".hero-image-wrap, .detail-image, .product-card .product-image").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      const target = card.classList.contains("product-image") ? card.querySelector("img") : card;
      if (!target) return;
      target.style.transition = "transform 120ms ease-out";
      target.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 7}deg) translateZ(8px)`;
    });
    card.addEventListener("pointerleave", () => {
      const target = card.classList.contains("product-image") ? card.querySelector("img") : card;
      if (!target) return;
      target.style.transition = "transform 450ms ease";
      target.style.transform = "";
    });
  });
})();
