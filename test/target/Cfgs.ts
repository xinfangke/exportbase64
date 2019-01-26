module Cfgs{ 
        export const skill_data:{name:string,clz:Types.skill_data} = {name:"skill_data",clz:null};
export const arena_stage_data:{name:string,clz:Types.arena_stage_data} = {name:"arena_stage_data",clz:null};
 
        export declare namespace Types {
            export interface skill_data{
/** #技能ID */ 
 id:number;
/** 技能名 */ 
 SkillName_l:string;
/** 技能图标 */ 
 SkillIcon:string;
/** 技能描述 */ 
 SkillMark_l:string;
/** 技能类型 */ 
 SkillType:number[];
/** 己方技能效果 */ 
 OwnEffect:number;
/** 己方效果参数 */ 
 OwnEffectParm:string[];
}
export interface arena_stage_data{
/** #ID */ 
 id:number;
/** 等级 */ 
 level:number;
/** 最低排名 */ 
 rankMin:number;
/** 最高排名 */ 
 rankMax:number;
/** NPC配置,竖线隔开 */ 
 npcList:number[];
/** 展示NPC */ 
 showNpc:number;
/** NPC指定名称 */ 
 mustName:string;
}
 
        }
    }