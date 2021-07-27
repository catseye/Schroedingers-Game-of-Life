#!/bin/sh

APPLIANCES=""
if command -v python2 > /dev/null 2>&1; then
    APPLIANCES="$APPLIANCES tests/appliances/slife.py2.md"
fi
if command -v python3 > /dev/null 2>&1; then
    APPLIANCES="$APPLIANCES tests/appliances/slife.py3.md"
fi

if [ "x$APPLIANCES" = "x" ]; then
    echo "No suitable Python versions or ZOWIE implementations found."
    exit 1
fi

falderal $APPLIANCES README.md
