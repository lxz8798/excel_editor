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
  COPY_MENU = '/sysMenu/copyMenu',
  IS_PROJECT_MEMBERS = '/sysMenu/isProjectAdmin',
  IS_PROJECT_NORMAL_MEMBERS = '/inviteUserProject',
  GET_PROJECT_MEMBERS_INFO = '/sysMenu/projectInfo',
  TRANSFORM_ID = '/sysMenu/getMenuByContractId',
  MENUID_TRANSFORM_PROJECTID = '/sysMenu/getContractByMenuId',
  MENU_SWAP_ORDER_NO = '/sysMenu/swapOrderNo',
  MENUID_TO_TEMPLATEID= '/sysMenu/getTemplateByMenuId',
}

/**
 * @description: Get user menu based on id
 */

export const getMenuList = () => defHttp.get<getMenuListResultModel>({ url: Api.GetMenuList });
export const getMenuChildren = (params?) => defHttp.get({ url: Api.GET_MENU_CHILDREN, params });
export const editMenu = (params?) => defHttp.put({ url: Api.EDIT_MENU, params });
export const addMenu = (params?) => defHttp.post({ url: Api.ADD_MENU, params });
export const deleteMenu = (params?) => defHttp.delete({ url: `${Api.DELETE_MENU}?menuId=${params.menuId}`, timeout: 1000 });
export const getMenuCategory = (params?) => defHttp.get({ url: Api.GET_MENU_CATEGORY, params });
export const getCategory = (params?) => defHttp.get({ url: Api.GET_CATEGROY_ID, params });
export const getTechnologyTree = (params?) => defHttp.get({ url: Api.GET_TECHNOLOGY_TREE });
export const copyMenu = (params?) => defHttp.post({ url: Api.COPY_MENU, params });
export const isProjectMembers = (params?) => defHttp.get({ url: Api.IS_PROJECT_MEMBERS, params });
export const isProjectNormalMembers = (params?) => defHttp.get({ url: Api.IS_PROJECT_NORMAL_MEMBERS, params });
export const getProjectMembersInfoFn = (params?) => defHttp.get({ url: Api.GET_PROJECT_MEMBERS_INFO, params });
export const idTransform = (params?) => defHttp.get({ url: Api.TRANSFORM_ID, params });
export const menuIdTransformProjectId = (params?) => defHttp.get({ url: Api.MENUID_TRANSFORM_PROJECTID, params });
export const menuSwapOrderNo = (params?) => defHttp.get({ url: Api.MENU_SWAP_ORDER_NO, params });
export const menuIdToTemplateId = (params?) => defHttp.get({ url: Api.MENUID_TO_TEMPLATEID, params });
