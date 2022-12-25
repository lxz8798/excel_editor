import { defHttp } from '/@/utils/http/axios';

enum Api {
  GET_FROM_LIST = '/sysMenuTemplate/menus', // 获得表单列表
  GET_MENU_CHILDREN = '/sysMenuTemplate/menuTemplates',
  GET_TEMPLATE_DETAIL = '/dymcFrom/all', // 获得所有的表单项
  GET_TEMPLATE_ECHO = '/template/reportInfo', // 获得所有的表单项
  GET_TEMPLAYTE_COLUMN = '/template/reportInfoColumn',
  ADD_INPUT_ITEM = '/template/saveRebortVertical', // 动态添加表单项
  SAVE_FORM_DATA = '/template/addProperty', // 保存表单
  DOWN_EXCEL = '/excel/downLoadExcel', // 保存表单
  BASIC_TEMPLATE = '/dymcBaseLable/getByTemplate',
  UPLOAD_EXCEL = '/template/importRebortVertical',
}

export const getFromTemplateList = (params?) => defHttp.get({ url: Api.GET_FROM_LIST, params });
export const getMenuChildren = (params?) => defHttp.get({ url: Api.GET_MENU_CHILDREN, params });
export const getBasicTemplate = (params?) => defHttp.get({ url: Api.BASIC_TEMPLATE, params });
export const getTempItems = (params?) => defHttp.get({ url: Api.GET_TEMPLATE_DETAIL, params });
export const templateEcho = (params?) => defHttp.get({ url: Api.GET_TEMPLATE_ECHO, params });
export const getColumn = (params?) => defHttp.get({ url: Api.GET_TEMPLAYTE_COLUMN, params, timeout: 1000 * 60 * 30 });
export const addInputItem = (params?) => defHttp.post({ url: Api.ADD_INPUT_ITEM, params });
export const uploadExcel = (params?) => defHttp.post({ url: Api.UPLOAD_EXCEL, params });

export const saveFormData = (params) => defHttp.get({ url: Api.SAVE_FORM_DATA, params });
export const downloadEXCEL = (params) => defHttp.get({ url: Api.DOWN_EXCEL, params });
