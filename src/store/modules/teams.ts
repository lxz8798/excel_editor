import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getAllTeams } from '/@/api/sys/team';
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
    getTeamsUserList(): [] {
      return this.getUserTeamsList;
    },
  },
  actions: {
    // sync
    // async
    async setTeamsUserList() {
      this.getUserTeamsList = await getAllTeams();
      return this.getUserTeamsList.map((i, k) => i['value'] = k);
    },
  },
});

export function useTeamsStoreWithOut() {
  return useTeamsStore(store);
}
