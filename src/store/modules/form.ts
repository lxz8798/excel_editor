import { defineStore } from 'pinia';
import {
  addInputItem,
  getTempItems,
  getBasicTemplate,
  templateEcho,
  uploadExcel,
  getColumn,
  editTemplateTitle,
  deleteTemplateRow,
  changeTemplateProjectName,
} from '/@/api/demo/form';
import { getMenuChildren } from '/@/api/sys/menu';
import { useMessage } from '/@/hooks/web/useMessage';
import { store } from '/@/store';
interface formState {
  tempList: [];
  menuChildren: [];
  // Page loading status
  currTemp: object;
  inputItems: [];
  defaultValues: object;
  saveMsg: string;
  basicTemplate: [];
  templateEcho: [];
  columnList: [];
  columnDetail: {};
  templateTitle: '';
  projectName: '';
}
const { createMessage } = useMessage();
export const useFormStore = defineStore({
  id: 'app-form',
  state: (): formState => ({
    tempList: [],
    menuChildren: [],
    currTemp: {},
    inputItems: [],
    defaultValues: {},
    saveMsg: '',
    basicTemplate: [],
    templateEcho: [],
    columnList: [],
    columnDetail: {},
    templateTitle: '',
    projectName: '',
  }),
  getters: {
    getTempList(): any[] {
      return this.tempList;
    },
    getMenuChildren(): any[] {
      return this.menuChildren;
    },
    getCurrTemp(): object {
      return this.currTemp;
    },
    getInputItems(): any[] {
      return this.inputItems;
    },
    getDefaultValues(): object {
      return this.defaultValues;
    },
    getSaveMsg(): string {
      return this.saveMsg;
    },
    getTemplateEcho(): any[] {
      return this.templateEcho;
    },
    getBasicTemplate(): any[] {
      return this.basicTemplate;
    },
    getColumnList(): any[] {
      return this.columnList;
    },
    getColumnDetail(obj: object) {
      return this.columnDetail;
    },
    getTemplateTitle(): string {
      return this.templateTitle;
    },
    getTemplateProjectName(): string {
      return this.projectName;
    },
  },
  actions: {
    setTempList(list: []) {
      this.tempList = list;
    },
    setCurrTemp(obj: obj) {
      this.currTemp = obj;
    },
    setDefaultValues(obj: object) {
      this.defaultValues = obj;
    },
    setColumnDetail(obj: object) {
      this.columnDetail = obj;
    },
    setDeleteTemplateRow(params) {
      return deleteTemplateRow(params);
    },
    async setTemplateTitle(params: object) {
      this.templateTitle = await editTemplateTitle(params);
      getMenuChildren({ menuId: params.id }).then(() => location.reload());
      // if (this.templateTitle == '修改成功') {
      //   getMenuChildren({ menuId: params.id }).then(() => location.reload());
      // }
    },
    async setMenuChildren(menuId: number) {
      this.menuChildren = await getMenuChildren(menuId);
    },
    async setColumnList(params: object) {
      this.columnList = await getColumn(params);
    },
    async setInputItems(id) {
      this.inputItems = await getTempItems(id);
    },
    async saveForm(list: []) {
      this.saveMsg = await addInputItem(list);
    },
    async setTemplateEcho(id) {
      this.templateEcho = await templateEcho({ templateId: id });
    },
    async setBasicTemplate(id) {
      const _temp = await getBasicTemplate({ templateId: id });
      const _no = {id: '0', label: '序号', sort: 0,inputs: [], templateId: id};
      this.basicTemplate = [_no].concat(_temp).map((i) => {
        i.inputs = [];
        return i;
      });
    },
    async setTemplateProjectName(params) {
      this.projectName = await changeTemplateProjectName(params);
      return Promise.resolve(this.projectName);
    },
    async uploadExcel(params) {
      const result = await uploadExcel(params);
    },
  },
});

export function useFormStoreWithOut() {
  return useFormStore(store);
}
