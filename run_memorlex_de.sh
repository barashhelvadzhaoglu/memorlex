#!/bin/zsh
unset VIRTUAL_ENV
unset PYTHONPATH
unset PYTHONHOME
export PYTHONUNBUFFERED=1

cd /Users/user

LOG="/Users/user/memorlex/memorlex_de.log"
ERR="/Users/user/memorlex_de_error.log"

echo "$(date): Pipeline başladı" >> "$LOG"

/Users/user/memorlex_venv2/bin/python3 -u \
    /Users/user/memorlex_scripts/de/master_run.py \
    >> "$LOG" 2>> "$ERR"

echo "$(date): Pipeline bitti" >> "$LOG"
