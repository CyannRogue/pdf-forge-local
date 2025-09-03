#!/usr/bin/env bash
set -euo pipefail
sudo apt-get update
sudo apt-get install -y tesseract-ocr poppler-utils ghostscript
pip install -r requirements.txt
echo "Setup complete."
