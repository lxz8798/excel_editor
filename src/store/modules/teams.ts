import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getAllTeams, getTeams } from '/@/api/sys/team';
interface TeamsState {
  getUserTeamsList: [];
}

export const useTeamsStore = defineStore({
  id: 'app-teams',
  state: (): TeamsState => ({
    userTeamsList: [],
    teamsList: [],
  }),
  getters: {
    getTeamsUserList(): [] {
      return this.userTeamsList;
    },
    getTeamsList(): [] {
      return this.teamsList;
    },
  },
  actions: {
    // sync
    // async
    async setTeamsUserList() {
      this.userTeamsList = await getAllTeams();
      return this.userTeamsList.map((i, k) => i['value'] = k);
    },
    async setTeamsList(params) {
      this.teamsList = await getTeams(params);
      return this.teamsList;
    },
  },
});

export function useTeamsStoreWithOut() {
  return useTeamsStore(store);
}
