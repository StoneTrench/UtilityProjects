PROJECT_DIR_NAME=$(basename "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")
PROJECT_DIR_NAME_SAFE=$(echo "$PROJECT_DIR_NAME" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')

check_if_empty() {
    # Get the directory where the script is located
    local script_dir=$(dirname "$BASH_SOURCE")
    
    # Check if the directory contains any files excluding the script and any .sh files
    if [ -z "$(ls -A "$script_dir" | grep -v -E "$(basename "$BASH_SOURCE")|.*\.sh")" ]; then
        return 0  # Directory is empty
    else
        return 1  # Directory is not empty
    fi
}
abort_if_not_empty() {
    check_if_empty
    if [ $? -ne 0 ]; then
        echo "Aborting operation, the directory is not empty!"
        exit 1  # Abort the operation if the directory is not empty
    fi
}
add_script_to_package_json() {
    local script_name=$1
    local script_command=$2
    local no_comma=$3
    local package_file="package.json"
    
    # Check if package.json exists
    if [ ! -f "$package_file" ]; then
        echo "Error: $package_file not found."
        return 1
    fi
    
    # Check if the "scripts" section exists
    if grep -q '"scripts":' "$package_file"; then
        # Add the new script to the "scripts" section
        
        if [ "$no_comma" == 1 ]; then
            sed -i "/\"scripts\": {/a \    \"$script_name\": \"$script_command\"" "$package_file"
        else
            sed -i "/\"scripts\": {/a \    \"$script_name\": \"$script_command\"," "$package_file"
        fi
    else
        # If there is no "scripts" section, add it with the new script
        sed -i 's/{/{\n  "scripts": {\n    "$script_name": "$script_command"\n  },/' "$package_file"
    fi
    
    echo "Script \"$script_name\" added with command \"$script_command\"."
}
remove_all_scripts_from_package_json() {
    if [ ! -f "package.json" ]; then
        echo "package.json does not exist."
        return 1
    fi
    
    # Remove everything between 'scripts: {' and the closing '}'
    sed -i '/"scripts": {/,/}/ { /"scripts": {/b; /}/b; d }' package.json
    
    # Ensure there are no extra commas after the 'scripts' object
    sed -i ':a;N;$!ba;s/,\n}/\n}/' package.json
    
    echo "All scripts have been removed from package.json."
}

abort_if_not_empty

echo Initializing npm...
npm init --force --yes

npm install -D --force "@types/node"
npm install -D --force "tsx"
npm install -D --force "typescript"
npm install -D --force "uglify-js"

echo Making folders...
mkdir -p "./src"
mkdir -p "./test"
mkdir -p "./dist"

echo
echo Making scripts and files

echo "# $PROJECT_DIR_NAME" > README.md
echo "// Import tests here" > test/test.ts
echo "// Export modules here" > "src/$PROJECT_DIR_NAME_SAFE.ts"
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
# echo "
# import { readFileSync } from \"fs\";
# import path from \"path\";

# export namespace Project {
# 	let project_package: any;

# 	export function NAME(fallback?: string): string {
# 		tryLoadPackageJson();
# 		return project_package.name ?? fallback ?? $PROJECT_DIR_NAME;
# 	}
# 	export function VERSION(fallback?: string): string {
# 		tryLoadPackageJson();
# 		return project_package.version ?? fallback;
# 	}
# 	export function AUTHORS(fallback?: string[]): string[] {
# 		tryLoadPackageJson();
# 		return project_package.authors ?? fallback;
# 	}

# 	function tryLoadPackageJson() {
# 		if (project_package === undefined) project_package = JSON.parse(readFileSync(path.join(__dirname, \"../package.json\"), \"utf-8\"));
# 	}
# }
# " > src/metadata.ts

remove_all_scripts_from_package_json

add_script_to_package_json "test" "npx tsx test/test.ts" 1
add_script_to_package_json "bundle" "tsc -p tsconfig.prod.json && uglifyjs --compress --mangle --output dist/bundle.min.js -- dist/bundle.js"
add_script_to_package_json "rein" "rm -rf node_modules && npm install"


# echo
# echo "Adding scripts to package.json"

# file="package.json"

# # Check if package.json exists
# if [ ! -f "$file" ]; then
#   echo "$file does not exist."
#   exit 1
# fi

# # Remove any existing "test": "echo \"Error: no test specified\" && exit 1" line
# sed -i.bak '/"test": "echo \\"Error: no test specified\\" && exit 1"/d' "$file"

# # Append new scripts to the "scripts" section
# sed -i '/"scripts": {/a\
#     "test": "npx tsx test/test.ts",\
#     "build": "tsc -p tsconfig.prod.json && uglifyjs --compress --mangle --output \\"dist/bundle.min.js\\" -- \\"dist/bundle.js\\"",\
#     "rein": "rm -rf node_modules && npm install"
# ' "$file"

# # Remove the backup if everything went fine
# if [ $? -eq 0 ]; then
#   rm -f "$file.bak"
#   echo "Scripts added or updated in $file."
# else
#   echo "An error occurred while updating $file."
# fi

echo Done!