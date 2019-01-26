import * as fs from 'fs';
import * as path from 'path';

export let sourcepath = null;
export let targetpath = null;

export async function main(_sourcepath:string,_targetpath:string){

    sourcepath = path.normalize(_sourcepath);
    targetpath = path.normalize(_targetpath);

    if(sourcepath==null){
        throw new Error("argv sourcepath does not exist;exit 1;");
    }
    if(targetpath==null){
        throw new Error("argv targetpath does not exist;exit 1;");
    }
    await getConfigFileList(sourcepath);

    return true;
}


export async function getConfigFileList(sourcepath:string){

    if(!fs.existsSync(sourcepath)){
        throw new Error("configpath does not exist;exit 1;"+sourcepath);
    }
    let fileContent = JSON.parse(fs.readFileSync(sourcepath,{encoding:"utf8"}));
    console.log(fileContent);

    return true;
}


/** 获取目录内容 */
function dirLoop(dir:string) {  
    var children:string[] = []  
    fs.readdirSync(dir).forEach(function(filename){ 
        var path = "";
        if(dir.charAt(dir.length-1)=="/"){
            path = dir+filename;
        }else{
            path = dir+"/"+filename;
        } 
        var stat = fs.statSync(path)  
        if (stat && stat.isDirectory()) {  
            children = children.concat(dirLoop(path))  
        }  
        else {
            if(path.indexOf(".DS_Store")==-1){
                children.push(path);  
            }  
            
        }  
    });
  
    return children  
}


