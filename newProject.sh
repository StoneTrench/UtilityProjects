echo "
old_*
private.json
package-lock.json
node_modules
" > .gitignore
echo "
{
  \"compilerOptions\": {
    \"outFile\": \"./dist/bundle.js\",
    \"target\": \"ESNext\",
    \"module\": \"AMD\",
    \"moduleResolution\": \"Node\",
    \"declaration\": true,
    \"sourceMap\": true,
    \"removeComments\": true,
    \"strict\": false,
    \"esModuleInterop\": true,
    \"skipLibCheck\": true,
    \"forceConsistentCasingInFileNames\": true,
    \"noImplicitAny\": false,
    \"lib\": [
      \"ESNext\",
      \"DOM\"
    ],
    \"types\": [\"node\"]
  },
  \"exclude\": [
    \"node_modules\", \"dist\"
  ],
}
" > tsconfig.json
echo "
{
    \"extends\": \"./tsconfig.json\",
    \"include\": [
        \"./src/**/*.ts\"
    ],
    \"exclude\": [
        \"./test/**/*.ts\"
    ],
}
" > tsconfig.prod.json

echo Initializing npm...
npm init --force --yes

echo Installing @types/node...
npm install --include=dev "@types/node"

echo Installing tsx...
npm install --include=dev "tsx"

echo Installing typescript...
npm install --include=dev "typescript"

echo Installing uglify-js...
npm install --include=dev "uglify-js"

echo Making folders...
mkdir -p "./src"
mkdir -p "./test"
mkdir -p "./dist"

echo "// Import tests here" > test/test.ts
echo "
import { readFileSync } from \"fs\";
import path from \"path\";

export namespace Project {
	let project_package: any;

	export function NAME(fallback?: string): string {
		tryLoadPackageJson();
		return project_package.name ?? fallback;
	}
	export function VERSION(fallback?: string): string {
		tryLoadPackageJson();
		return project_package.version ?? fallback;
	}
	export function AUTHORS(fallback?: string[]): string[] {
		tryLoadPackageJson();
		return project_package.authors ?? fallback;
	}

	function tryLoadPackageJson() {
		if (project_package === undefined) project_package = JSON.parse(readFileSync(path.join(__dirname, \"../package.json\"), \"utf-8\"));
	}
}

" > src/metadata.ts

echo ""
echo Don\'t forget to put these in the scrips inside package.json!
echo "       \"test\": \"npx tsx test/test.ts\","
echo "       \"build\": \"tsc -p tsconfig.prod.json && uglifyjs --compress --mangle --output \\\"dist/bundle.min.js\\\" -- \\\"dist/bundle.js\\\"\","
echo "       \"rein\": \"rm -rf node_modules && npm install\""