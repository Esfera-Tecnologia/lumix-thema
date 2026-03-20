document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const desktopBreakpoint = 992;
  const sidebarStorageKey = "hubSidebarCollapsed";
  const themeStorageKey = "hubThemeMode";
  const submenuGroups = document.querySelectorAll("[data-submenu-toggle]");
  const userMenus = document.querySelectorAll("[data-user-menu]");
  const filterToggles = document.querySelectorAll("[data-filter-toggle]");
  const switchToggles = document.querySelectorAll("[data-switch-target]");
  const themeToggles = document.querySelectorAll("[data-theme-toggle]");
  const sidebarTooltipItems = document.querySelectorAll(".sidebar-link, .sidebar-toggle");
  const currentPage = body.dataset.page;
  const storedSidebarState = window.localStorage.getItem(sidebarStorageKey);
  const sidebarTooltip = document.createElement("div");
  let activeSidebarTooltipItem = null;

  sidebarTooltip.className = "sidebar-tooltip";
  document.body.append(sidebarTooltip);

  const closeMobileSidebar = () => body.classList.remove("sidebar-mobile-open");
  const isDesktopCollapsed = () => window.innerWidth >= desktopBreakpoint && body.classList.contains("sidebar-collapsed");
  const hideSidebarTooltip = () => {
    activeSidebarTooltipItem = null;
    sidebarTooltip.classList.remove("is-visible");
  };
  const positionSidebarTooltip = (item) => {
    const rect = item.getBoundingClientRect();
    sidebarTooltip.style.top = `${rect.top + (rect.height / 2)}px`;
    sidebarTooltip.style.left = `${rect.right + 14}px`;
  };
  const showSidebarTooltip = (item) => {
    const label = item.dataset.collapsedLabel || getSidebarItemLabel(item);
    if (!isDesktopCollapsed() || !label) {
      hideSidebarTooltip();
      return;
    }

    activeSidebarTooltipItem = item;
    sidebarTooltip.textContent = label;
    positionSidebarTooltip(item);
    sidebarTooltip.classList.add("is-visible");
  };
  const toggleDesktopSidebar = () => {
    body.classList.toggle("sidebar-collapsed");
    window.localStorage.setItem(sidebarStorageKey, body.classList.contains("sidebar-collapsed") ? "true" : "false");
    syncSidebarTooltips();
    hideSidebarTooltip();
  };

  if (window.innerWidth >= desktopBreakpoint) {
    body.classList.toggle("sidebar-collapsed", storedSidebarState !== "false");
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey) || "light";
  body.classList.toggle("theme-light", storedTheme === "light");

  const syncThemeButtons = () => {
    const isLight = body.classList.contains("theme-light");
    themeToggles.forEach((button) => {
      button.classList.toggle("is-active", isLight);
      button.setAttribute("aria-pressed", isLight ? "true" : "false");
    });
  };

  const getSidebarItemLabel = (item) => {
    const nestedLabel = item.querySelector(".sidebar-link-main > span");
    const directLabel = item.matches(".sidebar-toggle") ? null : item.querySelector(":scope > span");
    return nestedLabel?.textContent.trim() || directLabel?.textContent.trim() || item.textContent.trim();
  };

  const syncSidebarTooltips = () => {
    const shouldShowTooltips = isDesktopCollapsed();

    sidebarTooltipItems.forEach((item) => {
      const label = item.dataset.collapsedLabel || getSidebarItemLabel(item);
      if (!label) {
        return;
      }

      item.dataset.collapsedLabel = label;

      if (shouldShowTooltips) {
        item.setAttribute("aria-label", label);
      } else {
        item.removeAttribute("aria-label");
      }
    });
  };

  syncThemeButtons();
  syncSidebarTooltips();

  sidebarTooltipItems.forEach((item) => {
    item.addEventListener("mouseenter", () => showSidebarTooltip(item));
    item.addEventListener("mouseleave", hideSidebarTooltip);
    item.addEventListener("focus", () => showSidebarTooltip(item));
    item.addEventListener("blur", hideSidebarTooltip);
  });

  document.querySelectorAll("[data-sidebar-open]").forEach((button) => {
    button.addEventListener("click", () => body.classList.add("sidebar-mobile-open"));
  });

  document.querySelectorAll("[data-sidebar-close]").forEach((element) => {
    element.addEventListener("click", closeMobileSidebar);
  });

  document.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
    button.addEventListener("click", toggleDesktopSidebar);
  });

  themeToggles.forEach((button) => {
    button.addEventListener("click", () => {
      body.classList.toggle("theme-light");
      window.localStorage.setItem(themeStorageKey, body.classList.contains("theme-light") ? "light" : "default");
      syncThemeButtons();
    });
  });

  submenuGroups.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest(".sidebar-group");
      if (!group) {
        return;
      }

      const isOpen = group.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  if (currentPage) {
    document.querySelectorAll("[data-nav-target]").forEach((link) => {
      if (link.dataset.navTarget === currentPage) {
        link.classList.add("is-active");
        const group = link.closest(".sidebar-group");
        const groupToggle = group?.querySelector("[data-submenu-toggle]");

        if (group) {
          group.classList.add("is-open");
        }

        if (groupToggle) {
          groupToggle.setAttribute("aria-expanded", "true");
        }
      }
    });

    if (currentPage.startsWith("pedidos")) {
      const pedidosGroup = document.querySelector('[data-nav-group="pedidos"]');
      const pedidosToggle = pedidosGroup?.querySelector("[data-submenu-toggle]");
      pedidosGroup?.classList.add("is-open");
      pedidosToggle?.setAttribute("aria-expanded", "true");
    }
  }

  userMenus.forEach((menu) => {
    const trigger = menu.querySelector("[data-user-menu-toggle]");
    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = menu.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");

      userMenus.forEach((otherMenu) => {
        if (otherMenu !== menu) {
          otherMenu.classList.remove("is-open");
          const otherTrigger = otherMenu.querySelector("[data-user-menu-toggle]");
          otherTrigger?.setAttribute("aria-expanded", "false");
        }
      });
    });
  });

  document.addEventListener("click", (event) => {
    userMenus.forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.classList.remove("is-open");
        menu.querySelector("[data-user-menu-toggle]")?.setAttribute("aria-expanded", "false");
      }
    });
  });

  filterToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.filterTarget;
      const panel = targetId ? document.getElementById(targetId) : null;

      if (!panel) {
        return;
      }

      const collapsed = panel.classList.toggle("collapsed");
      button.innerHTML = collapsed
        ? '<i class="bi bi-funnel"></i> Mostrar filtros avançados'
        : '<i class="bi bi-funnel-fill"></i> Ocultar filtros';
    });
  });

  switchToggles.forEach((toggle) => {
    const updateLabel = () => {
      const target = document.getElementById(toggle.dataset.switchTarget);
      if (!target) {
        return;
      }

      target.textContent = toggle.checked ? target.dataset.on || "Ativado" : target.dataset.off || "Desativado";
    };

    toggle.addEventListener("change", updateLabel);
    updateLabel();
  });

  document.querySelectorAll(".sidebar-link, .sidebar-sublink").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < desktopBreakpoint) {
        closeMobileSidebar();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= desktopBreakpoint) {
      closeMobileSidebar();
    }

    syncSidebarTooltips();
    if (activeSidebarTooltipItem) {
      showSidebarTooltip(activeSidebarTooltipItem);
    }
  });

  window.addEventListener("scroll", () => {
    if (activeSidebarTooltipItem) {
      positionSidebarTooltip(activeSidebarTooltipItem);
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileSidebar();
      hideSidebarTooltip();
      userMenus.forEach((menu) => {
        menu.classList.remove("is-open");
        menu.querySelector("[data-user-menu-toggle]")?.setAttribute("aria-expanded", "false");
      });
    }
  });
});
