import * as decode from "./decode";

if(process.argv[2]==null){
    throw new Error("argv configJsonPath does not exist;exit 1;");
}
if(process.argv[3]==null){
    throw new Error("argv targetpath does not exist;exit 1;");
}

console.log("configJsonPath:",process.argv[2]);
console.log("targetpath:",process.argv[3]);

decode.main(process.argv[2],process.argv[3]);




