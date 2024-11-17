TS_PROJECT_CREATOR_SCRIPT="new_TS_Project.sh"
CC_TSTL_TEMPLATE_REPO="cc-tstl-template";

if [ ! -f "$TS_PROJECT_CREATOR_SCRIPT" ]; then
  echo "$TS_PROJECT_CREATOR_SCRIPT does not exist."
  exit 1
fi

echo Starting TS project creation
source "./$TS_PROJECT_CREATOR_SCRIPT"

add_script_to_package_json "build" "tstl"

npm install -D "@jackmacwindows/lua-types@2.13.2",
npm install -D "@jackmacwindows/typescript-to-lua@1.22.0",
npm install -D "@jackmacwindows/craftos-types@1.1.1",
npm install -D "@jackmacwindows/cc-types@1.0.0"

echo
echo "Cloning ComputerCraft typing declaration project."
git clone "https://github.com/MCJack123/$CC_TSTL_TEMPLATE_REPO.git"

echo "Extracting repo"
mv "./$CC_TSTL_TEMPLATE_REPO/types" "./types"
mv "./$CC_TSTL_TEMPLATE_REPO/events.ts" "./events.ts"
mv "./$CC_TSTL_TEMPLATE_REPO/main.ts" "./events.ts"
mv "./$CC_TSTL_TEMPLATE_REPO/tsconfig.json" "./tsconfig.tstl.json"

echo
echo "Linking main.ts to $PROJECT_DIR_NAME_SAFE.ts"
echo "import * from \"src/$PROJECT_DIR_NAME_SAFE.ts\"" >> main.ts
echo "
node_modules
*.lua
.DS_Store
event/
" >> .gitignore

echo Done!