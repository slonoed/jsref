#!/bin/sh
if [[ -z "$1" ]]
then
	echo "Please, set fixer name"
	exit 1
fi

touch src/fixers/$1.ts
touch src/fixers/__tests__/$1.spec.ts
touch src/fixers/__tests__/specs/$1.txt