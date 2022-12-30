import type { AppRouteModule } from '/@/router/types';
import { getParentLayout, LAYOUT } from "/@/router/constant";
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
  children: [
    {
      path: 'category',
      name: 'Architecture_Category',
      meta: {
        menuId: 1,
        title: t('routes.demo.menu.category'),
      },
      component: getParentLayout('Architecture_Category'),
    },
    {
      path: 'technology',
      name: 'Architecture_Technology',
      meta: {
        menuId: 1,
        title: t('routes.demo.menu.technology'),
      },
      component: getParentLayout('Architecture_Technology'),
    },
    {
      path: 'form',
      name: 'Architecture_Form',
      meta: {
        menuId: 1,
        title: t('routes.demo.menu.form'),
      },
      component: getParentLayout('Architecture_Form'),
      redirect: '/architecture/form/1',
      children: [
        {
          path: '1',
          name: '建筑工程-XXX地层性质表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '建筑工程-XXX地层性质表单',
          },
        },
        {
          path: '2',
          name: '建筑工程-XXX材料性质表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '建筑工程-XXX材料性质表单',
          },
        },
        {
          path: '3',
          name: '建筑工程-XXX体系性能表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '建筑工程-XXX体系性能表单',
          },
        },
        {
          path: '4',
          name: '建筑工程-XXX工艺性行表单和应用效果性状表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '建筑工程-XXX工艺性行表单和应用效果性状表单',
          },
        },
        {
          path: '5',
          name: '建筑工程-XXX评价价格表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '建筑工程-XXX评价价格表单',
          },
        },
      ],
    },
  ],
};

export default architectureRoutes;
