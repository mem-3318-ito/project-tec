(function () {
  "use strict";

  const components = document.querySelectorAll('[data-component="header"]');

  components.forEach((component) => {
    const hamburger = component.querySelector('[data-action="toggle-menu"]');
    const drawer = component.querySelector('[data-role="drawer"]');
    const userTrigger = component.querySelector(
      '[data-action="toggle-user-menu"]',
    );
    const userMenu = component.querySelector('[data-role="user-menu-panel"]');
    const userCaret = component.querySelector(".app-header__user-caret");
    const logoutButtons = component.querySelectorAll(
      '[data-action="logout"]',
    );

    function closeUserMenu() {
      if (!userTrigger || !userMenu) return;
      userTrigger.setAttribute("aria-expanded", "false");
      userMenu.hidden = true;
      if (userCaret) userCaret.textContent = "▼";
    }

    function openUserMenu() {
      if (!userTrigger || !userMenu) return;
      userTrigger.setAttribute("aria-expanded", "true");
      userMenu.hidden = false;
      if (userCaret) userCaret.textContent = "▲";
    }

    userTrigger?.addEventListener("click", () => {
      const expanded = userTrigger.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeUserMenu();
      } else {
        openUserMenu();
      }
    });

    hamburger?.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      if (drawer) drawer.hidden = expanded;
    });

    document.addEventListener("click", (event) => {
      if (!component.contains(event.target)) closeUserMenu();
    });

    component.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeUserMenu();
    });

    logoutButtons.forEach((button) => {
      button.addEventListener("click", () => {
        component.dispatchEvent(
          new CustomEvent("app:prototype-action", {
            bubbles: true,
            detail: { action: "logout" },
          }),
        );
      });
    });
  });
})();
