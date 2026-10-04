(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const main = document.querySelector("#main");
  const header = document.querySelector(".nav");
  const menu = document.querySelector(".site-menu");
  const toggle = document.querySelector(".menu-toggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const motion = !!(gsap && ScrollTrigger);
  let lenis;
  let introPlayed = false;
  let refreshTimer;
  let navigationUntil = 0;
  if (motion) gsap.registerPlugin(ScrollTrigger);
  function refresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (performance.now() < navigationUntil) return refresh();
      lenis?.resize();
      if (motion) ScrollTrigger.refresh();
    }, 160);
  }
  function closeMenu(focus = false) {
    document.body.classList.remove("menu-active");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    menu.inert = true;
    main.inert = false;
    if (!dialog.open) lenis?.start();
    if (focus) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener("click", () => {
    if (document.body.classList.contains("menu-active")) return closeMenu();
    document.body.classList.add("menu-active");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
    menu.inert = false;
    main.inert = true;
    lenis?.stop();
  });
  document.addEventListener("pointerdown", (event) => {
    if (
      !dialog.open &&
      !menu.contains(event.target) &&
      !header.contains(event.target)
    )
      closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (dialog.open) {
        event.preventDefault();
        closePreview();
      } else closeMenu(true);
    }
    if (event.key !== "Tab" || !document.body.classList.contains("menu-active"))
      return;
    const controls = [toggle, ...menu.querySelectorAll("a")];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === toggle) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link ||
      link.hasAttribute("data-project") ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    navigationUntil = performance.now() + 1200;
    const wasMenu = document.body.classList.contains("menu-active");
    closeMenu();
    history.pushState(null, "", link.hash);
    if (wasMenu || link.classList.contains("skip-link")) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
    requestAnimationFrame(() => {
      if (lenis) lenis.scrollTo(target, { duration: 0.9 });
      else
        target.scrollIntoView({
          behavior: reduced.matches ? "instant" : "smooth",
          block: "start",
        });
    });
  });
  const dialog = document.querySelector("#project-preview");
  const previewImage = document.querySelector("#preview-image");
  let opener;
  let lockedY = 0;
  let closing = false;
  function clearDialogMotion() {
    if (gsap) {
      gsap.killTweensOf(dialog);
      gsap.set(dialog, { clearProps: "transform,opacity" });
    }
  }
  function viewport() {
    if (!dialog.open) return;
    const visual = window.visualViewport;
    const top = `${visual?.offsetTop || 0}px`;
    const height = `${visual?.height || innerHeight}px`;
    const width = `${visual?.width || innerWidth}px`;
    if (
      dialog.style.getPropertyValue("--dialog-top") === top &&
      dialog.style.getPropertyValue("--dialog-height") === height &&
      dialog.style.getPropertyValue("--dialog-width") === width
    )
      return;
    if (closing) return dialog.close();
    clearDialogMotion();
    dialog.style.setProperty("--dialog-top", top);
    dialog.style.setProperty("--dialog-height", height);
    dialog.style.setProperty("--dialog-width", width);
  }
  document.querySelectorAll("[data-project]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        typeof dialog.showModal !== "function"
      )
        return;
      event.preventDefault();
      const card = link.closest(".zoom-img-effect");
      const image = card.querySelector("img");
      document.querySelector("#preview-title").textContent = card
        .querySelector("h2")
        .textContent.replace(/New/g, "")
        .trim();
      document.querySelector("#preview-description").textContent = card
        .querySelector("p")
        .textContent.trim();
      previewImage.src = image.src;
      previewImage.srcset = image.srcset;
      previewImage.sizes = "(max-width: 1100px) 100vw, 1100px";
      previewImage.alt = image.alt;
      previewImage.width = Number(image.getAttribute("width"));
      previewImage.height = Number(image.getAttribute("height"));
      opener = link;
      closeMenu();
      lockedY = scrollY;
      lenis?.stop();
      document.body.style.setProperty("--locked-y", `${-lockedY}px`);
      document.body.classList.add("preview-locked");
      dialog.showModal();
      dialog.querySelector(".preview-close").focus({ preventScroll: true });
      header.inert = true;
      main.inert = true;
      viewport();
      if (motion && !reduced.matches)
        gsap.fromTo(
          dialog,
          { y: 16, scale: 0.98, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.35,
            ease: "power3.out",
            onComplete: clearDialogMotion,
          },
        );
    });
  });
  function closePreview() {
    if (!dialog.open || closing) return;
    closing = true;
    if (!motion || reduced.matches) return dialog.close();
    gsap.to(dialog, {
      y: 8,
      scale: 0.99,
      opacity: 0,
      duration: 0.2,
      overwrite: true,
      ease: "power2.in",
      onComplete: () => dialog.close(),
    });
  }
  document
    .querySelector(".preview-close")
    .addEventListener("click", closePreview);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePreview();
  });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      closePreview();
  });
  dialog.addEventListener("close", () => {
    clearDialogMotion();
    closing = false;
    document.body.classList.remove("preview-locked");
    document.body.style.removeProperty("--locked-y");
    header.inert = false;
    main.inert = false;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, lockedY);
    lenis?.start();
    lenis?.scrollTo(lockedY, { immediate: true, force: true });
    opener?.focus({ preventScroll: true });
    requestAnimationFrame(() =>
      document.documentElement.style.removeProperty("scroll-behavior"),
    );
  });
  window.visualViewport?.addEventListener("resize", viewport, {
    passive: true,
  });
  window.visualViewport?.addEventListener("scroll", viewport, {
    passive: true,
  });
  addEventListener("resize", viewport, { passive: true });
  const ticker = document.querySelector(".page-8");
  const tickerButton = document.querySelector(".ticker-pause");
  const contactLink = document.querySelector(".contact-link");
  contactLink.addEventListener("focus", () =>
    ticker.classList.add("ticker-reading"),
  );
  contactLink.addEventListener("blur", () =>
    ticker.classList.remove("ticker-reading"),
  );
  function tickerPreferences() {
    tickerButton.hidden = reduced.matches;
  }
  tickerButton.addEventListener("click", () => {
    const paused = ticker.classList.toggle("ticker-paused");
    tickerButton.textContent = paused ? "Play motion" : "Pause motion";
    tickerButton.setAttribute(
      "aria-label",
      `${paused ? "Play" : "Pause"} moving contact strip`,
    );
  });
  if ("IntersectionObserver" in window)
    new IntersectionObserver((entries) => {
      ticker.classList.toggle(
        "is-visible",
        entries[0].isIntersecting && !document.hidden,
      );
    }).observe(ticker);
  else ticker.classList.add("is-visible");
  document.addEventListener("visibilitychange", () => {
    const bounds = ticker.getBoundingClientRect();
    ticker.classList.toggle(
      "is-visible",
      !document.hidden && bounds.bottom > 0 && bounds.top < innerHeight,
    );
  });
  reduced.addEventListener("change", () => {
    tickerPreferences();
    if (dialog.open) {
      if (closing) dialog.close();
      else clearDialogMotion();
    }
  });
  tickerPreferences();
  if (motion) {
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        if (!window.Lenis) return;
        lenis = new window.Lenis({
          lerp: 0.12,
          smoothWheel: true,
          syncTouch: false,
          autoRaf: false,
        });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time) => lenis?.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        if (dialog.open || document.body.classList.contains("menu-active"))
          lenis.stop();
        return () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
          lenis = undefined;
        };
      },
    );
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (!introPlayed) {
        introPlayed = true;
        if (scrollY < 80 && (!location.hash || location.hash === "#home")) {
          const desktop = matchMedia(
            "(min-width: 1101px) and (hover: hover) and (pointer: fine)",
          ).matches;
          gsap.fromTo(
            ".page-1",
            {
              y: desktop ? 120 : 24,
              scale: desktop ? 0.8 : 0.99,
              rotation: desktop ? -360 : -2,
              opacity: 0.15,
            },
            {
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              duration: desktop ? 1.35 : 0.7,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
          );
        }
      }
      gsap.fromTo(
        ".page-3 img",
        { rotation: -6 },
        {
          rotation: 6,
          ease: "none",
          scrollTrigger: {
            trigger: ".page-3",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
      ScrollTrigger.batch(
        ".left-page-2, .page-4-elems-right, .page-6-elem-right-bottom",
        {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { y: 20, opacity: 0.4 },
              {
                y: 0,
                opacity: 1,
                duration: 0.65,
                stagger: 0.08,
                ease: "power3.out",
                clearProps: "transform,opacity",
              },
            ),
        },
      );
      refresh();
    });
  }
  document.fonts?.ready.then(refresh);
  document.querySelectorAll("img").forEach((image) => {
    if (!image.complete)
      image.addEventListener("load", refresh, { once: true });
  });
  addEventListener("resize", refresh, { passive: true });
  addEventListener("pageshow", refresh);
})();
