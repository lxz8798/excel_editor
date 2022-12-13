import { defineStore } from 'pinia';
import { addInputItem, getTempItems, downloadEXCEL } from "/@/api/demo/form";
import { useMessage } from '/@/hooks/web/useMessage';
import { store } from '/@/store';
interface formState {
  tempList: [];
  // Page loading status
  currTemp: object;
  inputItems: [];
}
const { createMessage } = useMessage();
export const useFormStore = defineStore({
  id: 'app-form',
  state: (): formState => ({
    tempList: [],
    currTemp: {},
    inputItems: [],
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
  },
  actions: {
    setTempList(list: []) {
      this.tempList = list;
    },
    setCurrTemp(id: string) {
      this.currTemp = this.tempList.filter((i) => i['id'] === id)[0];
    },
    async setInputItems(id) {
      this.inputItems = await getTempItems(id);
    },
    async saveForm(list: []) {
      const datas = await addInputItem(list);
      console.log(datas);
    },
  },
});

export function useFormStoreWithOut() {
  return useFormStore(store);
}
