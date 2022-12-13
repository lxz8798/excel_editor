import { defHttp } from '/@/utils/http/axios';

enum Api {
  GET_FROM_LIST = '/template', // 获得表单列表
  GET_TEMPLATE_DETAIL = '/dymcFrom/all', // 获得所有的表单项
  ADD_INPUT_ITEM = '/dymcFrom/edit', // 动态添加表单项
  SAVE_FORM_DATA = '/template/addProperty', // 保存表单
  DOWN_EXCEL = '/excel/downLoadExcel', // 保存表单
}

export const getFromTemplateList = (params) => defHttp.get({ url: Api.GET_FROM_LIST, params });

export const getTempItems = (params?) => defHttp.get({ url: Api.GET_TEMPLATE_DETAIL, params });

export const addInputItem = (params?) => defHttp.post({ url: Api.ADD_INPUT_ITEM, params });

export const saveFormData = (params) => defHttp.get({ url: Api.SAVE_FORM_DATA, params });
export const downloadEXCEL = (params) => defHttp.get({ url: Api.DOWN_EXCEL, params });
