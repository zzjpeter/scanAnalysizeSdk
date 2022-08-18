var fs = require("fs")
var path = require("path")
var process = require('process')
const lineReader = require('line-reader');

console.log("demo.ts");

//定义
enum TimeType {
    begin,
    end
}
let g_root_path = "/Users/peterzjzhu/Desktop/Tencent/app_dev/app_common";
let g_module_wemeet = "wemeet";
let g_module_block_ui_dir = "ui"; // 过滤模块中的上层ui目录（各端上层使用的strings.xml文件） 【如：/Users/peterzjzhu/Desktop/Tencent/app/app_common/src/wemeet/components/webview/ui/Android/src/main/res/values/strings.xml】
let g_key_pattern_with_whitespace_whiteline = "W[A|R]\s*::\s*Str\s*::\s*k[1-9a-zA-Z]*"; // for check 不规范使用的key(也即带空格/换行的)
let g_key_pattern = "W[A|R]::Str::k[1-9a-zA-Z]*";
let g_module_pattern = "wemeet\/module\/[a-z_A-Z]*\/";
let g_module_pattern_wemeet_module = "WR::Str::k[1-9a-zA-Z]*";
let g_module_pattern_sub_module = "WA::Str::k[1-9a-zA-Z]*";
let g_module_pattern_contain_suffix_common = "[1-9a-zA-Z]*";
let g_module_pattern_key = "\"([1-9a-zA-Z])+\"";
let g_module_wemeet_module_prefix = "WR::Str::k";
let g_module_sub_module_prefix = "WA::Str::k";
let g_key_file = "./key.txt";
let g_result_file = "./result.txt";
let g_result_delete_file = "./result_delete.txt";
let g_result_move_file = "./result_move.txt";
let g_module_strings_xml_pattern = "strings[-a-z]*.xml";
let g_module_asset_strings = "/asset/strings/";
let g_module_strings_xml_pattern_end_flag = "</string>";
let g_module_BEGIN_NAMESPACE_prefix_pattern = "BEGIN_NAMESPACE_";

function main() {
    printTime(TimeType.begin);

    console.log("main");
    process.chdir(g_root_path);
    let cwd = process.cwd()
    console.log(cwd);
    executeScanPath(cwd);
    console.log(cwd);
    //test();
    printTime(TimeType.end);
}

function test() {
    var path = "/Users/peterzjzhu/Desktop/Tencent/app_dev/app_common/src/wemeet/module/account";
    var modulePatternRe = g_module_pattern;
    var modules = path.match(modulePatternRe);
    console.log(modules);
}

function printTime(type: TimeType) {
    var info = "beginTime";
    let time = new Date();
    if (type == TimeType.end) {
        info = "endTime";
    }
    console.log(info + ": " + time);
}

function executeScanPath(path: string) {
    let infoFilePath = g_key_file;
    fs.writeFileSync(infoFilePath, "");
    scanPath(path, [".h", ".cc", ".cpp"])
}

/*
    指定目录下递归遍历扫描所有的指定后缀的文件
    path：目录
    suffix：后缀 如[".h", ".cc", ".cpp"]
*/
function scanPath(path: string, suffixs: string[]) {
    var stats = fs.statSync(path);
    if (!stats.isDirectory()) {
        console.log(path + " " + "不是目录");
        return;
    }
    var files = fs.readdirSync(path); //得到文件夹下的所有文件，包含文件夹名称
    for (const name of files) { // 遍历子目录
        var fullPath = path + "/" + name;
        stats = fs.statSync(fullPath);
        if (stats.isDirectory()) { // 处理目录
            scanPath(fullPath, suffixs); // 对所有子文件夹进行搜索
        }else if(stats.isFile()) { // 处理文件
            for (const suffix of suffixs) {
                if (name.endsWith(suffix)) {
                    scanFileContentWithPattern(path, name, g_key_pattern);
                }
            }
        }else {
            console.log("未知文件:" + name);
        }
    }
}

/*
    使用指定的匹配模式，扫描指定目录下，指定名称的文件 统计key使用信息，生成key使用文件
    path：目录
    name：文件名
    pattern：匹配模式
    content_record = name + " = " + str(lineNum) + " = " + content + " = " + module_current + " = " + path
 */
async function scanFileContentWithPattern(path: string, name: string, pattern: string) {
    var fullPath = path + "/" + name;
    var patternRe = pattern;
    var modulePatternRe = g_module_pattern;
    var moduleCurrent = g_module_wemeet;
    var modules = path.match(modulePatternRe);
    if (modules) {
        moduleCurrent = modules[0];
    }

    var contentRecords: string[] = [];
    const data = fs.readFileSync(fullPath, "utf-8");
    const lines = data.split(/\r?\n|\r/);
    var lineNum = 0;
    lines.forEach((line: string) => {
       lineNum++;
        var contents = line.match(patternRe);
        if (contents) {
            contents.forEach(function (content) {
                const contentRecord = name + " = " + lineNum + " = " + content + " = " + moduleCurrent + " = " + path + "\n";
                contentRecords.push(contentRecord);
            });
        }
    });
    fs.appendFileSync(g_key_file, contentRecords.join(""));
}

function excuteScanGenerateResult(path: string) {
    const resultFilePath = g_result_file
    const resultDeleteFilePath = g_result_delete_file
    const resultMoveFilePath = g_result_move_file
    fs.writeFileSync(resultFilePath, "");
    fs.writeFileSync(resultDeleteFilePath, "");
    fs.writeFileSync(resultMoveFilePath, "");
}

/*
# 扫描指定目录下，指定后缀，指定名称的文件，并扫描该文件的内容
# path：目录
# name：文件名
# suffixs：后缀
 */
def scanPathXml(path, filename, suffixs):

main();