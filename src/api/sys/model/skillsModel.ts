export interface SkillsParams {
  userId?: string;
  pageSize?: number | string;
  page?: number | string;
  label?: string;
}
export interface SkillsItemModel {
  icon: string;
  sort?: number | string;
  label: object | string;
  value?: object | string;
}
