# Usage

## Server
```

uvicorn app.main\:app --host 0.0.0.0 --port 8000 --reload

```

## UI
Open `/ui` for a simple web interface.

## API Docs
Open `/docs`.

## Docker
```

docker build -t pdf-forge-local .
docker run -p 8000:8000 pdf-forge-local

```

## Tests
```

pip install -r requirements-dev.txt
pytest -q

```
## Env
- Override temp dir:
```

export PDF\_FORGE\_TMP=/workspace/tmp

```
