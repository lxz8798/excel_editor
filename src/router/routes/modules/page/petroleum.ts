import type { AppRouteModule } from '/@/router/types';
import { getParentLayout, LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const petroleumRoutes: AppRouteModule = {
  path: '/petroleum',
  name: 'Petroleum',
  component: LAYOUT,
  meta: {
    menuId: 4,
    orderNo: 10,
    icon: 'material-symbols:oil-barrel-outline',
    title: t('routes.demo.menu.petroleum'),
  },
  children: [
    {
      path: 'category',
      name: 'Petroleum_Category',
      meta: {
        menuId: 4,
        title: t('routes.demo.menu.category'),
      },
      component: getParentLayout('Petroleum_Category'),
      children: [],
      // component: () => import('/@/views/catalogue/cate/index.vue'),
    },
    {
      path: 'technology',
      name: 'Petroleum_Technology',
      meta: {
        menuId: 4,
        title: t('routes.demo.menu.technology'),
      },
      component: getParentLayout('Petroleum_Technology'),
      children: [],
      // component: () => import('/@/views/catalogue/technology/index.vue'),
    },
    {
      path: 'form',
      name: 'Petroleum_Form',
      meta: {
        menuId: 4,
        title: t('routes.demo.menu.form'),
      },
      component: getParentLayout('Petroleum_Form'),
      redirect: '/petroleum/form/1',
      children: [
        {
          path: '1',
          name: '石油工程-地层性质表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '石油工程-地层性质表单',
          },
        },
        {
          path: '2',
          name: '石油工程-材料性质表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '石油工程-材料性质表单',
          },
        },
        {
          path: '3',
          name: '石油工程-体系性能表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '石油工程-体系性能表单',
          },
        },
        {
          path: '4',
          name: '石油工程-工艺性行表单和应用效果性状表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '石油工程-工艺性行表单和应用效果性状表单',
          },
        },
        {
          path: '5',
          name: '石油工程-评价价格表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '石油工程-评价价格表单',
          },
        },
      ],
    },
  ],
};

export default petroleumRoutes;
