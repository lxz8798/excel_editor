import { defineStore } from 'pinia';
import {
  addInputItem,
  getTempItems,
  getBasicTemplate,
  templateEcho,
  uploadExcel,
  getMenuChildren,
  getColumn,
  editTemplateTitle,
  deleteTemplateRow,
  changeInputValue
} from '/@/api/demo/form';
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
    async setTemplateTitle(params: object) {
      this.templateTitle = await editTemplateTitle(params);
      createMessage.success(this.templateTitle);
      if (this.templateTitle == '修改成功') {
        const currTemp = JSON.parse(localStorage.getItem('currTemp'));
        getMenuChildren({ menuId: currTemp.menuId }).then((menu) => {
          const filterTemp = menu.filter((i) => i.id === currTemp.id)[0];
          currTemp.title =
            currTemp.name =
            currTemp.meta.title =
              currTemp.name.split('-')[0] + '-' + filterTemp.templateTitle;
          localStorage.setItem('currTemp', JSON.stringify(Object.assign(currTemp, filterTemp)));
          window.location.reload();
        });
      }
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
    setDeleteTemplateRow(params) {
      return deleteTemplateRow(params);
    },
    async uploadExcel(params) {
      const result = await uploadExcel(params);
    },
  },
});

export function useFormStoreWithOut() {
  return useFormStore(store);
}
