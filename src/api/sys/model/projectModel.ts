export interface ProjectItemModel {
  icon?: string;
  sort?: number | string;
  label: object | string;
  value: object | string;
}

export interface ProjectParamsModel {
  userId?: '';
  name?: '';
  contractIds?: object;
  inviteUserId?: object;
  projectAdminId?: string | number | undefined;
}

export interface ProjectMembersModel {
  id: string | number;
  userId: string | number;
  activeFlag: boolean | null;
  projectAdminFlag: boolean | null;
  expireTime: string;
  parentId: string;
  createTime: string;
}
