.PHONY: setup run up test fmt

setup:
	bash scripts/setup.sh

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

up: run

test:
	pytest -q

fmt:
	python -m pip install black isort && black . && isort .

.PHONY: ui-dev ui-build ui-watch

ui-dev:
	cd web/spa && npm i && npm run dev

ui-build:
	cd web/spa && npm i && npm run build

ui-watch:
	cd web/spa && npm i && npm run build:watch
