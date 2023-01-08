import { defHttp } from '/@/utils/http/axios';
import { getMenuListResultModel } from './model/menuModel';

enum Api {
  // GetMenuList = '/getMenuList',
  GetMenuList = '/sysMenu/tree',
  GET_MENU_CHILDREN = '/sysMenuTemplate/menuTemplates',
  EDIT_MENU = '/sysMenu/edit',
  ADD_MENU = '/sysMenu/add',
}

/**
 * @description: Get user menu based on id
 */

export const getMenuList = () => defHttp.get<getMenuListResultModel>({ url: Api.GetMenuList });
export const getMenuChildren = (params?) => defHttp.get({ url: Api.GET_MENU_CHILDREN, params });
export const editMenu = (params?) => defHttp.post({ url: Api.EDIT_MENU, params });
export const addMenu = (params?) => defHttp.post({ url: Api.ADD_MENU, params });
