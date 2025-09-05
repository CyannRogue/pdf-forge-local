# Visual UI (SPA)

- Served at `/` with routes: `/`, `/organizer`, `/editor/upload`, `/editor/workspace`.
- Legacy Workbench remains at `/ui` (static) for deep links.
- Built output in `web/site/`; assets under `/assets`. Dev server in `web/spa/`.

Components
- `DropZone`: drag-and-drop + button picker for files.
- `PageThumbnail` and `PageGrid`: clickable/reorderable page previews.
- `EditorToolbar`: basic toolbar with Save.
- `ErrorToast` + `useToasts`: unified, user-friendly error popups.

Routes
- `/` (Launcher): feature cards linking to organizer/editor.
- `/organizer`: merge, organize, split, compress, OCR, convert, protect/unlock via buttons and previews.
- `/editor/upload` and `/editor/workspace`: simplified editor with rectangle annotations as an example, saved via redaction endpoint.

Error handling
- All POSTs go through `postForm()` (see `src/lib/api.ts`).
- Server errors are translated to friendly messages with `request_id` where available (see `humanizeError()`).

Accessibility
- Keyboard accessible controls with visible focus rings; live region for toasts.

Dev
- Install: `cd web/spa && npm i`
- Run: `npm run dev`
- Build: `npm run build` → outputs to `web/site/`
- Watch build (writes to web/site/ continuously): `npm run build:watch` (or `make ui-watch`)
