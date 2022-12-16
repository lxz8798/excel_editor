import type { AppRouteModule } from '/@/router/types';
// 其他被注释的地方可能会用到的getParentLayout
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const permission: AppRouteModule = {
  path: '/form',
  name: 'Form',
  component: LAYOUT,
  redirect: '/form/template',
  meta: {
    orderNo: 2000,
    icon: 'ion:menu-outline',
    title: t('routes.demo.level.level'),
  },

  children: [
    // {
    //   path: 'formTest1',
    //   name: 'FormTest1',
    //   // component: getParentLayout('form1'),
    //   component: () => import('/@/views/catalogue/form/form1.vue'),
    //   meta: {
    //     title: '表单1',
    //   },
    //   children: [
    //     // {
    //     //   path: 'menu1-1',
    //     //   name: 'Menu11Demo',
    //     //   component: getParentLayout('Menu11Demo'),
    //     //   meta: {
    //     //     title: 'Menu1-1',
    //     //   },
    //     //   redirect: '/level/menu1/menu1-1/menu1-1-1',
    //     //   children: [
    //     //     {
    //     //       path: 'menu1-1-1',
    //     //       name: 'Menu111Demo',
    //     //       component: () => import('/@/views/demo/level/Menu111.vue'),
    //     //       meta: {
    //     //         title: 'Menu111',
    //     //       },
    //     //     },
    //     //   ],
    //     // },
    //     // {
    //     //   path: 'menu1-2',
    //     //   name: 'Menu12Demo',
    //     //   component: () => import('/@/views/demo/level/Menu12.vue'),
    //     //   meta: {
    //     //     title: 'Menu1-2',
    //     //   },
    //     // },
    //   ],
    // },
    // {
    //   path: 'formTest2',
    //   name: 'FormTest2',
    //   component: () => import('/@/views/catalogue/form/form2.vue'),
    //   meta: {
    //     title: '表单2',
    //     // ignoreKeepAlive: true,
    //   },
    // },
    // {
    //   path: 'form1/:id',
    //   name: '天然气井修井用囊层剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/1.vue'),
    //   meta: {
    //     id: '1',
    //     title: '天然气井修井用囊层剂室内检测报告单',
    //     // ignoreKeepAlive: true,
    //   },
    // },
    // {
    //   path: 'tempalte',
    //   name: '天然气井修井用囊层剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/template.vue'),
    //   meta: {
    //     id: '1',
    //     title: '天然气井修井用囊层剂室内检测报告单',
    //     // ignoreKeepAlive: true,
    //   },
    // },
    // {
    //   path: 'form2/:id',
    //   name: '天然气井修井用绒毛剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/2.vue'),
    //   meta: {
    //     id: '2',
    //     title: '天然气井修井用绒毛剂室内检测报告单',
    //     // ignoreKeepAlive: true,
    //   },
    // },
    // {
    //   path: 'form3/:id',
    //   name: '天然气修井用囊核剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/3.vue'),
    //   meta: {
    //     id: '3',
    //     title: '天然气修井用囊核剂室内检测报告单',
    //     // ignoreKeepAlive: true,
    //   },
    // },
    // {
    //   path: 'form4/:id',
    //   name: '天然气修井用囊膜剂室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/4.vue'),
    //   meta: {
    //     id: '4',
    //     title: '天然气修井用囊膜剂室内检测报告单',
    //     // ignoreKeepAlive: true,
    //   },
    // },
    // {
    //   path: 'form5/:id',
    //   name: '天然气井绒囊修井液室内检测报告单',
    //   component: () => import('/@/views/catalogue/form/5.vue'),
    //   meta: {
    //     id: '5',
    //     title: '天然气井绒囊修井液室内检测报告单',
    //     // ignoreKeepAlive: true,
    //   },
    // },
  ],
};

export default permission;
