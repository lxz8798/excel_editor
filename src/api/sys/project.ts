import { defHttp } from '/@/utils/http/axios';
import { ProjectParamsModel } from './model/projectModel';
import { ProjectItemModel } from '/@/api/sys/model/projectModel';

enum Api {
  ADD_PROJECT = '/examContract/add',
  GET_PROJECT_LIST = '/examContract/list',
  GET_OWNER_PROJECT_LIST = '/examContract/listOwner',
  DEL_PROJECT = '/examContract/del',
  PUT_PROJECT = '/examContract/edit',
  INVITE_USER = '/inviteUser',
  PROJECT_USER_LIST = '/user/projectUsers',
  REMOVE_PROJECT_MEMBERS = '/removeTeamUser',
}

export function addProject(params) {
  return defHttp.post<ProjectParamsModel[]>(
    {
      url: Api.ADD_PROJECT,
      params,
    },
    {},
  );
}

export function getProjects() {
  return defHttp.get<ProjectParamsModel[]>(
    {
      url: Api.GET_PROJECT_LIST,
    },
    {},
  );
}

export function getOwnerProjectList(params: ProjectParamsModel) {
  return defHttp.get<ProjectParamsModel[]>(
    {
      url: Api.GET_OWNER_PROJECT_LIST,
      params,
    },
    {},
  );
}

export function editProject(params) {
  return defHttp.put<ProjectItemModel>(
    {
      url: Api.PUT_PROJECT,
      params,
    },
    {},
  );
}

export function delProject(params) {
  return defHttp.delete<ProjectItemModel>(
    {
      url: `${Api.DEL_PROJECT}?id=${params.id}`,
    },
    {},
  );
}

export function projectInviteUsers(params) {
  return defHttp.post<ProjectItemModel>(
    {
      url: Api.INVITE_USER,
      params,
    },
    {},
  );
}

export function getProjectUserList() {
  return defHttp.get(
    {
      url: Api.PROJECT_USER_LIST,
    },
    {},
  );
}

export function removeProjectMembers(params) {
  return defHttp.post(
    {
      url: Api.REMOVE_PROJECT_MEMBERS,
      params,
    },
    {},
  );
}

