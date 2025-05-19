#!/bin/bash

echo "Odstraňujem staré migrácie..."
rm -rf migrations

echo "Inicializujem migrácie..."
flask db init
flask db stamp head

echo "Vytváram migráciu..."
flask db migrate -m 'initial'

echo "Aplikujem migrácie..."
flask db upgrade

echo "Migrácie boli úspešne aplikované."
