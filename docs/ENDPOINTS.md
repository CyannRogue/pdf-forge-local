# API Endpoints

Base URL: `/`

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
