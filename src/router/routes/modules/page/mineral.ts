import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const mineralRoutes: AppRouteModule = {
  path: '/mineral',
  name: 'Mineral',
  component: LAYOUT,
  meta: {
    menuId: 2,
    orderNo: 2000,
    icon: 'map:doctor',
    title: t('routes.demo.menu.mineral'),
  },
  children: [],
};

export default mineralRoutes;
