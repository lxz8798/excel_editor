import type { UserInfo } from '/#/store';
import type { ErrorMessageMode } from '/#/axios';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum';
import { ROLES_KEY, TOKEN_KEY, USER_INFO_KEY } from '/@/enums/cacheEnum';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { GetUserInfoModel, LoginParams, registerModel } from '/@/api/sys/model/userModel';
import { AccountListGetResultModel } from '/@/api/demo/model/systemModel';
import {
  getUserInfo,
  loginApi,
  regUser,
  deleteUser,
  activeUser,
  getUserTagList,
  addUserTag,
  deleteUserTag,
} from '/@/api/sys/user';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
import { router } from '/@/router';
import { usePermissionStore } from '/@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
import { isArray } from '/@/utils/is';
import { h, toRaw } from 'vue';
import { getTeams, delTeam } from '/@/api/sys/team';
import { getSkills, delSkills } from '/@/api/sys/skills';
import { getOwnerProjectList, addProject } from '/@/api/sys/project';
import { getAccountList } from '/@/api/demo/system';
import { haveData } from '/@/api/demo/form';
interface UserState {
  userInfo: Nullable<UserInfo>;
  userAvatar?: string;
  token?: string;
  roleList: RoleEnum[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;
  gotoDocId: string | number;
  templateUpDate: number;
  userList: [];
  userTagsList: [];
  projectList: [];
  teamList: [];
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // user info
    userInfo: null,
    userAvatar: '',
    // token
    token: undefined,
    // roleList
    roleList: [],
    // Whether the login expired
    sessionTimeout: false,
    // Last fetch time
    lastUpdateTime: 0,
    gotoDocId: '',
    templateUpDate: 0,
    userList: [],
    userTagsList: [],
    projectList: [],
    teamList: [],
  }),
  getters: {
    getGotoDocID(): string | number {
      return this.gotoDocId;
    },
    getUserInfo(): UserInfo {
      return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getUserAvatar(): string | undefined {
      return this.userAvatar;
    },
    getToken(): string {
      return this.token || getAuthCache<string>(TOKEN_KEY);
    },
    getRoleList(): RoleEnum[] {
      return this.roleList.length > 0 ? this.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    },
    getSessionTimeout(): boolean {
      return !!this.sessionTimeout;
    },
    getLastUpdateTime(): number {
      return this.lastUpdateTime;
    },
    getTemplateUpdate(): number {
      return this.templateUpDate;
    },
    getUserTagsList(): [] {
      return this.userTagsList;
    },
    getProjectList(): [] {
      return this.projectList;
    },
    getTeamList(): [] {
      return this.teamList;
    },
    getUserList(): [] {
      const noNeeded = ['admin', this.userInfo['userName'] !== 'admin' ? this.userInfo['userName'] : null];
      // if (!this.userList.length) return;
      const _list = toRaw(this.userList).filter((i) => !noNeeded.includes(i['name']));
      return _list;
    },
  },
  actions: {
    setGotoDocID(type: string | number) {
      this.gotoDocId = type;
    },
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setAuthCache(TOKEN_KEY, info);
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setUserInfo(info: UserInfo | null) {
      this.userInfo = info;
      this.lastUpdateTime = new Date().getTime();
      setAuthCache(USER_INFO_KEY, info);
    },
    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
      this.sessionTimeout = false;
    },
    setTemplateUpdate(number: number) {
      this.templateUpDate = number;
    },
    setUserAvatar(str: string) {
      this.userAvatar = str;
    },
    /**
     * @description: login
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
      },
    ): Promise<GetUserInfoModel | null> {
      try {
        // const { goHome = true, mode, ...loginParams } = params;
        const { ...loginParams } = params;
        const data = await loginApi(loginParams);
        const { token } = data;
        // save token
        this.setToken(token);
        return this.afterLoginAction(true, params['goHome']);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async setUserList(params): Promise<AccountListGetResultModel[] | null> {
      const _userList = await getAccountList(params);
      this.userList = _userList['records'];
      return this.userList;
    },
    async afterLoginAction(goHome?: boolean, path?: string): Promise<GetUserInfoModel | null> {
      if (!this.getToken) return null;
      // get user info
      const userInfo = await this.getUserInfoAction();
      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        this.setSessionTimeout(false);
      } else {
        const permissionStore = usePermissionStore();
        if (!permissionStore.isDynamicAddedRoute) {
          router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
          permissionStore.setDynamicAddedRoute(true);
        }
        // ??????????????????????????????hotPath
        userInfo['homePath'] = path;
        goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
      }
      return userInfo;
    },
    async getUserInfoAction(): Promise<UserInfo | null> {
      if (!this.getToken) return null;
      // const userStore = useUserStore();
      const userInfo = await getUserInfo();
      const { roles = [] } = userInfo;
      if (isArray(roles)) {
        const roleList = roles.map((item) => item.value) as RoleEnum[];
        this.setRoleList(roleList);
      } else {
        userInfo.roles = [];
        this.setRoleList([]);
      }
      this.setUserInfo(userInfo);
      return userInfo;
    },
    /**
     * @description: logout
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          // await doLogout();
        } catch {
          console.log('??????Token??????');
        }
      }
      this.setToken(undefined);
      this.setSessionTimeout(false);
      this.setUserInfo(null);
      goLogin && router.push(PageEnum.BASE_LOGIN);
    },
    async setActiveUser(params: registerModel) {
      const res = await activeUser(params);
      return res;
    },
    async regUser(params: registerModel) {
      const { createMessage } = useMessage();
      params['name'] = params.account;
      delete params['account'];
      const res = await regUser(params);
      createMessage.success(res);
      return Promise.resolve(res);
    },
    async deleteUser(params: object) {
      const res = await deleteUser(params);
      return res;
    },
    async setUserTagsList(params: object) {
      this.userTagsList = await getUserTagList(params);
      this.userTagsList.map((i) => {
        i.isShow = false;
        return i;
      });
    },
    // ????????????
    async setUserTag(params: object) {
      return await addUserTag(params);
    },
    async deleteUserTag(params: object) {
      return await deleteUserTag(params);
    },
    // ??????????????????
    async setTeamList(params) {
      this.teamList = await getTeams(params);
      console.log(this.teamList, 'this.teamList');
    },
    // ????????????
    async delTeamItem(params) {
      return await delTeam(params);
    },
    // ????????????
    async delSkillsItem(params) {
      return await delSkills(params);
    },
    // ??????????????????
    async setProjectList(params) {
      return await getOwnerProjectList(params);
    },
    // ????????????
    async addProject(params) {
      return await addProject(params);
    },
    // ????????????
    async delProjectItem(params) {
      return await delTeam(params);
    },
    /**
     * @description: Confirm before logging out
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        title: () => h('span', t('sys.app.logoutTip')),
        content: () => h('span', t('sys.app.logoutMessage')),
        onOk: async () => {
          await this.logout(true);
        },
      });
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store);
}
