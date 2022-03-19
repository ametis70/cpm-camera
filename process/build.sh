#!/bin/sh

poetry run pyinstaller --onefile --distpath . --clean --hidden-import "babel.numbers" --add-data="data/:data/" process.py
