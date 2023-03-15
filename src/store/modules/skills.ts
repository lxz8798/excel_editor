import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getAllSkills, getSkills } from '/@/api/sys/skills';
interface SkillsState {
  menuIds?: string[];
  getUserSkillsList: [];
  getSkillsList: [];
}

export const useSkillsStore = defineStore({
  id: 'app-skills',
  state: (): SkillsState => ({
    userSkillsList: [],
    skillsList: [],
  }),
  getters: {
    getSkillsUserList(): [] {
      return this.userSkillsList;
    },
    getSkillsList(): [] {
      return this.skillsList;
    },
  },
  actions: {
    // sync
    // async
    async setSkillsUserList() {
      this.userSkillsList = await getAllSkills();
      return this.userSkillsList.map((i, k) => i['value'] = k);
    },
    async setSkillsList(params) {
      this.skillsList = await getSkills(params);
      return this.skillsList;
    },
  },
});

export function useSkillsStoreWithOut() {
  return useSkillsStore(store);
}
