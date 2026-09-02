# Project Guidance

This repository is a static UI handoff project whose downstream implementation target is Salesforce LWC.

Before finishing UI work:

1. Read `.claude/rules/slds-static-ui.md`.
2. Keep `src` as the source of truth. Never edit `dist` by hand.
3. Prefer SLDS Blueprint markup and SLDS utility classes before adding custom CSS.
4. Never override `.slds-*` selectors from project CSS.
5. Keep custom CSS and JavaScript scoped to the component boundary.
6. Do not use iframe, inline styles, inline event handlers, or CSS/JavaScript ID selectors.
7. Preserve semantic HTML and accessibility behavior.
8. Review whether each component can map cleanly to one LWC.
9. Run `npm run check` before completing a change.

When reviewing, report issues in this order:

- SLDS / accessibility
- LWC migration risk
- component boundary / maintainability
- CSS leakage
- JavaScript DOM coupling
- minor style issues
