import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getSkills } from '/@/api/sys/skills';
// import { ProjectMembersModel } from '/@/api/sys/model/projectModel';
interface SkillsState {
  menuIds?: string[];
  getUserSkillsList: [];
}

export const useProjectStore = defineStore({
  id: 'app-project',
  state: (): SkillsState => ({
    menuIds: undefined,
    getUserSkillsList: [],
  }),
  getters: {
    getMenuIds(): string[] | undefined {
      return this.menuIds;
    },
    getProjectUserList(): [] {
      return this.getUserSkillsList;
    },
  },
  actions: {
    // sync
    setMenuIds(list: string[]) {
      this.menuIds = list;
    },
    // async
    async setProjectUserList() {
      this.getUserSkillsList = await getSkills();
      return this.getUserSkillsList;
    },
  },
});

export function useProjectStoreWithOut() {
  return useProjectStore(store);
}
