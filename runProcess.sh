#/bin/bash

cd "$1/process"
pipenv run python3 process.py "$2" "$3" "$4" "$5" "$6"
exit 0
