CURRENT_DIR = $(shell pwd)

compile-vscode:
	tsc --build dev/vscode-client/tsconfig.json

run-vscode:
	code --extensionDevelopmentPath ${CURRENT_DIR}/dev/vscode-client/ --log trace dev/playground

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

### NPM ##################################################################################

.PHONE: npm-pack
npm-pack: compile README.md
	mkdir -p build/npm
	cp README.md build/npm/README.md
	cp -r build/js build/npm/src
	chmod +x build/npm/src/bin.js
	cat package.json | jq '. | del(.engines, .scripts, .devDependencies) | .bin += {"jsref": "./src/bin.js"}' > build/npm/package.json

.PHONY: npm-publish
npm-publish: npm-pack
	cd build/npm && npm publish

### coc-nvim ##################################################################################

build/coc:
	mkdir -p build/coc

build/coc/extension.js: build/coc
	tsc coc/extension.ts --allowSyntheticDefaultImports --outDir build/coc

build/coc/README.md: README.md build/coc
	cp README.md build/coc/README.md

build/coc/package.json: build/coc coc/package.json
	cp coc/package.json build/coc/package.json

.PHONE: coc-pack
coc-pack: compile build/coc/README.md build/coc build/coc/package.json build/coc/extension.js
	cp -r build/js build/coc/src

.PHONY: coc-publish
coc-publish: coc-pack
	cd build/coc && npm publish --access public



### Homebrew ##################################################################################

.PHONY: brew-publish
brew-publish:
	rm -rf /tmp/jsref-brew-tap
	git clone git@github.com:slonoed/homebrew-tap.git /tmp/jsref-brew-tap
	noob @slonoed/jsref | sed 's/Slonoed//' > /tmp/jsref-brew-tap/jsref.rb
	cd /tmp/jsref-brew-tap/ && git commit -am 'Update to latest jsref' && git push

### VSCode ####################################################################################

.PHONY: vscode-publish
vscode-publish: vscode
	cd build/vscode-extension && vsce publish

.PHONY: vscode
vscode: build/vscode-extension/extension.js build/vscode-extension/package.json build/vscode-extension/README.md build/vscode-extension/icon.png
	cd build/vscode-extension && npm i

build/vscode-extension:
	mkdir -p build/vscode-extension

build/vscode-extension/icon.png: build/vscode-extension
	cp vscode-extension/icon.png build/vscode-extension/icon.png

build/vscode-extension/README.md: build/vscode-extension vscode-extension/README.md
	cp vscode-extension/README.md build/vscode-extension/README.md

build/vscode-extension/extension.js: build/vscode-extension
	tsc vscode-extension/extension.ts --outDir build/vscode-extension

build/vscode-extension/package.json: build/vscode-extension vscode-extension/package.json
	jq -s '.[1].dependencies["@slonoed/jsref"]=.[0].version | .[1]' package.json vscode-extension/package.json > build/vscode-extension/package.json
