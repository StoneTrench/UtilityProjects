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
npm install -dev "@types/node"

echo Installing tsx...
npm install -dev "tsx"

echo Installing typescript...
npm install -dev "typescript"

echo Installing uglify-js...
npm install -dev "uglify-js"

echo Making folders...
mkdir -p "./src"
mkdir -p "./test"
mkdir -p "./dist"
echo "// Import tests here" > test/test.ts

echo ""
echo Don\'t forget to put these in the scrips inside package.json!
echo "       \"test\": \"npx tsx test/test.ts\","
echo "       \"build\": \"tsc -p tsconfig.prod.json && uglifyjs --compress --mangle --output \\\"dist/bundle.min.js\\\" -- \\\"dist/bundle.js\\\"\","
echo "       \"rein\": \"rm -rf node_modules && npm install\""