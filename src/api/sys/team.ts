import { defHttp } from '/@/utils/http/axios';

import { TeamItemModel, TeamParams } from './model/teamModel';

enum Api {
  GET_TEAM_LIST = '/sysUserTeam/list',
  ADD_TEAM = '/sysUserTeam/add',
  DEL_TEAM = '/sysUserTeam/del',
  UPDATA_TEAM = '/sysUserTeam/update',
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
