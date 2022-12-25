import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const medicalmRoutes: AppRouteModule = {
  path: '/medicalm',
  name: 'Medicalm',
  component: LAYOUT,
  meta: {
    menuId: 3,
    orderNo: 2000,
    icon: 'map:doctor',
    title: t('routes.demo.menu.medicalm'),
  },
  children: [],
};

export default medicalmRoutes;
