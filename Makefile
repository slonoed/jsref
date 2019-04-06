
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


.PHONE: npm-pack
npmpack: compile
	mkdir -p build/npm
	cp -r build/js build/npm/src
	chmod +x build/npm/src/bin.js
	cat package.json | jq '. | del(.engines, .scripts, .devDependencies) | .bin += {"jsref": "./src/bin.js"}' > build/npm/package.json

.PHONY: npm-publish
npm-publish: npm-pack
	cd build/npm && npm publish

### VSCode #################################################################################333

.PHONY: vscode-publish
vscode-publish: vscode
	cd build/vscode-extension && vsce publish

.PHONY: vscode
vscode: build/vscode-extension/extension.js build/vscode-extension/package.json build/vscode-extension/README.md
	cd build/vscode-extension && npm i

build/vscode-extension:
	mkdir -p build/vscode-extension

build/vscode-extension/README.md: build/vscode-extension vscode-extension/README.md
	cp vscode-extension/README.md build/vscode-extension/README.md

build/vscode-extension/extension.js: build/vscode-extension
	tsc vscode-extension/extension.ts --outDir build/vscode-extension

build/vscode-extension/package.json: build/vscode-extension vscode-extension/package.json
	jq -s '.[1].dependencies["@slonoed/jsref"]=.[0].version | .[1]' package.json vscode-extension/package.json > build/vscode-extension/package.json
