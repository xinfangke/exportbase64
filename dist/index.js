"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const iconvLite = require("iconv-lite");
const jszip = require("jszip");
if (process.argv[2] == null) {
    throw new Error("argv sourcepath does not exist;exit 1;");
}
if (process.argv[3] == null) {
    throw new Error("argv targetpath does not exist;exit 1;");
}
if (process.argv[4] == null) {
    throw new Error("argv interfacepath does not exist;exit 1;");
}
let sourcepath = path.normalize(process.argv[2]);
let targetpath = path.normalize(process.argv[3]);
let interfacepath = path.normalize(process.argv[4]);
let defaultConfigfigListName = "configlist.xlsx";
console.log("sourcePath:", sourcepath);
console.log("targetPath:", targetpath);
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(targetpath)) {
            throw new Error("targetpath does not exist;exit 1;");
        }
        let tableNames = yield getConfitList();
        let tables = [];
        for (let i = 0; i < tableNames.length; i++) {
            let value = tableNames[i];
            if (value.indexOf(".xlsx") == -1) {
                value = value + ".txt";
            }
            let content = yield getTable(value);
            if (content) {
                tables.push(content);
            }
        }
        yield saveJson(tables);
        yield saveInterface(tables);
        console.log("配置表数据完成");
        return null;
    });
}
/** 保存所有配置表 */
function saveJson(contentTable) {
    return __awaiter(this, void 0, void 0, function* () {
        let savepath = path.normalize(targetpath + "/config.zip");
        let allJson = {};
        contentTable.forEach(value => {
            allJson[value.tableName.substr(0, value.tableName.lastIndexOf("."))] = value.table;
        });
        let allJsonStr = JSON.stringify(allJson);
        // if (allJsonStr.indexOf("\\n") != -1) {
        //     allJsonStr = allJsonStr.replace(/\\n/g, 'n');
        // }
        let zip = new jszip();
        zip.file("allcfg.json", allJsonStr);
        let data = yield zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
        fs.writeFileSync(savepath, data);
        if (!fs.existsSync(savepath)) {
            throw new Error("saveJson does not exist;" + savepath + "; exit 1;");
        }
        return true;
    });
}
/** 保存程序中用到的表述与引用 */
function saveInterface(contentTable) {
    return __awaiter(this, void 0, void 0, function* () {
        let savepath = path.normalize(interfacepath + "/Cfgs.ts");
        let classs = "";
        let types = "";
        contentTable.forEach(value => {
            let tableName = value.tableName.substr(0, value.tableName.lastIndexOf("."));
            classs += `export const ${tableName}:{name:string,clz:Types.${tableName}} = {name:"${tableName}",clz:null};\n`;
            let interfaceStr = `export interface ${tableName}{\n`;
            value.importProperties.forEach((propertie, index) => {
                let typeStr = "";
                let des = value.importDess[index];
                switch (value.importTypes[index]) {
                    case "INT":
                    case "﻿INT":
                    case "FLOAT":
                    case "﻿FLOAT":
                        typeStr = "number";
                        break;
                    case "[INT]":
                    case "﻿[INT]":
                        typeStr = "number[]";
                        break;
                    case "[STRING]":
                    case "﻿[STRING]":
                        typeStr = "string[]";
                        break;
                    default:
                        typeStr = "string";
                }
                interfaceStr += `/** ${des} */ \n ${propertie}:${typeStr};\n`;
            });
            interfaceStr += "}\n";
            types += interfaceStr;
        });
        let cfgStr = `module Cfgs{ 
        ${classs} 
        export declare namespace Types {
            ${types} 
        }
    }`;
        fs.writeFileSync(savepath, cfgStr);
    });
}
/** 获取配置文件名列表，筛选符合导出的文件名 */
function getConfitList() {
    return __awaiter(this, void 0, void 0, function* () {
        let listPath = path.normalize(sourcepath + "/" + defaultConfigfigListName);
        let wb = xlsx.readFile(listPath);
        let jsons = xlsx.utils.sheet_to_json(wb.Sheets["Sheet1"], { header: 1 });
        let tabileNames = [];
        for (let i = 1; i < jsons.length; ++i) {
            if (jsons[i][3] == 1) {
                tabileNames.push(jsons[i][1]);
            }
        }
        return tabileNames;
    });
}
/** 获取具体的配置表内容 */
function getTable(tableName, encoding = "gbk") {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(tableName);
        let tablePath = path.normalize(sourcepath + "/" + tableName);
        let table = {};
        if (!fs.existsSync(tablePath)) {
            throw new Error("tablePath does not exist;" + tablePath + "; exit 1;");
        }
        let wb;
        if (tableName.indexOf("xlsx") != -1) {
            wb = xlsx.readFile(tablePath);
        }
        else {
            let readFile = fs.readFileSync(tablePath);
            let str = iconvLite.decode(readFile, encoding);
            wb = xlsx.read(str, { type: "string" });
        }
        let jsons = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        let types = jsons[0];
        let properties = jsons[1];
        let tableLength = 0;
        if (properties[0] != "id") {
            console.warn(tableName + "->" + properties[0] + "!=id");
            properties[0] = "id";
        }
        let isOutCols = jsons[2];
        isOutCols[0] = 1;
        let dess = jsons[3];
        let importProperties = []; //导出的可用属性
        let importTypes = []; //导出的可用类型
        let importDess = []; //导出的可用注释
        //处理需要导出的属性与类型
        isOutCols.forEach((value, index) => {
            if (value == 1) {
                importProperties.push(properties[index]);
                importTypes.push(types[index]);
                importDess.push(dess[index]);
            }
        });
        for (let i = 4; i < jsons.length; ++i) {
            let row = jsons[i].concat();
            if (row[0] == null || row[0].toString().indexOf("#") != -1) {
                continue;
            }
            let item = {};
            isOutCols.forEach((value, index) => {
                if (value == 1) {
                    if (row[index] == null) {
                        return;
                    }
                    switch (types[index]) {
                        case "INT":
                        case "﻿INT":
                            item[properties[index]] = parseInt(row[index]);
                            break;
                        case "FLOAT":
                        case "﻿FLOAT":
                            item[properties[index]] = parseFloat(row[index]);
                            break;
                        case "[INT]":
                        case "﻿[INT]":
                            let strs = row[index].toString().split("|");
                            let nums = [];
                            for (let j = 0; j < strs.length; j++) {
                                nums.push(parseInt(strs[j]));
                            }
                            item[properties[index]] = nums;
                            break;
                        case "[STRING]":
                        case "﻿[STRING]":
                            item[properties[index]] = row[index].toString().split("|");
                            break;
                        default:
                            item[properties[index]] = row[index];
                    }
                }
                else {
                    properties;
                }
            });
            table[row[0]] = item; //row[0] = id
            tableLength++;
        }
        table["__proto__"]["tableLength"] = tableLength;
        return { tableName, table, importProperties, importTypes, importDess };
    });
}
//# sourceMappingURL=index.js.map