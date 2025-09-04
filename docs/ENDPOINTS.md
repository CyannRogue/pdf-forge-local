# API Endpoints

Base URL: `/`

Notes:
- All success responses include `request_id`.
- All non-2xx responses use the standard error JSON shape with `code`, `message`, `detail`, `hint`, and `request_id`.

## Organize
- `POST /organize/merge`  
  Form: `outfile` (str), Files: multiple PDFs (`files`)  
  → `{ "outfile": "/tmp/merged.pdf" }`

- `POST /organize/split`  
  Form: `ranges` (e.g., `1-3,7,10-12` or multiple groups separated by `;`), File: `file`  
  → `{ "outputs": ["/tmp/split_1.pdf", ...] }`

- `POST /organize/extract-pages`  
  Form: `ranges`, `outfile`, File: `file`  
  → `{ "outfile": "/tmp/extract.pdf" }`

- `POST /organize/delete-pages`  
  Form: `ranges`, `outfile`, File: `file`  
  → `{ "outfile": "/tmp/pruned.pdf" }`

## Convert
- `POST /convert/images-to-pdf`  
  Form: `outfile`, Files: images  
  → `{ "outfile": "/tmp/images.pdf" }`

- `POST /convert/pdf-to-images`  
  Form: `dpi` (int), File: `file`  
  → `{ "images": ["/tmp/name_p1.png", ...] }`

## OCR
- `POST /ocr/searchable`  
  Form: `lang` (e.g., `eng`), `outfile`, File: `file`  
  → `{ "outfile": "/tmp/searchable.pdf" }`

## Secure
- `POST /secure/encrypt`  
  Form: `password`, `outfile`, File: `file`  
  → `{ "outfile": "/tmp/locked.pdf" }`

- `POST /secure/decrypt`  
  Form: `password`, `outfile`, File: `file`  
  → `{ "outfile": "/tmp/unlocked.pdf" }`

## Extract
- `POST /extract/text`  
  File: `file`  
  → `{ "text": "..." }`

## Files
- `GET /files/list`  
  Query: `ext` optional list, e.g., `/files/list?ext=pdf&ext=png`  
  → `{ "files": [ { "name": "...", "size": 123, "mtime": 1690000000 } ] }`

- `GET /files/download`  
  Query: `name` (basename located in `/tmp`)  
  → binary response

## Metadata
- `POST /metadata/get` → `{ info: {...} }`
- `POST /metadata/set` (form fields: title, author, subject, keywords, outfile) → `{ outfile }`
- `POST /metadata/bookmarks/list` → `{ bookmarks: [{title, page, level}] }`
- `POST /metadata/bookmarks/add` (text, page, outfile) → `{ outfile }`

## Forms
- `POST /forms/list` → `{ fields: [{name, type, value}] }`
- `POST /forms/fill` (data_json as JSON string, flatten bool, outfile) → `{ outfile }`

## Redact
- `POST /redact/texts` (texts CSV, outfile) → `{ outfile }`
- `POST /redact/boxes` (boxes_json array, outfile) → `{ outfile }`

## Compliance
- `POST /compliance/pdfa` (level, outfile) → `{ outfile }`
- `POST /compliance/linearize` (outfile) → `{ outfile }`

## Extract (tables)
- `POST /extract/tables` (max_pages, outfile_prefix) → `{ tables: ["/tmp/table_1_1.csv", ...] }`
