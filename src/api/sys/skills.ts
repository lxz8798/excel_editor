import { defHttp } from '/@/utils/http/axios';

import { SkillsItemModel, SkillsParams } from './model/skillsModel';

enum Api {
  GET_SKILLS_LIST = '/sysUserSkill/list',
  ADD_SKILLS = '/sysUserSkill/add',
  DEL_SKILLS = '/sysUserSkill/del',
  UPDATA_SKILLS = '/sysUserTeam/update',
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

export function delSkills(params) {
  return defHttp.delete<SkillsItemModel>(
    {
      url: `${Api.DEL_SKILLS}/${params.id}`,
    },
    {},
  );
}
