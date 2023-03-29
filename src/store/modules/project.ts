import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getProjectUserList, removeProjectMembers, changeAuditStatus } from '/@/api/sys/project';
// import { ProjectMembersModel } from '/@/api/sys/model/projectModel';
interface ProjectState {
  menuIds?: string[];
  projectUserList: [];
  removeMembersResult: string;
  changeAuditStatus: string;
}

export const useProjectStore = defineStore({
  id: 'app-project',
  state: (): ProjectState => ({
    menuIds: undefined,
    projectUserList: [],
    removeMembersResult: '',
    changeAuditStatus: '',
  }),
  getters: {
    getMenuIds(): string[] | undefined {
      return this.menuIds;
    },
    getProjectUserList(): [] {
      return this.projectUserList;
    },
    getAuditStatus() {
      return this.changeAuditStatus;
    },
  },
  actions: {
    // sync
    setMenuIds(list: string[]) {
      this.menuIds = list;
    },
    // async
    async setAuditStatus(params) {
      this.changeAuditStatus = await changeAuditStatus(params);
      return this.changeAuditStatus;
    },
    async setProjectUserList() {
      this.projectUserList = await getProjectUserList();
      return this.projectUserList;
    },
    async removeProjectMembers(params) {
      this.removeMembersResult = await removeProjectMembers(params);
      return this.removeMembersResult;
    },
  },
});

export function useProjectStoreWithOut() {
  return useProjectStore(store);
}
