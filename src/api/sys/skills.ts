import { defHttp } from '/@/utils/http/axios';

import { SkillsItemModel, SkillsParams } from './model/skillsModel';

enum Api {
  // 管理员技能列表
  GET_ALL_SKILLS = '/user/skill',
  // 普通用户技能列表
  GET_SKILLS_LIST = '/sysUserSkill/list',
  ADD_SKILLS = '/sysUserSkill/add',
  // 管理员删除技能，传skillsId
  DELETE_SKILLS = '/sysUserSkill/delSkill',
  // 删除技能关系，只取消技能关系，非管理员使用
  DEL_SKILLS = '/sysUserSkill/del',
  UPDATA_SKILLS = '/sysUserTeam/update',
}

export function getAllSkills() {
  return defHttp.get<SkillsItemModel>(
    {
      url: Api.GET_ALL_SKILLS,
    },
    {},
  );
}

export function getSkills(params: SkillsParams) {
  return defHttp.get<SkillsItemModel>(
    {
      url: Api.GET_SKILLS_LIST,
      params,
    },
    {},
  );
}

export function addSkillsItem(params: SkillsParams) {
  return defHttp.post<SkillsItemModel>(
    {
      url: Api.ADD_SKILLS,
      params,
    },
    {},
  );
}

export function editSkillsItem(params) {
  return defHttp.put<SkillsItemModel>(
    {
      url: `${Api.UPDATA_SKILLS}/${params.id}`,
    },
    {},
  );
}
// 删除技能关系，只取消技能关系，非管理员使用
export function delSkills(params) {
  return defHttp.delete<SkillsItemModel>(
    {
      url: `${Api.DEL_SKILLS}/${params.id}`,
    },
    {},
  );
}

// 管理员删除技能，传skillsId
export function deleteSkills(params) {
  return defHttp.delete<SkillsItemModel>(
    {
      url: `${Api.DELETE_SKILLS}/${params.id}`,
    },
    {},
  );
}
