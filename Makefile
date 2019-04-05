
compile-vscode:
	tsc --build dev/vscode-client/tsconfig.json

run-vscode:
	make compile-vscode
	code --extensionDevelopmentPath /Users/slonoed/_repos/refactor/all/dev/vscode-client/ --log trace

test:
	jest

.PHONY: watch
watch:
	tsc -w

.PHONY: clean
clean:
	rm -rf build

.PHONY: compile
compile: clean
	tsc


.PHONE: npmpack
npmpack: compile
	mkdir -p build/npm
	cp -r build/js build/npm/src
	chmod +x build/npm/src/bin.js
	cat package.json | jq '. | del(.engines, .scripts, .devDependencies) | .bin += {"jsref": "./src/bin.js"}' > build/npm/package.json


