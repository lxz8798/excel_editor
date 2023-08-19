import { defHttp } from '/@/utils/http/axios';
import { LoginParams, LoginResultModel, GetUserInfoModel } from './model/userModel';

import { ErrorMessageMode } from '/#/axios';

enum Api {
  Login = '/login',
  Logout = '/logout',
  GetUserInfo = '/getUserInfo',
  GetPermCode = '/getPermCode',
  TestRetry = '/testRetry',
  register = '/user/add',
  editUserInfo = '/user/editPwd',
  EDIT_USER_PERMISSION = '/user/editUser',
  deleteUser = '/user/del/',
  GET_USER_TAG = '/sysUserLabel/list',
  ADD_USER_TAG = '/sysUserLabel/add',
  DELETE_USER_TAG = '/sysUserLabel/del',
  GET_ROLE_LIST = '/roleList',
  SET_ACTIVE_USER = '/activeProjectUser',
  GET_LOG_LIST = '/operationLog/page',
  GET_USER_ALL_PROJECTS = '/examContract/listJoin',
  GET_USER_FILES = '/user/files',
  DEL_USER_FILE = '/user/delFile',
  USER_DIRS = '/user/userDirs',
  USER_DIR_TYPE = '/user/typeDirs',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.get<GetUserInfoModel>({ url: Api.GetUserInfo }, { errorMessageMode: 'none' });
}

export function getPermCode() {
  return defHttp.get<string[]>({ url: Api.GetPermCode });
}

export function doLogout() {
  return defHttp.get({ url: Api.Logout });
}

export function testRetry() {
  return defHttp.get(
    { url: Api.TestRetry },
    {
      retryRequest: {
        isOpenRetry: true,
        count: 5,
        waitTime: 1000,
      },
    },
  );
}
export function regUser(params) {
  return defHttp.post({ url: Api.register, params });
}

export function editUser(params) {
  return defHttp.put({ url: Api.editUserInfo, params });
}

export function editUserPermissions(params) {
  return defHttp.put({ url: Api.EDIT_USER_PERMISSION, params });
}

export function activeUser(params) {
  return defHttp.post({ url: Api.SET_ACTIVE_USER, params });
}

export function deleteUser(params) {
  return defHttp.delete({ url: Api.deleteUser + params.userId });
}

export function getUserTagList(params) {
  return defHttp.get({ url: Api.GET_USER_TAG, params });
}

export function addUserTag(params) {
  return defHttp.post({ url: Api.ADD_USER_TAG, params });
}

export function deleteUserTag(params) {
  return defHttp.delete({ url: `${Api.DELETE_USER_TAG}?id=${params.id}` });
}

export function getRoles() {
  return defHttp.get({ url: Api.GET_ROLE_LIST });
}

export function getLogList() {
  return defHttp.get({ url: Api.GET_LOG_LIST });
}

export function getUserProjectHistory(params) {
  return defHttp.get({ url: Api.GET_USER_ALL_PROJECTS, params });
}

export function getUserFiles(params) {
  return defHttp.get({ url: Api.GET_USER_FILES, params });
}

export function delUserFiles(params) {
  return defHttp.get({ url: Api.DEL_USER_FILE, params });
}

export function allUserFiles(params) {
  return defHttp.get({ url: Api.USER_DIRS, params });
}

export function userProjectType(params) {
  return defHttp.get({ url: Api.USER_DIR_TYPE, params });
}
