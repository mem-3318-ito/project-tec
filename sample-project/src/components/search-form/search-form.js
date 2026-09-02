const searchForms = document.querySelectorAll('[data-component="search-form"]');

searchForms.forEach((component) => {
  const form = component.querySelector('[data-role="form"]');
  const status = component.querySelector('[data-role="status"]');

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name =
      component.querySelector('[data-field="name"]')?.value.trim() ?? "";
    const userStatus =
      component.querySelector('[data-field="status"]')?.value ?? "";

    if (status) {
      status.textContent = `検索条件を反映しました： 氏名=${name || "指定なし"}, ステータス=${userStatus || "すべて"}`;
    }

    component.dispatchEvent(
      new CustomEvent("app:prototype-action", {
        bubbles: true,
        detail: { type: "search", name, status: userStatus },
      }),
    );
  });

  form?.addEventListener("reset", () => {
    if (status) {
      status.textContent = "検索条件をクリアしました。";
    }
  });
});
