#/bin/bash

cd process
pipenv run python3 main.py "$1" "$2" "$3" "$4"
exit 0
