import type { RouteMeta } from 'vue-router';
export interface RouteItem {
  title: string;
  orderNo: string | number;
  menuId: string | number;
  path: string;
  component: any;
  meta: RouteMeta;
  name?: string;
  alias?: string | string[];
  redirect?: string;
  caseSensitive?: boolean;
  children?: RouteItem[];
}

/**
 * @description: Get menu return value
 */
export type getMenuListResultModel = RouteItem[];
