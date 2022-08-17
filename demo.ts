var fs = require("fs")
var path = require("path")
var process = require('process')

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

    printTime(TimeType.end);
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
    let fd = fs.writeSync(infoFilePath, "");
    fs.closeSync(fd);
    scanPath(path, [".h", ".cc", ".cpp"])
}

function scanPath(path: string, suffixs: string[]) {
    if fs.statSync
}

function test03(path: string) {

}


main();