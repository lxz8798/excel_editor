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
  getProjectList,
  addProjectItem,
  delProjectItem,
  haveData,
  queryFormHistory,
  getProjectPath,
  generateSubMenu,
  setTemplateTime,
  copyTemplate,
  formHandlerHisotry,
  startCalculation,
  formHandlerLog,
  complateProject,
} from '/@/api/demo/form';
import {
  getMenuChildren,
  addMenu,
  editMenu,
  deleteMenu,
  isProjectMembers,
  getProjectMembersInfoFn,
  idTransform,
  menuIdTransformProjectId,
  menuSwapOrderNo,
  menuIdToTemplateId,
} from '/@/api/sys/menu';
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
  projectNameList: [];
  isFormHasData: boolean;
  isFormHistory: [];
  projectRoutePath: string;
  generateSubMenu: string;
  addNewMenu: string;
  eidtMenuResult: string;
  deleteResult: string;
  isProjectMembers: boolean;
  isProjectNormalMembers: boolean;
  projectMembersInfo: {};
  afterTansformId: string;
  menuIdAfterTransformId: string;
  menuSwapOrderNoResult: string;
  setTemplateTimeResult: string;
  formHandlerHistoryList: [];
  formCalculationLogs: [];
  projectComplateState: string;
}
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
    projectNameList: [],
    isFormHasData: false,
    isFormHistory: [],
    projectRoutePath: '',
    generateSubMenu: '',
    addNewMenu: '',
    eidtMenuResult: '',
    deleteResult: '',
    isProjectMembers: false,
    isProjectNormalMembers: false,
    projectMembersInfo: {},
    afterTansformId: '',
    menuIdAfterTransformId: '',
    menuSwapOrderNoResult: '',
    setTemplateTimeResult: '',
    formHandlerHistoryList: [],
    formCalculationLogs: [],
    projectComplateState: '',
  }),
  getters: {
    getSwapOrderNo(): string {
      return this.menuSwapOrderNoResult;
    },
    getMenuIdTransformId(): string {
      return this.menuIdAfterTransformId;
    },
    getTransformId(): string {
      return this.afterTansformId;
    },
    getJudgResult(): any[] {
      return this.isProjectMembers;
    },
    getJudgNormalResult(): any[] {
      return this.isProjectNormalMembers;
    },
    getProjectMembersInfo(): any[] {
      return this.projectMembersInfo;
    },
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
    getProjectNamesList(): [] {
      return this.projectNameList;
    },
    getFormDataState() {
      return this.isFormHasData;
    },
    getFormHistory() {
      return this.isFormHistory;
    },
    getProjectPath() {
      return this.projectRoutePath;
    },
    getBasicSubMenu() {
      return this.generateSubMenu;
    },
    getNewMenu() {
      return this.addNewMenu;
    },
    getEditMenu() {
      return this.eidtMenuResult;
    },
    getDeleteMenu() {
      return this.deleteResult;
    },
    getTemplateTime() {
      return this.setTemplateTimeResult;
    },
    getFormHandlerHistoryList() {
      return this.formHandlerHistoryList;
    },
    getFormCalculationLog() {
      return this.formCalculationLogs;
    },
    getProjectComplateState() {
      return this.projectComplateState;
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
    async setProjectComplateState(params) {
      return await complateProject(params);
    },
    async startCalculationHandler(params) {
      return await startCalculation(params);
    },
    async setFormCalculationLog(params) {
      this.formCalculationLogs = await formHandlerLog(params);
      return this.formCalculationLogs;
    },
    async setFormHandlerHistoryList(params) {
      this.formHandlerHistoryList = await formHandlerHisotry(params);
      return this.formHandlerHistoryList;
    },
    async setMenuIdToTemplateId(params) {
      return await menuIdToTemplateId(params);
    },
    async setCopyTemplate(params) {
      this.copyTemplateResult = await copyTemplate(params);
      return this.copyTemplateResult;
    },
    async setTemplateTime(params) {
      return await setTemplateTime(params);
    },
    async setSwapOrderNo(params) {
      this.menuSwapOrderNoResult = await menuSwapOrderNo(params);
    },
    async setTransformId(params: string | number) {
      this.afterTansformId = await idTransform(params);
      return this.afterTansformId;
    },
    async setMenuIdTransformId(params: string | number) {
      this.menuIdAfterTransformId = await menuIdTransformProjectId(params);
      return this.menuIdAfterTransformId;
    },
    async setProjectMembersInfo(params): any[] {
      this.projectMembersInfo = await getProjectMembersInfoFn(params);
      return this.projectMembersInfo;
    },
    async setJudgResult(params) {
      this.isProjectMembers = await isProjectMembers(params);
      return this.isProjectMembers
    },
    async setJudgNormalResult(params) {
      this.isProjectNormalMembers = await isProjectMembers(params);
      return this.isProjectNormalMembers
    },
    async setNewMenu(params) {
      this.addNewMenu = await addMenu(params);
      return this.addNewMenu;
    },
    async setEditMenu(params) {
      this.eidtMenuResult = await editMenu(params);
      return this.eidtMenuResult;
    },
    async setDeleteMenu(params) {
      this.deleteResult = await deleteMenu(params);
      return this.deleteResult;
    },
    async setBasicSubMenu(params) {
      this.generateSubMenu = await generateSubMenu(params);
      return this.generateSubMenu;
    },
    async setProjectPath(params) {
      this.projectRoutePath = await getProjectPath();
      return this.projectRoutePath;
    },
    async setFormHistory(params) {
      this.isFormHistory = await queryFormHistory(params);
      return this.isFormHistory;
    },
    async setFormDataState(params) {
      this.isFormHasData = await haveData(params);
      return this.isFormHasData;
    },
    async setTemplateTitle(params: object) {
      this.templateTitle = await editTemplateTitle(params);
      getMenuChildren({ menuId: params.id });
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
    async setProjectNamesList() {
      this.projectNameList = await getProjectList();
      return this.projectNameList;
    },
    async addProjectNameToList(params) {
      const result = await addProjectItem(params);
      return Promise.resolve(result);
    },
    async delProjectNameFormList(params) {
      const result = await delProjectItem(params);
      return Promise.resolve(result);
    },
  },
});

export function useFormStoreWithOut() {
  return useFormStore(store);
}
