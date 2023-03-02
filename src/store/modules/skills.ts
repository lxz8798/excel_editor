import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getAllSkills } from '/@/api/sys/skills';
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
    getSkillsUserList(): [] {
      return this.getUserSkillsList;
    },
  },
  actions: {
    // sync
    // async
    async setSkillsUserList() {
      this.getUserSkillsList = await getAllSkills();
      return this.getUserSkillsList;
    },
  },
});

export function useSkillsStoreWithOut() {
  return useSkillsStore(store);
}
