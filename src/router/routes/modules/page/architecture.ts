import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const architectureRoutes: AppRouteModule = {
  path: '/architecture',
  name: 'Architecture',
  component: LAYOUT,
  meta: {
    menuId: 1,
    orderNo: 2000,
    icon: 'ic:twotone-architecture',
    title: t('routes.demo.menu.architecture'),
  },
  children: [],
};

export default architectureRoutes;
