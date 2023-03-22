import { defHttp } from '/@/utils/http/axios';

import { TeamItemModel, TeamParams } from './model/teamModel';
import { SkillsItemModel } from '/@/api/sys/model/skillsModel';

enum Api {
  // 管理员
  GET_ALL_TEAMS = '/user/teams',
  // 普通用户
  GET_TEAM_LIST = '/sysUserTeam/list',
  ADD_TEAM = '/sysUserTeam/add',
  // 非管理员使用
  DEL_TEAM = '/sysUserTeam/del',
  // 管理员使用
  DELETE_TEAM = '/sysUserTeam/delSteam',
  UPDATA_TEAM = '/sysUserTeam/update',
}

export function getAllTeams() {
  return defHttp.get<SkillsItemModel>(
    {
      url: Api.GET_ALL_TEAMS,
    },
    {},
  );
}

export function getTeams(params: TeamParams) {
  return defHttp.get<TeamItemModel>(
    {
      url: Api.GET_TEAM_LIST,
      params,
    },
    {},
  );
}

export function addTeamItem(params: TeamParams) {
  return defHttp.post<TeamItemModel>(
    {
      url: Api.ADD_TEAM,
      params,
    },
    {},
  );
}

export function editTeamItem(params) {
  return defHttp.put<TeamItemModel>(
    {
      url: `${Api.UPDATA_TEAM}/${params.id}`,
    },
    {},
  );
}

export function delTeam(params) {
  return defHttp.delete<TeamItemModel>(
    {
      url: `${Api.DEL_TEAM}/${params.id}`,
    },
    {},
  );
}

export function deleteTeam(params) {
  return defHttp.delete<TeamItemModel>(
    {
      url: `${Api.DELETE_TEAM}/${params.id}`,
    },
    {},
  );
}
