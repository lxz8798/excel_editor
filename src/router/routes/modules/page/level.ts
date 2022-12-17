import type { AppRouteModule } from '/@/router/types';
// 其他被注释的地方可能会用到的getParentLayout
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
const permission: AppRouteModule = {
  path: '/form',
  name: 'Form',
  component: LAYOUT,
  meta: {
    orderNo: 2000,
    icon: 'ion:menu-outline',
    title: t('routes.demo.level.level'),
  },

  children: [
    // {
    //   path: 'template/1',
    //   name: '天然气井修井用囊层剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/template.vue'),
    //   meta: {
    //     id: 1,
    //     title: '天然气井修井用囊层剂室内检测报告单',
    //   },
    // },
    // {
    //   path: 'template/2',
    //   name: '天然气井修井用绒毛剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/template.vue'),
    //   meta: {
    //     id: 2,
    //     title: '天然气井修井用绒毛剂室内检测报告单',
    //   },
    // },
    // {
    //   path: 'template/3',
    //   name: '天然气修井用囊核剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/template.vue'),
    //   meta: {
    //     id: 3,
    //     title: '天然气修井用囊核剂室内检测报告单',
    //   },
    // },
    // {
    //   path: 'template/4',
    //   name: '天然气修井用囊膜剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/template.vue'),
    //   meta: {
    //     id: 4,
    //     title: '天然气修井用囊膜剂室内检测报告单',
    //   },
    // },
    // {
    //   path: 'template/5',
    //   name: '天然气井绒囊修井液室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/template.vue'),
    //   meta: {
    //     id: 5,
    //     title: '天然气井绒囊修井液室内检测报告单',
    //   },
    // },
  ],
};

export default permission;
