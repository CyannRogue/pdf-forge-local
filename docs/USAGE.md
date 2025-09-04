# Usage

## Server
```
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## UI
Open `/ui` for a simple web interface.

## API Docs
Open `/docs`.

## Docker
```
docker build -t pdf-forge-local .
docker run --rm -p 8000:8000 -v $(pwd)/tmp:/tmp pdf-forge-local
```

## Tests
```
pip install -r requirements-dev.txt
pytest -q
```
## Env
- Override temp dir:
```
export PDF_FORGE_TMP=/workspace/tmp
export MAX_UPLOAD_MB=100
export LOG_LEVEL=DEBUG
export ALLOWED_ORIGINS=http://localhost:3000,https://example.com
export REQUEST_TIMEOUT_SECS=300
```

## Example curl

```
# Health
curl -s http://localhost:8000/health | jq

# Merge
curl -F files=@a.pdf -F files=@b.pdf -F outfile=merged.pdf http://localhost:8000/organize/merge

# PDF -> images
curl -F file=@a.pdf -F dpi=200 http://localhost:8000/convert/pdf-to-images | jq

# OCR
curl -F file=@scan.pdf -F lang=eng -F outfile=searchable.pdf http://localhost:8000/ocr/searchable

# Watermark
curl -F file=@a.pdf -F text=CONFIDENTIAL -F outfile=wm.pdf http://localhost:8000/format/watermark
```
