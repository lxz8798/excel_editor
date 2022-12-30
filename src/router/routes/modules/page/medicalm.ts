import type { AppRouteModule } from '/@/router/types';
import { LAYOUT, getParentLayout } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const medicalRoutes: AppRouteModule = {
  path: '/medical',
  name: 'Medical',
  component: LAYOUT,
  meta: {
    menuId: 3,
    orderNo: 2000,
    icon: 'map:doctor',
    title: t('routes.demo.menu.medical'),
  },
  children: [
    {
      path: 'category',
      name: 'Medical_Category',
      meta: {
        menuId: 3,
        title: t('routes.demo.menu.category'),
      },
      component: getParentLayout('Medical_Category'),
      children: [],
      // component: () => import('/@/views/catalogue/cate/index.vue'),
    },
    {
      path: 'technology',
      name: 'Medical_Technology',
      meta: {
        menuId: 3,
        title: t('routes.demo.menu.technology'),
      },
      component: getParentLayout('Medical_Technology'),
      children: [],
      // component: () => import('/@/views/catalogue/technology/index.vue'),
    },
    {
      path: 'form',
      name: 'Medical_Form',
      meta: {
        menuId: 3,
        title: t('routes.demo.menu.form'),
      },
      component: getParentLayout('Medical_Form'),
      redirect: '/medical/form/1',
      children: [
        {
          path: '1',
          name: '医学工程-XXX地层性质表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '医学工程-XXX地层性质表单',
          },
        },
        {
          path: '2',
          name: '医学工程-XXX材料性质表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '医学工程-XXX材料性质表单',
          },
        },
        {
          path: '3',
          name: '医学工程-XXX体系性能表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '医学工程-XXX体系性能表单',
          },
        },
        {
          path: '4',
          name: '医学工程-XXX工艺性行表单和应用效果性状表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '医学工程-XXX工艺性行表单和应用效果性状表单',
          },
        },
        {
          path: '5',
          name: '医学工程-XXX评价价格表单',
          component: () => import('/@/views/catalogue/form/template.vue'),
          meta: {
            id: '0',
            title: '医学工程-XXX评价价格表单',
          },
        },
      ],
    },
  ],
};

export default medicalRoutes;
