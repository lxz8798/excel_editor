export interface TeamParams {
  userId?: string;
  pageSize?: number | string;
  page?: number | string;
  label?: string;
}
export interface TeamItemModel {
  icon: string;
  sort?: number | string;
  label: object | string;
  value?: object | string;
}
