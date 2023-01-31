import { defHttp } from '/@/utils/http/axios';

enum Api {
  GET_FROM_LIST = '/sysMenuTemplate/menus', // 获得表单列表
  GET_TEMPLATE_DETAIL = '/dymcFrom/all', // 获得所有的表单项
  GET_TEMPLATE_ECHO = '/template/reportInfo', // 获得所有的表单项
  GET_TEMPLAYTE_COLUMN = '/template/reportInfoColumn',
  ADD_INPUT_ITEM = '/template/saveRebortVertical', // 动态添加表单项
  SAVE_FORM_DATA = '/template/addProperty', // 保存表单
  DOWN_EXCEL = '/excel/downLoadExcel', // 保存表单
  BASIC_TEMPLATE = '/dymcBaseLable/getByTemplate',
  UPLOAD_EXCEL = '/template/importRebortVertical',
  CHANGE_INPUT_VALUE = '/template/editRebortHead',
  CHANGE_INFO_INPUT_VALUE = '/template/editReportInfoColumn',
  SAVE_ADD_INPUTS = '/template/addReportInfoColumn',
  DELETE_INPUT_ITEM = '/template/delReportInfoColumn',
  EDIT_TEMPLATE_TITLE = '/template',
  CLEAR_TEMPLATE = '/template',
  DELETE_TEMPLATE_ROW = '/template/delReportInfo',
  CHANGE_TEMPLATE_PROJECT_NAME = '/template/getProjectName',
  GET_PROJECT_LIST = '/examContract/list',
  ADD_PROJECT_ITEM = '/examContract/add',
  DEL_PROJECT_ITEM = '/examContract/del',
}

export const getFromTemplateList = (params?) => defHttp.get({ url: Api.GET_FROM_LIST, params });
export const getBasicTemplate = (params?) => defHttp.get({ url: Api.BASIC_TEMPLATE, params });
export const getTempItems = (params?) => defHttp.get({ url: Api.GET_TEMPLATE_DETAIL, params });
export const templateEcho = (params?) => defHttp.get({ url: Api.GET_TEMPLATE_ECHO, params });
export const getColumn = (params?) => defHttp.get({ url: Api.GET_TEMPLAYTE_COLUMN, params, timeout: 1000 * 60 * 30 });
export const addInputItem = (params?) => defHttp.post({ url: Api.ADD_INPUT_ITEM, params });
export const uploadExcel = (params?) => defHttp.post({ url: Api.UPLOAD_EXCEL, params });
export const changeInputValueApi = (params?) => defHttp.post({ url: Api.CHANGE_INPUT_VALUE, params });
export const changeInfoInputVlaueApi = (params?) => defHttp.post({ url: Api.CHANGE_INFO_INPUT_VALUE, params });
export const saveAddInputs = (params?) => defHttp.post({ url: Api.SAVE_ADD_INPUTS, params });
export const deleteInputItemApi = (params?) => defHttp.post({ url: Api.DELETE_INPUT_ITEM, params });
export const editTemplateTitle = (params?) => defHttp.put({ url: Api.EDIT_TEMPLATE_TITLE, params });
export const changeTemplateProjectName = (params?) => defHttp.get({ url: Api.CHANGE_TEMPLATE_PROJECT_NAME, params });
export const clearTemplate = (params?) => defHttp.delete({ url: `${Api.CLEAR_TEMPLATE}?templateId=${params.templateId}` });
export const deleteTemplateRow = (params?) => defHttp.delete({ url: `${Api.DELETE_TEMPLATE_ROW}?templateId=${params.templateId}&columnIndex=${params.columnIndex}&columnType=${params.columnType}` });
export const saveFormData = (params) => defHttp.get({ url: Api.SAVE_FORM_DATA, params });
export const downloadEXCEL = (params) => defHttp.get({ url: Api.DOWN_EXCEL, params });
export const getProjectList = () => defHttp.get({ url: Api.GET_PROJECT_LIST });
export const addProjectItem = (params) => defHttp.post({ url: Api.ADD_PROJECT_ITEM, params });
export const delProjectItem = ({ id }) => defHttp.delete({ url: `${Api.DEL_PROJECT_ITEM}?id=${id}` });
