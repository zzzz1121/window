#!/bin/zsh
cd -- "${0:A:h}"
exec /usr/bin/python3 -m http.server 8080 --bind 127.0.0.1
