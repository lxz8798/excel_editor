import type { AppRouteModule } from '/@/router/types';
// 其他被注释的地方可能会用到的getParentLayout
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const permission: AppRouteModule = {
  path: '/form',
  name: 'Form',
  component: LAYOUT,
  redirect: '/form/form1',
  meta: {
    orderNo: 2000,
    icon: 'ion:menu-outline',
    title: t('routes.demo.level.level'),
  },

  children: [
    {
      path: 'formTest1',
      name: 'FormTest1',
      // component: getParentLayout('form1'),
      component: () => import('/@/views/catalogue/form/form1.vue'),
      meta: {
        title: '表单1',
      },
      children: [
        // {
        //   path: 'menu1-1',
        //   name: 'Menu11Demo',
        //   component: getParentLayout('Menu11Demo'),
        //   meta: {
        //     title: 'Menu1-1',
        //   },
        //   redirect: '/level/menu1/menu1-1/menu1-1-1',
        //   children: [
        //     {
        //       path: 'menu1-1-1',
        //       name: 'Menu111Demo',
        //       component: () => import('/@/views/demo/level/Menu111.vue'),
        //       meta: {
        //         title: 'Menu111',
        //       },
        //     },
        //   ],
        // },
        // {
        //   path: 'menu1-2',
        //   name: 'Menu12Demo',
        //   component: () => import('/@/views/demo/level/Menu12.vue'),
        //   meta: {
        //     title: 'Menu1-2',
        //   },
        // },
      ],
    },
    {
      path: 'formTest2',
      name: 'FormTest2',
      component: () => import('/@/views/catalogue/form/form2.vue'),
      meta: {
        title: '表单2',
        // ignoreKeepAlive: true,
      },
    },
    {
      path: 'form1/:id',
      name: 'Form1',
      component: () => import('/@/views/catalogue/form/1601254436653510657.vue'),
      meta: {
        id: '1601254436653510657',
        title: '颗粒检测报告',
        // ignoreKeepAlive: true,
      },
    },
    {
      path: 'form2/:id',
      name: 'Form2',
      component: () => import('/@/views/catalogue/form/1601254692766101506.vue'),
      meta: {
        id: '1601254692766101506',
        title: '检测报告-智能胶',
        // ignoreKeepAlive: true,
      },
    },
    {
      path: 'form3/:id',
      name: 'Form3',
      component: () => import('/@/views/catalogue/form/1601257276864323585.vue'),
      meta: {
        id: '1601257276864323585',
        title: '检测报告-堵漏剂',
        // ignoreKeepAlive: true,
      },
    },
    // {
    //   path: 'form4',
    //   name: 'Form4',
    //   component: () => import('/@/views/catalogue/form/1601257505999151105.vue'),
    //   meta: {
    //     id: '1601257505999151105',
    //     title: '检测报告-毒性剂',
    //     // ignoreKeepAlive: true,
    //   },
    // },
    {
      path: 'form5/:id',
      name: 'Form5',
      component: () => import('/@/views/catalogue/form/1601258053175386113.vue'),
      meta: {
        id: '1601258053175386113',
        title: '检测报告-空气质量监测',
        // ignoreKeepAlive: true,
      },
    },
    {
      path: 'form6/:id',
      name: 'Form6',
      component: () => import('/@/views/catalogue/form/1601241860913840129.vue'),
      meta: {
        id: '1601241860913840129',
        title: '核酸检测报告-1',
        // ignoreKeepAlive: true,
      },
    },
  ],
};

export default permission;
