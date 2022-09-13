const fs = require("fs")
const path_ = require("path")
const process = require('process')
const shell = require('shelljs')

//定义
enum TimeType {
    begin,
    end
}
let gRootPath = "";
let gResultfolder = "result";
let gRestulFolderPrefix = "./"+ gResultfolder + "/";
let gInfoFile = gRestulFolderPrefix + "info.txt";
let gShellCmdFile = gRestulFolderPrefix + "scanAnalysizeShellCmdExecute.log";
let gInfoSeperates = /:|;|\n/;
let gFilesInfo:Array<string> = [];
let gFilesFormatInfo:Array<string> = [];
let gExtnameSet = new Set();
let gExtnameMap = new Map();
//文件分类 43项
let extnames = [
    ' application/octet-stream',
    ' application/x-mach-binary',
    '.plist',
    ' text/xml',
    '.nib',
    '.rcc',
    '.json',
    '.res',
    '.sh',
    '.car',
    '.h',
    '.png',
    '.prl',
    '.xcconfig',
    '.metallib',
    ' text/plain',
    '.icns',
    '.strings',
    '.gif',
    '.bin',
    '.en',
    '.cur',
    '.ico',
    '.wmc',
    '.jpg',
    '.dat',
    '.xml',
    '.en2',
    '.html',
    '.wav',
    '.mp3',
    '.mov',
    '.conf',
    '.ini',
    '.rpnmodel',
    '.rpnproto',
    '.stb',
    '.rpdm',
    '.rpdc',
    '.dylib',
    '.modulemap',
    '.txt',
    '.log'
];


export namespace WeMeetResCheck.CheckXml {

    export function scanAnalysizeSdk(handlePath: string) {
        const cwd = process.cwd()
        console.log(cwd);
        printTime(TimeType.begin);
        gRootPath = handlePath;
        process.chdir(gRootPath);
        const resultFolder = path_.join(gRootPath, gResultfolder);
        if (!fs.existsSync(resultFolder)) {
            fs.mkdirSync(resultFolder)
        }
        const handleCwd = process.cwd()
        console.log(handleCwd);
        executeScanPathGenerateKeyUseInfo(handleCwd);
        //test();
        console.log(handleCwd);
        printTime(TimeType.end);
    }

    function test() {
        var content = "/Users/peterzjzhu/Downloads/\nTMSDK_MacOS_3/SDK/TMSDK.framework/.DS_Store: application/octet-stream; charset=binary";
        var contents = content.split(gInfoSeperates);
        console.log(contents);
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
        let infoFilePath = gInfoFile;
        fs.writeFileSync(infoFilePath, "");
        scanPath(path);

        console.log("\n########################\n");
        console.log("日志信息：");
        let gFilesInfoSort = gFilesInfo.sort(sortInfoBySize);
        for(let item of gFilesInfoSort) {
            let items = item.split(gInfoSeperates);
            let itemTotalSize = Number(items[1]);
            let formatSize = formatBytes(itemTotalSize, 2);
            items[1] = formatSize;
            let info = items.join(":");
            console.log(info);
            gFilesFormatInfo.push(info);
        }
        console.log(gFilesFormatInfo);

        //输出文件类型
        console.log("1、输出文件类型:\n");
        console.log(gExtnameSet);

        //按文件类型输出：type + ": " + num + ": " + totalFormatSize  //类型 + 该类文件总数量 + 该类文件总大小
        console.log("2、按文件类型输出：type + :  + num + :  + totalSize  //类型 + 该类文件总数量 + 该类文件总大小\n");
        var items = Array.from(gExtnameMap.values());
        var sortItems = items.sort(sortBySize);
        //console.log(sortItems);
        for(let item of sortItems) {
            let type = item[2];
            let itemTotalNum = item[0];
            let itemTotalSize = item[1];
            let itemTotalFromatSize = formatBytes(itemTotalSize, 2);
            let info = type + ": " + itemTotalNum + ": " + itemTotalFromatSize;
            console.log(info);
        }
    }

    /*
        指定目录下递归遍历扫描所有的指定后缀的文件
        path：目录
    */
    function scanPath(path: string) {
        var stats = fs.statSync(path);
        var symbolicLinkStats = fs.statSync(path);
        if (!stats.isDirectory()) {
            console.log(path + " " + "不是目录");
            return;
        }
        var files = fs.readdirSync(path); //得到文件夹下的所有文件，包含文件夹名称
        for (const name of files) { // 遍历子目录
            var fullPath = path + "/" + name;
            stats = fs.statSync(fullPath);
            symbolicLinkStats = fs.lstatSync(fullPath);
            if (symbolicLinkStats.isSymbolicLink()) {
                //console.log("链接文件不用统计处理:" + name + " " + fullPath);
                continue;
            }else if (stats.isDirectory()) { // 处理目录
                scanPath(fullPath); // 对所有子文件夹进行搜索
            } else if (stats.isFile()) { // 处理文件
                scanAnalysizeFile(path, name);
            } else {
                console.log("建议先clean 未知文件:" + name + " " + fullPath);
            }
        }
    }

    /*
        使用指定的匹配模式，扫描指定目录下，指定名称的文件 统计key使用信息，生成key使用文件
        path：目录
        name：文件名
        按文件输出：name + ": " + Size + ": " + type //文件名 + 大小 + 类型
        按文件类型输出：type + ": " + num + ": " + totalSize  //类型 + 该类文件总数量 + 该类文件总大小
     */
    function scanAnalysizeFile(path: string, name: string) {
        const fullPath = path + "/" + name;
        const stats = fs.statSync(fullPath);
        var size = stats.size;
        var type = path_.extname(name);
        if (isEmptyStr(type)) {
            const commandFile = "file -I " + fullPath;
            var typeInfo = shell.exec(commandFile).stdout;
            let typeInfos = typeInfo.split(gInfoSeperates);
            if(typeInfos.length > 0) {
                typeInfo = typeInfos[1];
            }
            type = typeInfo;
        }
        gExtnameSet.add(type);

        var item = gExtnameMap.get(type)
        if(item == undefined) {
            item = [1, size, type];
        }else {
            item = [item[0] + 1, item[1] + size, type];
        }
        gExtnameMap.set(type, item);
        const info = name + ": " + size + ": " + type; //+ ": " + fullPath ;
        gFilesInfo.push(info);
        //console.log(info);
    }

    function isEmptyStr(s: string) {
        if (s == undefined || s == null || s == '') {
            return true
        }
        return false
    }

    function formatBytes(a: number, b: number) {
        if (0 == a) return "0 B";
        const c = 1024, d = b || 2, e = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], f = Math.floor(Math.log(a) / Math.log(c));
        return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    }

    function sortBySize(item: Array<any>, item1: Array<any>) {
        let itemTotalSize = item[1];
        let itemTotalSize1 = item1[1];
        return itemTotalSize < itemTotalSize1 ? 1 : -1;
    }

    function sortInfoBySize(item: string, item1: string) {
        let items = item.split(gInfoSeperates);
        let itemTotalSize = Number(items[1]);

        let items1 = item1.split(gInfoSeperates);
        let itemTotalSize1 = Number(items1[1]);
        return itemTotalSize < itemTotalSize1 ? 1 : -1;
    }

}