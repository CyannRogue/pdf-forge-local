# Accessibility

UI goals:
- Operable entirely via keyboard.
- Announce critical events via ARIA live regions.
- Maintain visible focus styles and provide hints for non-obvious interactions.

Key Behaviors:
- Focus indicators on all interactive elements.
- Toasts are announced via a `role=region` container with `aria-live="polite"`.
- Thumbnails support drag-and-drop and keyboard reordering:
  - Focus a thumbnail and press Up/Down arrows to move it within the grid order.
  - Press Space or Enter to toggle selection for deletion.
  - On-screen hint text explains these shortcuts.
- Buttons disable during requests and restore label after completion.

Testing:
- Navigate all actions without using the mouse.
- Confirm toasts announce both success and error cases.

