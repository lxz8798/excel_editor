import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getSkills } from '/@/api/sys/skills';
// import { ProjectMembersModel } from '/@/api/sys/model/projectModel';
interface SkillsState {
  menuIds?: string[];
  getUserSkillsList: [];
}

export const useSkillsStore = defineStore({
  id: 'app-skills',
  state: (): SkillsState => ({
    getUserSkillsList: [],
  }),
  getters: {
    getProjectUserList(): [] {
      return this.getUserSkillsList;
    },
  },
  actions: {
    // sync
    // async
    async setProjectUserList() {
      this.getUserSkillsList = await getSkills();
      return this.getUserSkillsList;
    },
  },
});

export function useSkillsStoreWithOut() {
  return useSkillsStore(store);
}
