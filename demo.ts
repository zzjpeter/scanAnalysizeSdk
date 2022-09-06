var fs = require("fs")
var path = require("path")
var process = require('process')

//定义
enum TimeType {
    begin,
    end
}
let gRootPath = "/Users/peterzjzhu/Desktop/Tencent/app_dev/app_common";
let gFileSuffixs = [".h", ".cc", ".cpp"];
let gStringsXmlFileName = "strings.xml";
let gStringsXmlFileSuffixs = ["xml"];
let gModuleWemeet = "wemeet";
let gModuleBlockUiDir = "ui"; // 过滤模块中的上层ui目录（各端上层使用的strings.xml文件） 【如：/Users/peterzjzhu/Desktop/Tencent/app/app_common/src/wemeet/components/webview/ui/Android/src/main/res/values/strings.xml】
let gKeyPattern = "W[A|R]::Str::k[1-9a-zA-Z]*";
let gModulePattern = "wemeet\/module\/[a-z_A-Z]*\/";
let gModulePatternKey = "\"([1-9a-zA-Z])+\"";
let gModuleWemeetModulePrefix = "WR::Str::k";
let gModuleSubModulePrefix = "WA::Str::k";
let gResultfolder = "result";
let gRestulFolderPrefix = "./"+ gResultfolder + "/";
let gKeyFile = gRestulFolderPrefix + "key.txt";
let gResultFile = gRestulFolderPrefix + "result.txt";
let gResultDeleteFile = gRestulFolderPrefix + "result_delete.txt";
let gResultMoveFile = gRestulFolderPrefix + "result_move.txt";

function main() {
    printTime(TimeType.begin);
    process.chdir(gRootPath);
    const resultFolder = path.join(gRootPath, gResultfolder);
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder)
    }
    const cwd = process.cwd()
    console.log(cwd);
    executeScanPathGenerateKeyUseInfo(cwd);
    excuteScanGenerateResult(cwd);
    console.log(cwd);
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

function executeScanPathGenerateKeyUseInfo(path: string) {
    let infoFilePath = gKeyFile;
    fs.writeFileSync(infoFilePath, "");
    const suffixs = gFileSuffixs;
    scanPath(path, suffixs);
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
                    scanFileContentWithPattern(path, name, gKeyPattern);
                }
            }
        }else {
            console.log("建议先clean 未知文件:" + name + " " + fullPath);
        }
    }
}

/*
    使用指定的匹配模式，扫描指定目录下，指定名称的文件 统计key使用信息，生成key使用文件
    path：目录
    name：文件名
    pattern：匹配模式
    contentRecord = name + " = " + lineNum + " = " + content + " = " + moduleCurrent + " = " + path
 */
function scanFileContentWithPattern(path: string, name: string, pattern: string) {
    var fullPath = path + "/" + name;
    var patternRe = new RegExp(pattern, "g");
    var modulePatternRe = gModulePattern;
    var moduleCurrent = gModuleWemeet;
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
    fs.appendFileSync(gKeyFile, contentRecords.join(""));
}

function excuteScanGenerateResult(path: string) {
    const resultFilePath = gResultFile
    const resultDeleteFilePath = gResultDeleteFile
    const resultMoveFilePath = gResultMoveFile
    fs.writeFileSync(resultFilePath, "");
    fs.writeFileSync(resultDeleteFilePath, "");
    fs.writeFileSync(resultMoveFilePath, "");

    const fileName = gStringsXmlFileName;
    const suffixs = gStringsXmlFileSuffixs;
    scanPathXml(path, fileName, suffixs);
}

/*
    扫描指定目录下，指定后缀，指定名称的文件，并扫描该文件的内容
    path：目录
    filename：文件名
    suffixs：后缀
 */
function scanPathXml(path: string, filename: string, suffixs: string[]) {
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
            if (name == gModuleBlockUiDir) {
                continue;
            }
            scanPathXml(fullPath, filename, suffixs); // 对所有子文件夹进行搜索
        }else if(stats.isFile()) { // 处理文件
            for (const suffix of suffixs) {
                if ((name == filename) && name.endsWith(suffix)) {
                    scanFileContentXmlWithPattern(path, name);
                }
            }
        }else {
            console.log("建议先clean 未知文件:" + name + " " + fullPath);
        }
    }
}

