import { defineStore } from 'pinia';
import { addInputItem, getTempItems, downloadEXCEL } from "/@/api/demo/form";
import { useMessage } from '/@/hooks/web/useMessage';
import { store } from '/@/store';
interface formState {
  tempList: [];
  // Page loading status
  currTemp: object;
  inputItems: [];
  defaultValues: object;
  saveMsg: string;
}
const { createMessage } = useMessage();
export const useFormStore = defineStore({
  id: 'app-form',
  state: (): formState => ({
    tempList: [],
    currTemp: {},
    inputItems: [],
    defaultValues: {},
    saveMsg: '',
  }),
  getters: {
    getTempList(): any[] {
      return this.tempList;
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
  },
  actions: {
    setTempList(list: []) {
      this.tempList = list;
    },
    setCurrTemp(id: string) {
      this.currTemp = this.tempList.filter((i) => i['id'] === id)[0];
    },
    setDefaultValues(obj: object) {
      this.defaultValues = obj;
    },
    async setInputItems(id) {
      this.inputItems = await getTempItems(id);
    },
    async saveForm(list: []) {
      this.saveMsg = await addInputItem(list);
    },
  },
});

export function useFormStoreWithOut() {
  return useFormStore(store);
}
