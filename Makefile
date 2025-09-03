.PHONY: setup run test fmt

setup:
	bash scripts/setup.sh

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

test:
	pytest -q

fmt:
	python -m pip install black isort && black . && isort .
