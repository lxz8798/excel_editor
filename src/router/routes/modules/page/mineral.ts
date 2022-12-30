import type { AppRouteModule } from '/@/router/types';
import { getParentLayout, LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const mineralRoutes: AppRouteModule = {
  path: '/mineral',
  name: 'Mineral',
  component: LAYOUT,
  meta: {
    menuId: 2,
    orderNo: 2000,
    icon: 'game-icons:minerals',
    title: t('routes.demo.menu.mineral'),
  },
  children: [
    {
      path: 'category',
      name: 'Mineral_Category',
      meta: {
        menuId: 2,
        title: t('routes.demo.menu.category'),
      },
      component: getParentLayout('Mineral_Category'),
      children: [],
      // component: () => import('/@/views/catalogue/cate/index.vue'),
    },
    {
      path: 'technology',
      name: 'Mineral_Technology',
      meta: {
        menuId: 2,
        title: t('routes.demo.menu.technology'),
      },
      component: getParentLayout('Mineral_Technology'),
      children: [],
      // component: () => import('/@/views/catalogue/technology/index.vue'),
    },
    {
      path: 'form',
      name: 'Mineral_Form',
      meta: {
        menuId: 2,
        title: t('routes.demo.menu.form'),
      },
      component: getParentLayout('Mineral_Form'),
      redirect: '/mineral/form/:id',
      children: [
        {
          path: '1',
          name: '矿业工程-XXX地层性质表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '矿业工程-XXX地层性质表单',
          },
        },
        {
          path: '2',
          name: '矿业工程-XXX材料性质表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '矿业工程-XXX材料性质表单',
          },
        },
        {
          path: '3',
          name: '矿业工程-XXX体系性能表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '矿业工程-XXX体系性能表单',
          },
        },
        {
          path: '4',
          name: '矿业工程-XXX工艺性行表单和应用效果性状表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '矿业工程-XXX工艺性行表单和应用效果性状表单',
          },
        },
        {
          path: '5',
          name: '矿业工程-XXX评价价格表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '矿业工程-XXX评价价格表单',
          },
        },
      ],
    },
  ],
};

export default mineralRoutes;
