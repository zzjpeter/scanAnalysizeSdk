/*
package.json中配置才编译通过："type": "module",
{ ext: 'png', mime: 'image/png' }
 */
import {fileTypeFromFile} from "file-type";

async function test06() {
    console.log(await fileTypeFromFile('/Users/peterzjzhu/Desktop/Tencent/模块相关负责人.png'));
}

function main() {
    test06();
}

main();
