.PHONY: all clean test run

all:
	python run_all.py

test:
	python -m pytest tests/

quick:
	python run_all.py --skip-bootstrap

