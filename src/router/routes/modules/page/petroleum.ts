import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const petroleumRoutes: AppRouteModule = {
  path: '/petroleum',
  name: 'Petroleum',
  component: LAYOUT,
  meta: {
    menuId: 4,
    orderNo: 2000,
    icon: 'material-symbols:oil-barrel-outline',
    title: t('routes.demo.menu.petroleum'),
  },
  children: [],
};

export default petroleumRoutes;
