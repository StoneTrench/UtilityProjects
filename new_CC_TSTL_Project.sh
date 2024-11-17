TS_PROJECT_CREATOR_SCRIPT="new_TS_Project.sh"
CC_TSTL_TEMPLATE_REPO="cc-tstl-template";

if [ ! -f "$TS_PROJECT_CREATOR_SCRIPT" ]; then
  echo "$TS_PROJECT_CREATOR_SCRIPT does not exist."
  exit 1
fi

source "./$TS_PROJECT_CREATOR_SCRIPT"

add_script_to_package_json "build" "npx tstl"

npm install -D --force @jackmacwindows/lua-types
npm install -D --force typescript-to-lua
npm install -D --force @jackmacwindows/craftos-types
npm install -D --force @jackmacwindows/cc-types

echo
echo "Cloning ComputerCraft typing declaration project."
git clone "https://github.com/MCJack123/$CC_TSTL_TEMPLATE_REPO.git"

echo "Extracting repo"
mv "./$CC_TSTL_TEMPLATE_REPO/types" "./types"
mv "./$CC_TSTL_TEMPLATE_REPO/event.ts" "./event.ts"
mv "./$CC_TSTL_TEMPLATE_REPO/main.ts" "./main.ts"
# mv "./$CC_TSTL_TEMPLATE_REPO/tsconfig.json" "./tsconfig.tstl.json"
echo "
{
    \"\$schema\": \"https://raw.githubusercontent.com/MCJack123/TypeScriptToLua/master/tsconfig-schema.json\",
    \"compilerOptions\": {
        \"target\": \"ESNext\",
        \"lib\": [\"ESNext\"],
        \"moduleResolution\": \"node\",
        \"strict\": false,
        \"types\": [\"@jackmacwindows/lua-types/cc-5.2\", \"@jackmacwindows/craftos-types\", \"@jackmacwindows/cc-types\"]
    },
    \"tstl\": {
        \"luaTarget\": \"CC-5.2\",
        \"luaLibImport\": \"inline\",
        \"luaBundle\": \"main.lua\",
        \"luaBundleEntry\": \"main.ts\"
    },
    \"include\": [
        \"./*.ts\"
    ],  
    \"exclude\": [
      \"node_modules\", \"dist\"
    ],
}
"

rm -rf "./$CC_TSTL_TEMPLATE_REPO/"

echo
echo "Linking main.ts to $PROJECT_DIR_NAME_SAFE.ts"
echo "import \"src/$PROJECT_DIR_NAME_SAFE.ts\"" >> main.ts
echo "
node_modules
*.lua
.DS_Store
event/
" >> .gitignore

echo Done!