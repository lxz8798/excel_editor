import { h } from 'vue';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { Icon } from '/@/components/Icon';
export const columns: BasicColumn[] = [
  {
    title: '图标',
    dataIndex: 'icon',
    width: 100,
    customRender: ({ record }) => {
      return h(Icon, { icon: record['icon'] });
    },
  },
  {
    title: '团队名称',
    dataIndex: 'label',
  },
  {
    title: '团队成员',
    dataIndex: 'label',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
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
    field: 'icon',
    label: '图标',
    component: 'IconPicker',
    required: true,
  },
  {
    field: 'label',
    label: '团队名称',
    component: 'Input',
    rules: [
      {
        required: true,
        message: '请输入团队名称',
      },
    ],
  },
];

export const teamFormSchema: BasicColumn[] = [
  {
    title: '团队名称',
    dataIndex: 'name',
  },
  {
    title: '团队',
    dataIndex: 'skills',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
];
