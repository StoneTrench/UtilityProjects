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
npm install -D "@types/node"

echo Installing tsx...
npm install -D "tsx"

echo Installing typescript...
npm install -D "typescript"

echo Installing uglify-js...
npm install -D "uglify-js"

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

# echo ""
# echo Don\'t forget to put these in the scrips inside package.json!
# echo "       \"test\": \"npx tsx test/test.ts\","
# echo "       \"build\": \"tsc -p tsconfig.prod.json && uglifyjs --compress --mangle --output \\\"dist/bundle.min.js\\\" -- \\\"dist/bundle.js\\\"\","
# echo "       \"rein\": \"rm -rf node_modules && npm install\""

echo "Adding scripts to package.json"

file="package.json"

# Check if package.json exists
if [ ! -f "$file" ]; then
  echo "$file does not exist."
  exit 1
fi

# Remove any existing "test": "echo \"Error: no test specified\" && exit 1" line
sed -i.bak '/"test": "echo \\"Error: no test specified\\" && exit 1"/d' "$file"

# Append new scripts to the "scripts" section
sed -i '/"scripts": {/a\
    "test": "npx tsx test/test.ts",\
    "build": "tsc -p tsconfig.prod.json && uglifyjs --compress --mangle --output \\"dist/bundle.min.js\\" -- \\"dist/bundle.js\\"",\
    "rein": "rm -rf node_modules && npm install"
' "$file"

# Remove the backup if everything went fine
if [ $? -eq 0 ]; then
  rm -f "$file.bak"
  echo "Scripts added or updated in $file."
else
  echo "An error occurred while updating $file."
fi