function scanFileContentXmlWithPattern(path: string, name: string) {
    var fullPath = path + "/" + name;
    var modulePatternRe = new RegExp(gModulePattern, "g");
    var moduleCurrent = gModuleWemeet;
    var modules = path.match(modulePatternRe);
    if (modules) {
        moduleCurrent = modules[0];
    }
    var moduleKeyPatternRe = gModulePatternKey;

    const data = fs.readFileSync(fullPath, "utf-8");
    const lines = data.split(/\r?\n|\r/);
    lines.forEach((line: string) => {
        var contents = line.match(moduleKeyPatternRe);
        if (contents) {
            const contentKey = contents[0];
            contentKeyUseStatusInModule(path, name, contentKey, moduleCurrent);
        }
    });
}
/*
    统计当前module下的key在所有modules中的使用状态，并根据使用状态生成结果result文件
    path：目录
    name：文件名
    contentKey：key
    module：当前module名

    判断key的使用情况
    2.1、扫描wemeet module的strings.xml文件
    1、未使用，删除
    2、wemeet或者多个sub module有使用，不处理
    3、只有单个sub module使用，下沉（先记录 后 处理 一一对应xxx.xml文件）
    2.2、扫描sub modules下的strings.xml文件（即app_common/src/wemeet/module/moduleName(xxx)/asset/string下的strings.xml）
        1、当前模块sub module未使用，删除
*/
function contentKeyUseStatusInModule(path: string, name: string, contentKey: string, module: string) {
    var moduleCurrent = module;
    const moduleWemeet = gModuleWemeet;
    var content = contentKey;
    contentKey = content.replace(/\"/g, ''); // 去除'"'
    contentKey = contentKey.substr(0, 1).toUpperCase() + contentKey.substring(1);
    var modulePrefix = gModuleWemeetModulePrefix;
    if (moduleCurrent != moduleWemeet) {
        modulePrefix = gModuleSubModulePrefix;
    }
    const contentKeyRe = modulePrefix + contentKey;

    var searchResults: string[] = [];
    const data = fs.readFileSync(gKeyFile, "utf-8");
    const lines = data.split(/\r?\n|\r/);
    var lineNum = 0;
    lines.forEach((contentLine: string) => { // 判断contentKey 是否在 key结果文件中存在
        lineNum++;
        var contents: string[] = [];
        if (moduleCurrent != moduleWemeet) { // 处理非moduelWemeet
            contents = contentLine.split(" = ");
            const moduleTemp = contents[3]
            if (moduleCurrent != moduleTemp) {
                return;
            }
        }
        var contentKeyInLines = contentLine.match(contentKeyRe);
        if (contentKeyInLines) {
            var contentKeyInLine = contentKeyInLines[0];
            if (contents.length == 0) { // 处理moduelWemeet
                contents = contentLine.split(" = ");
            }
            const contentKeyTemp = contents[2]
            if (contentKeyTemp == contentKeyRe) {  // 有使用(调用方式+key 如WA|R::Str::Kxxxx)
                const searchResult = contentLine;
                searchResults.push(searchResult);
            }
        }
    });

    var resultStrs: string[] = [];
    var resultDeleteStrs: string[] = [];
    var resultMoveStrs: string[] = [];
    var action = "";
    if (searchResults.length > 0) {
        if (module == moduleWemeet) { // 1、当前查找的string.xml文件在moduleWemeet中
            var moduleSet = new Set();
            searchResults.forEach(function (searchResult) { // 2、统计key使用过的模块集合
                const contentLine = searchResult;
                const contents = contentLine.split(" = ");
                const moduleCurrent = contents[3];
                moduleSet.add(moduleCurrent);
            });
            if (moduleSet.size == 1) { // 场景：唯一模块使用
                const modules = Array.from(moduleSet);
                const moduleCurrent = modules[0];
                if (moduleCurrent != moduleWemeet) { // 非wemeet模块，也即sub module模块
                    searchResults.forEach(function (searchResult) { // 3、统计sub module模块中所有使用key的位置
                        const contentLine = searchResult;
                        action = "move";
                        var resultStr = name + " = " + 0 + " = " + content + " = " + module + " = " + path + " & " + action
                        resultStr += " & " + contentLine + "\n";
                        resultStrs.push(resultStr);
                        resultMoveStrs.push(resultStr);
                    });
                }
            }
        }
    }else {
        action = "delete";
        var resultStr = name + " = " + 0 + " = "  + content + " = " + module + " = " + path + " & " + action + "\n"
        resultStrs.push(resultStr);
        resultDeleteStrs.push(resultStr);
    }
    if (resultStrs.length > 0) {
        fs.appendFileSync(gResultFile, resultStrs.join(""));
    }
    if (resultDeleteStrs.length > 0) {
        fs.appendFileSync(gResultDeleteFile, resultDeleteStrs.join(""));
    }
    if (resultMoveStrs.length > 0) {
        fs.appendFileSync(gResultMoveFile, resultMoveStrs.join(""));
    }
}

main();