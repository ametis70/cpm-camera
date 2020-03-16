#/bin/bash

cd /home/pi/server/process
pipenv run python3 main.py "$1" "$2" "$3" "$4"
exit 0
