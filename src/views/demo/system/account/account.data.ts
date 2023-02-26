import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '用户名',
    dataIndex: 'name',
    width: 160,
  },
  {
    title: '真实名字',
    dataIndex: 'realName',
    width: 160,
  },
  {
    title: '所属团队',
    dataIndex: 'userTeams',
  },
  {
    title: '专业技能',
    dataIndex: 'userSkills',
  },
  {
    title: '到期时间',
    dataIndex: 'DaysLeft',
    width: 120,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'account',
    label: '用户名',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'nickname',
    label: '昵称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const accountFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '用户名',
    component: 'Input',
    rules: [
      {
        required: true,
        message: '请输入用户名',
      },
      // {
      //   validator(_, value) {
      //     return new Promise((resolve, reject) => {
      //       isAccountExist(value)
      //         .then(() => resolve())
      //         .catch((err) => {
      //           reject(err.message || '验证失败');
      //         });
      //     });
      //   },
      // },
    ],
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true,
  },
  {
    field: 'realName',
    label: '真实名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'teamName',
    label: '所属团队',
    component: 'Select',
    // componentProps: {
    //   mode: 'tags',
    // },
    componentProps: ({ formModel, formActionType }) => {
      console.log(formModel);
      console.log(formActionType);
      return {
        mode: 'tags',
      };
    },
  },
  {
    field: 'skills',
    label: '专业技能',
    component: 'Select',
  },
  {
    field: 'expiration',
    label: '到期时间',
    component: 'DatePicker',
    componentProps: ({ formModel, formActionType }) => {
      return {
        style: 'width: 100%',
      };
    },
  },
  {
    field: 'phone',
    label: '手机号',
    component: 'InputNumber',
  },
  // {
  //   label: '角色',
  //   field: 'role',
  //   component: 'ApiSelect',
  //   componentProps: {
  //     api: getAllRoleList,
  //     labelField: 'roleName',
  //     valueField: 'roleValue',
  //   },
  //   required: true,
  // },
  // {
  //   field: 'dept',
  //   label: '所属部门',
  //   component: 'TreeSelect',
  //   componentProps: {
  //     fieldNames: {
  //       label: 'deptName',
  //       key: 'id',
  //       value: 'id',
  //     },
  //     getPopupContainer: () => document.body,
  //   },
  //   required: true,
  // },
  {
    label: '邮箱',
    field: 'email',
    component: 'Input',
  },

  {
    label: '备注',
    field: 'remark',
    component: 'InputTextArea',
  },
];

export const teamFormSchema: BasicColumn[] = [
  {
    title: '用户名',
    dataIndex: 'name',
  },
  {
    title: '团队',
    dataIndex: 'team',
  },
  {
    title: '技能',
    dataIndex: 'skills',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
];
