import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getTeams } from '/@/api/sys/team';
// import { ProjectMembersModel } from '/@/api/sys/model/projectModel';
interface TeamsState {
  getUserTeamsList: [];
}

export const useTeamsStore = defineStore({
  id: 'app-teams',
  state: (): TeamsState => ({
    getUserTeamsList: [],
  }),
  getters: {
    getProjectUserList(): [] {
      return this.getUserTeamsList;
    },
  },
  actions: {
    // sync
    // async
    async setProjectUserList() {
      this.getUserTeamsList = await getTeams();
      return this.getUserTeamsList;
    },
  },
});

export function useTeamsStoreWithOut() {
  return useTeamsStore(store);
}
