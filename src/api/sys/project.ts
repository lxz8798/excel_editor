import { defHttp } from '/@/utils/http/axios';
import { projectParamsModel } from './model/projectModel';

enum Api {
  GET_PROJECT_LIST = '/examContract/list',
  GET_OWNER_PROJECT_LIST = '/examContract/listOwner',
}

export function getProjectList() {
  return defHttp.get<projectParamsModel[]>(
    {
      url: Api.GET_PROJECT_LIST,
    },
    {},
  );
}

export function getOwnerProjectList(params: projectParamsModel) {
  return defHttp.get<projectParamsModel[]>(
    {
      url: Api.GET_OWNER_PROJECT_LIST,
      params,
    },
    {},
  );
}
