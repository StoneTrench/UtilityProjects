const fs = require("fs");
const pJoin = require("path").join;
const childProcess = require("child_process");

const libs = process.cwd();
const build = "dist/";
const extension = ".lua";
const preload_var_name = "PROJECT_LIBRARIES"

/**
 * Relative to project
 */

/**
 *  So we go through each element in the folder
 *      If we can't find an entry point we continue
 *
 *      Define an array called `files`
 *      Add the entry point file to it
 *      Define `result` string
 *
 *      Loop while `files` is not empty
 *          `current` = Shift the first element
 *          Append current to `result` wrapped inside a function matching the file name
 *
 *          Loop through each require statement inside `current`
 *              Find the file the require statement is calling
 *              Add the file to `files` array
 *              Replace the require statement with a function call matching the file name
 *
 *      Write result to a file inside ./dist in the project
 *
 *
 */

function GetBasename(str) {
	return str.replace(GetParentPath(str), "");
}
function GetParentPath(str) {
	return pJoin(str, "../");
}

function FindEntrypoint(projectName) {
	let p = pJoin(libs, projectName, "startup" + extension);
	if (fs.existsSync(p)) return p;

	p = pJoin(libs, projectName, projectName + extension);
	if (fs.existsSync(p)) return p;

	return undefined;
}

function hashCode(str) {
	var hash = 0,
		i,
		chr;
	if (str.length === 0) return hash;
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return `L${(hash + 2147483647).toString(36)}`;
}

function ConvertPathToFunctionName(project_dir, file_path) {
	file_path = file_path.endsWith(".lua") ? file_path.substring(0, file_path.length - 4) : file_path;
	const code = hashCode(`lib_${file_path.replace(project_dir, "").replace(/[^0-9a-zA-Z]/g, "_")}`).toString();
	return `${preload_var_name}.${code}`;
}

/**
 *
 * @param {string} project_path
 * @param {string} source_path
 * @param {string} require_path
 * @returns
 */
function FindRequireFile(project_path, source_path, require_path) {
	function TryFindRequireFile(project_path, source_path, require_path) {
		// console.log("TryFindRequireFile");
		// console.log(project_path);
		// console.log(source_path);
		// console.log(require_path);

		var file_path = pJoin(source_path, require_path);
		if (fs.existsSync(file_path)) return file_path;
		var file_path = pJoin(project_path, require_path);
		if (fs.existsSync(file_path)) return file_path;
		var file_path = pJoin(project_path, "../", "../", require_path);
		if (fs.existsSync(file_path)) return file_path;

		if (fs.existsSync(require_path)) return require_path;
		var file_path = pJoin(source_path, require_path);

		// console.log("Failed to find path...")
		return undefined;
	}

	var result = TryFindRequireFile(project_path, source_path, require_path);
	if (result !== undefined) return result;

	var new_require_path = require_path.replace(/\./g, "\\");
	var result = TryFindRequireFile(project_path, source_path, new_require_path);
	if (result !== undefined) return result;

	var new_require_path = require_path + ".lua";
	var result = TryFindRequireFile(project_path, source_path, new_require_path);
	if (result !== undefined) return result;

	var new_require_path = require_path.replace(/\./g, "\\") + ".lua";
	new_require_path = new_require_path.substring(0, new_require_path.length - 4) + ".lua";
	var result = TryFindRequireFile(project_path, source_path, new_require_path);
	if (result !== undefined) return result;

	var new_require_path = require_path.replace(/\./g, "\\") + ".lua";
	var result = TryFindRequireFile(project_path, source_path, new_require_path);
	if (result !== undefined) return result;

	console.log(`Failed to find path for ${require_path}`);
	// console.log("");
	return undefined;
}

fs.readdirSync(libs).forEach((project_name) => {
	const project_dir = pJoin(libs, project_name);
	const entrypoint = FindEntrypoint(project_name);

	if (entrypoint == undefined) return;

	const START_FUNC_NAME = ConvertPathToFunctionName(project_dir, entrypoint);

	const files = [entrypoint];

	const loaded_libraries = {};

	while (files.length > 0) {
		const current = FindRequireFile(project_dir, project_dir, files.shift());

		if (current === undefined) continue;

		const func_name = ConvertPathToFunctionName(project_dir, current);

		let text = fs.readFileSync(current, "utf-8");

		// Loop through requires
		let previousMatchIndex = 0;
		while (true) {
			const m = text.substring(previousMatchIndex).match(/require\(\"(.*?)\"\)/m);

			if (m == undefined) break;

			previousMatchIndex += m.index + m[0].length;

			const req_file_path = FindRequireFile(project_dir, GetParentPath(current), m[1]);
			if (req_file_path == undefined) continue;
			const req_func_name = ConvertPathToFunctionName(project_dir, req_file_path);

			files.push(req_file_path);

			text = text.replace(m[0], `${req_func_name}()`);
			text = text.split("\r\n").filter(e => !e.trim().startsWith("---@")).join("\r\n")
		}

		if (loaded_libraries[func_name] === undefined)
			loaded_libraries[func_name] = `${func_name} = (function () \n${text} \nend)`;
	}

	const build_dir = pJoin(project_dir, build);
	if (!fs.existsSync(build_dir)) fs.mkdirSync(build_dir);

	let result = `local ${preload_var_name} = {};\r\n`
	result += Object.values(loaded_libraries).reverse().join("\r\n");
	result += `\r\nreturn ${START_FUNC_NAME}()`;

	const output_file = pJoin(build_dir, project_name + extension).replace(/\\/g, "/");
	const output_min_file = pJoin(build_dir, project_name + ".min" + extension).replace(/\\/g, "/");
	fs.writeFileSync(output_file, result, "utf-8");

	childProcess.execSync(`luamin -f ${output_file} > ${output_min_file}`, {
		encoding: "utf-8",
		stdio: "inherit",
	});

	// fs.rmSync(output_file, { maxRetries: 100 });
});
