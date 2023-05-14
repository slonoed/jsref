CURRENT_DIR = $(shell pwd)

compile-vscode:
	tsc --build dev/vscode-client/tsconfig.json

.PHONY: watch
watch:
	npx tsc -w

.PHONY: clean
clean:
	rm -rf build

.PHONY: compile
compile:
	tsc

test:
	npx jest

### VSCode ####################################################################################

.PHONY: run-vscode
run-vscode: vscode
	code --extensionDevelopmentPath ${CURRENT_DIR}/build/vscode-extension/ --log trace dev/playground

.PHONY: vscode-publish
vscode-publish: vscode
	cd build/vscode-extension && vsce publish

.PHONY: vscode
vscode: build/vscode-extension/package.json build/vscode-extension/README.md build/vscode-extension/icon.png build/vscode-extension/src
	cd build/vscode-extension && npm i

build/vscode-extension:
	mkdir -p build/vscode-extension

build/vscode-extension/src: compile
	cp -r build/js build/vscode-extension/src

build/vscode-extension/icon.png: build/vscode-extension
	cp vscode-extension/icon.png build/vscode-extension/icon.png

build/vscode-extension/README.md: build/vscode-extension vscode-extension/README.md
	cp vscode-extension/README.md build/vscode-extension/README.md

build/vscode-extension/package.json: build/vscode-extension vscode-extension/package.json
	jq -s '.[1].dependencies=.[0].dependencies | .[1]' package.json vscode-extension/package.json > build/vscode-extension/package.json
