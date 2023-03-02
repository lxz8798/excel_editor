import { defHttp } from '/@/utils/http/axios';
import { getMenuListResultModel } from './model/menuModel';

enum Api {
  // GetMenuList = '/getMenuList',
  GetMenuList = '/sysMenu/tree',
  GET_MENU_CHILDREN = '/sysMenuTemplate/menuTemplates',
  EDIT_MENU = '/sysMenu/edit',
  ADD_MENU = '/sysMenu/add',
  DELETE_MENU = '/sysMenu/del',
  GET_MENU_CATEGORY = 'sysMenu/getChildMenu',
  GET_CATEGROY_ID = '/sysMenu/getClassifier',
  GET_TECHNOLOGY_TREE = '/sysMenu/treeTechnology',
}

/**
 * @description: Get user menu based on id
 */

export const getMenuList = () => defHttp.get<getMenuListResultModel>({ url: Api.GetMenuList });
export const getMenuChildren = (params?) => defHttp.get({ url: Api.GET_MENU_CHILDREN, params });
export const editMenu = (params?) => defHttp.put({ url: Api.EDIT_MENU, params });
export const addMenu = (params?) => defHttp.post({ url: Api.ADD_MENU, params });
export const deleteMenu = (params?) => defHttp.delete({ url: `${Api.DELETE_MENU}?menuId=${params.menuId}` });
export const getMenuCategory = (params?) => defHttp.get({ url: Api.GET_MENU_CATEGORY, params });
export const getCategory = (params?) => defHttp.get({ url: Api.GET_CATEGROY_ID, params });
export const getTechnologyTree = (params?) => defHttp.get({ url: Api.GET_TECHNOLOGY_TREE });
