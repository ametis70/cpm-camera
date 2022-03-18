#!/bin/sh

[ -z "$POETRY_ACTIVE" ] && echo "Poetry env must be active" && exit 1

pyinstaller --onefile process.py
