import type { Router } from 'vue-router';
import { configureDynamicParamsMenu } from '../helper/menuHelper';
import { Menu } from '../types';
import { PermissionModeEnum } from '/@/enums/appEnum';
import { useAppStoreWithOut } from '/@/store/modules/app';
import { usePermissionStoreWithOut } from '/@/store/modules/permission';

export function createParamMenuGuard(router: Router) {
  const permissionStore = usePermissionStoreWithOut();
  router.beforeEach(async (to, _, next) => {
    // const { name: originalName } = to;
    // if (to.fullPath.includes('/form')) {
    //   const formList = await getMenuChildren({ menuId: to.meta.menuId });
    //   let _index = 0;
    //   to.matched[0].children.forEach((m) => {
    //     if (m.name.includes('工程')) {
    //       m.name = originalName.split('-')[0] + '-' + formList[_index].templateTitle;
    //       m.meta.id = formList[_index].id;
    //       m.meta.title = formList[_index].templateTitle || '暂未命名';
    //       m.meta._index = _index;
    //       _index++;
    //     }
    //   });
    // };
    // filter no name route
    if (!to.name) {
      next();
      return;
    }

    // menu has been built.
    if (!permissionStore.getIsDynamicAddedRoute) {
      next();
      return;
    }

    let menus: Menu[] = [];
    if (isBackMode()) {
      menus = permissionStore.getBackMenuList;
    } else if (isRouteMappingMode()) {
      menus = permissionStore.getFrontMenuList;
    }
    menus.forEach((item) => configureDynamicParamsMenu(item, to.params));
    next();
  });
}

const getPermissionMode = () => {
  const appStore = useAppStoreWithOut();
  return appStore.getProjectConfig.permissionMode;
};

const isBackMode = () => {
  return getPermissionMode() === PermissionModeEnum.BACK;
};

const isRouteMappingMode = () => {
  return getPermissionMode() === PermissionModeEnum.ROUTE_MAPPING;
};
