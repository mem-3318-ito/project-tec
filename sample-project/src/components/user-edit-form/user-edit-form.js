const editForms = document.querySelectorAll(
  '[data-component="user-edit-form"]',
);

editForms.forEach((component) => {
  const form = component.querySelector('[data-role="form"]');
  const status = component.querySelector('[data-role="status"]');

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (status) {
      status.textContent =
        "サンプルのため保存処理は実行せず、入力内容のみ確認しました。";
    }

    component.dispatchEvent(
      new CustomEvent("app:prototype-action", {
        bubbles: true,
        detail: { type: "save-user" },
      }),
    );
  });
});
