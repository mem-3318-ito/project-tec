# SLDS Static UI Rules

## Architecture

- `src/pages`: page composition only.
- `src/components`: reusable UI units and candidate LWC boundaries.
- `src/styles`: only global base/layout concerns.
- `dist`: generated output. Do not modify directly.
- Keep Include nesting shallow. Two levels is the target maximum.

## HTML

- Use SLDS Blueprint structure where applicable.
- Use semantic elements (`button`, `a`, `nav`, `table`, `form`, headings).
- `id` is allowed for accessibility relationships such as `label[for]` and ARIA references.
- Do not use `id` as a styling or JavaScript lookup mechanism.
- Do not use iframe.
- Do not use inline `style` or inline `on*` handlers.

## CSS

- Never author selectors targeting `.slds-*`.
- Prefer SLDS utility classes before custom CSS.
- Project classes use `app-{component}` and `app-{component}__{element}` where practical.
- Component-specific CSS stays beside the component.
- Global CSS must not contain component-specific styling.

## JavaScript

- Query a component root first, then query only inside that root.
- Use `data-component`, `data-action`, and `data-role` as DOM hooks.
- Do not use `getElementById` or `#id` query selectors.
- Keep behavior prototype-focused. Do not implement Salesforce APIs, authentication, or business data access here.

## LWC handoff

- A static component should map to one LWC where practical.
- The static implementation is the UI specification baseline, not a reimplementation of LWC internals.
- During LWC conversion, prefer Lightning Base Components where appropriate.
- Treat LWC rendering differences separately from errors in the static source.
