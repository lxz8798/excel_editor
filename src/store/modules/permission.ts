import type { AppRouteRecordRaw, Menu } from '/@/router/types';
import { router } from '/@/router';
import { getParentLayout, LAYOUT } from '/@/router/constant';

import { defineStore } from 'pinia';
import { store } from '/@/store';
import { t, useI18n } from '/@/hooks/web/useI18n';
import { useUserStore } from './user';

import { useAppStoreWithOut } from './app';
import { toRaw } from 'vue';
import { transformObjToRoute, flatMultiLevelRoutes } from '/@/router/helper/routeHelper';
import { transformRouteToMenu } from '/@/router/helper/menuHelper';

import projectSetting from '/@/settings/projectSetting';

import { PermissionModeEnum } from '/@/enums/appEnum';

import { asyncRoutes } from '/@/router/routes';
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';

import { filter } from '/@/utils/helper/treeHelper';

import { getMenuList, getMenuChildren } from '/@/api/sys/menu';
import { getPermCode } from '/@/api/sys/user';

import { useMessage } from '/@/hooks/web/useMessage';
import { PageEnum } from '/@/enums/pageEnum';

interface PermissionState {
  // Permission code list
  // 权限代码列表
  permCodeList: string[] | number[];
  // Whether the route has been dynamically added
  // 路由是否动态添加
  isDynamicAddedRoute: boolean;
  // To trigger a menu update
  // 触发菜单更新
  lastBuildMenuTime: number;
  // Backstage menu list
  // 后台菜单列表
  backMenuList: Menu[];
  // 菜单列表
  frontMenuList: Menu[];
  addMenuShowCategory: boolean;
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    // 权限代码列表
    permCodeList: [],
    // Whether the route has been dynamically added
    // 路由是否动态添加
    isDynamicAddedRoute: false,
    // To trigger a menu update
    // 触发菜单更新
    lastBuildMenuTime: 0,
    // Backstage menu list
    // 后台菜单列表
    backMenuList: [],
    // menu List
    // 菜单列表
    frontMenuList: [],
    addMenuShowCategory: false,
  }),
  getters: {
    getPermCodeList(): string[] | number[] {
      return this.permCodeList;
    },
    getBackMenuList(): Menu[] {
      return this.backMenuList;
    },
    getFrontMenuList(): Menu[] {
      return this.frontMenuList;
    },
    getLastBuildMenuTime(): number {
      return this.lastBuildMenuTime;
    },
    getIsDynamicAddedRoute(): boolean {
      return this.isDynamicAddedRoute;
    },
    getAddMenuShowCategory(): boolean {
      return this.addMenuShowCategory;
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList;
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list;
      list?.length > 0 && this.setLastBuildMenuTime();
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list;
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime();
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added;
    },
    resetState(): void {
      this.isDynamicAddedRoute = false;
      this.permCodeList = [];
      this.backMenuList = [];
      this.lastBuildMenuTime = 0;
    },
    setAddMenuShowCategory(flag) {
      this.addMenuShowCategory = flag;
    },
    async changePermissionCode() {
      const codeList = await getPermCode();
      this.setPermCodeList(codeList);
    },

    // 构建路由
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      const { t } = useI18n();
      const userStore = useUserStore();
      const appStore = useAppStoreWithOut();

      let routes: AppRouteRecordRaw[] = [];
      const roleList = toRaw(userStore.getRoleList) || [];
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig;
      // 路由过滤器 在 函数filter 作为回调传入遍历使用
      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // 抽出角色
        const { roles } = meta || {};
        if (!roles) return true;
        // 进行角色权限判断
        return roleList.some((role) => roles.includes(role));
      };

      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // ignoreRoute 为true 则路由仅用于菜单生成，不会在实际的路由表中出现
        const { ignoreRoute } = meta || {};
        // arr.filter 返回 true 表示该元素通过测试
        return !ignoreRoute;
      };

      /**
       * @description 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return;
        let homePath: string = userStore.getUserInfo.homePath || PageEnum.BASE_HOME;
        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/';
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route;
            const currentPath = path.startsWith('/') ? path : parentPath + path;
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string;
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true });
                throw new Error('end');
              }
            }
            children && children.length > 0 && patcher(children, currentPath);
          });
        }

        try {
          patcher(routes);
        } catch (e) {
          // 已处理完毕跳出循环
        }
        return;
      };
      switch (permissionMode) {
        // 角色权限
        case PermissionModeEnum.ROLE:
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由根据角色权限过滤
          routes = routes.filter(routeFilter);
          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        // 路由映射， 默认进入该case
        case PermissionModeEnum.ROUTE_MAPPING:
          // getMenuList().then((menu) => {
          //   menu.forEach((m) => {
          //     const _obj = {
          //       path: m.path,
          //       name: m.name,
          //       menuId: m.menuId,
          //       orderNo: m.orderNo,
          //       component: 'LAYOUT',
          //       meta: {
          //         id: m.menuId,
          //         title: m.title,
          //       },
          //       children: [],
          //     };
          //     router.addRoute(_obj);
          //   });
          // });
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由再次根据角色权限过滤
          routes = routes.filter(routeFilter);
          // 将路由转换成菜单
          const menuList = transformRouteToMenu(routes, true);
          // 移除掉 ignoreRoute: true 的路由 非一级路由
          routes = filter(routes, routeRemoveIgnoreFilter);
          // 移除掉 ignoreRoute: true 的路由 一级路由；
          routes = routes.filter(routeRemoveIgnoreFilter);
          const range = ['/medical', '/architecture', '/mineral', '/petroleum'];
          menuList.forEach((r) => {
            if (range.includes(r.path)) {
              r.children?.map((i) => {
                if (i.name === 'routes.demo.menu.form') {
                  getMenuChildren({ menuId: i.meta.menuId }).then((res) => {
                    const _first = res[0];
                    if (i.menuId == _first.menuId) {
                      for (let _index = 0; _index < i.children.length; _index++) {
                        let _id = res[_index].id, _title = i.children[_index].title.split('-')[0] + '-' + res[_index].templateTitle;

                        i.children[_index]['id'] = _id;
                        i.children[_index]['name'] = _title;
                        i.children[_index]['title'] = _title;
                        i.children[_index]['menuId'] = i.meta.menuId;

                        i.children[_index]['meta'].id = _id;
                        i.children[_index]['meta'].title = _title;
                        i.children[_index]['meta']._index = _index;
                        // i.children[_index]['path'] = i.children[_index]['path'].replace(/\d/, _id);
                      }
                    }
                  });
                  return i;
                }
              });
            }
          });
          // 对菜单进行排序
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });
          // 设置菜单列表
          this.setFrontMenuList(menuList);
          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        //  如果确定不需要做后台动态权限，请在下方注释整个判断
        case PermissionModeEnum.BACK:
          const { createMessage } = useMessage();
          const accountRoutes = {
            path: '/account',
            name: 'AccountPage',
            component: 'LAYOUT',
            redirect: '/account/center',
            meta: {
              orderNo: 0,
              icon: 'ion:aperture-outline',
              title: t('routes.demo.page.account'),
            },
            children: [
              {
                path: 'center',
                name: 'AccountCenterPage',
                component: '/demo/page/account/center/index.vue',
                meta: {
                  title: t('routes.demo.page.accountCenter'),
                },
              },
              {
                path: 'setting',
                name: 'AccountSettingPage',
                component: '/demo/page/account/setting/index.vue',
                meta: {
                  title: t('routes.demo.page.accountSetting'),
                },
              },
            ],
          };
          const systemRoutes = {
            path: '/system',
            name: 'System',
            component: 'LAYOUT',
            meta: {
              orderNo: 99,
              icon: 'ion:settings-outline',
              title: t('routes.demo.system.moduleName'),
            },
            children: [
              {
                path: 'account',
                name: 'AccountManagement',
                meta: {
                  title: t('routes.demo.system.account'),
                  ignoreKeepAlive: false,
                },
                component: '/demo/system/account/index.vue',
              },
              {
                path: 'account_detail/:id',
                name: 'AccountDetail',
                meta: {
                  hideMenu: true,
                  title: t('routes.demo.system.account_detail'),
                  ignoreKeepAlive: true,
                  showMenu: false,
                  currentActiveMenu: '/system/account',
                },
                component: '/demo/system/account/AccountDetail.vue',
              },
              {
                path: 'team',
                name: 'TeamManagement',
                meta: {
                  title: t('routes.demo.system.team'),
                  ignoreKeepAlive: false,
                },
                component: '/demo/system/team/index.vue',
              },
              {
                path: 'project',
                name: 'ProjectManagement',
                meta: {
                  title: t('routes.demo.system.project'),
                  ignoreKeepAlive: false,
                },
                component: '/demo/system/project/index.vue',
              },
              {
                path: 'skills',
                name: 'SkillsManagement',
                meta: {
                  title: t('routes.demo.system.skills'),
                  ignoreKeepAlive: false,
                },
                component: '/demo/system/skills/index.vue',
              },
              {
                path: 'menu',
                name: 'MenuManagement',
                meta: {
                  title: t('routes.demo.system.menu'),
                  ignoreKeepAlive: true,
                },
                component: '/demo/system/menu/index.vue',
              },
              // {
              //   path: 'changePassword',
              //   name: 'ChangePassword',
              //   meta: {
              //     title: t('routes.demo.system.password'),
              //     ignoreKeepAlive: true,
              //   },
              //   component: '/demo/system/password/index.vue',
              // },
            ],
          };
          createMessage.loading({
            content: t('sys.app.menuLoading'),
            duration: 1,
          });
          // !Simulate to obtain permission codes from the background,
          // 模拟从后台获取权限码，
          // this function may only need to be executed once, and the actual project can be put at the right time by itself
          // 这个功能可能只需要执行一次，实际项目可以自己放在合适的时间
          let routeList: AppRouteRecordRaw[] = [];
          try {
            // await this.changePermissionCode();
            routeList = (await getMenuList()) as AppRouteRecordRaw[];
          } catch (error) {
            console.error(error);
          }
          // Dynamically introduce components
          // 动态引入组件
          routeList = transformObjToRoute([accountRoutes, ...routeList, systemRoutes]);
          //  Background routing to menu structure
          //  后台路由到菜单结构
          const backMenuList = transformRouteToMenu(routeList);
          this.setBackMenuList(backMenuList);

          // remove meta.ignoreRoute item
          // 删除 meta.ignoreRoute 项
          routeList = filter(routeList, routeRemoveIgnoreFilter);
          routeList = routeList.filter(routeRemoveIgnoreFilter);

          routeList = flatMultiLevelRoutes(routeList);
          routes = [PAGE_NOT_FOUND_ROUTE, ...routeList];
          break;
      }

      routes.push(ERROR_LOG_ROUTE);
      patchHomeAffix(routes);
      return routes;
    },
  },
});

// Need to be used outside the setup
// 需要在设置之外使用
export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
