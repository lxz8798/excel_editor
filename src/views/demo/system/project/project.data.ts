import { h, toRaw } from 'vue';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { usePermissionStore } from '/@/store/modules/permission';
import { useProjectStore } from '/@/store/modules/project';
import { getProjectUserList } from '/@/api/sys/project';
import { useMessage } from '/@/hooks/web/useMessage';
import { useUserStore } from '/@/store/modules/user';
import { Option } from "ant-design-vue/es/vc-util/Children/toArray";
const { createMessage } = useMessage();
const projectStore = useProjectStore();
const userStore = useUserStore();
export const columns: BasicColumn[] = [
  {
    title: '项目名称',
    dataIndex: 'name',
  },
  {
    title: '项目长',
    dataIndex: 'leaderName',
    width: 120,
  },
  {
    title: '团队成员',
    dataIndex: 'teamUsers',
    width: 300,
    customRender: ({ record }) => {
      return h('span', record['teamUsers'].map((i) => i['name']).toString());
    },
  },
  {
    title: '到期时间',
    dataIndex: 'targetTime',
    width: 200,
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

export const projectFormSchema: FormSchema[] = [
  {
    field: 'projectAdminId',
    label: '指定项目长',
    component: 'AutoComplete',
    rules: [
      {
        required: true,
        message: '管理员新建项目需要指定项目长',
      },
    ],
    show: ({ values }) => {
      return userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin');
    },
    componentProps: ({ formModel, formActionType }) => {
      return {
        allowClear: true,
        placeholder: '管理员新建项目需要指定项目长',
        labelField: 'name',
        valueField: 'id',
        options: toRaw(projectStore.getProjectUserList).map((i) => ({ value: i['name'] })),
        filterOption: (input: string, option: Option) => {
          return option['value'].includes(input);
        },
      };
    },
  },
  {
    field: 'menuName',
    label: '技术',
    component: 'TreeSelect',
    componentProps: ({ formModel, formActionType }) => {
      const permissionStore = usePermissionStore();
      const _technology = toRaw(permissionStore.getTechnologyTree);
      return {
        allowClear: true,
        showSearch: true,
        placeholder: '请先择技术在绑定',
        treeData: _technology,
        filterTreeNode: (str, node) => {
          return node['menuName'].includes(str);
        },
        fieldNames: {
          children: 'children',
          label: 'menuName',
          key: 'menuId',
          value: 'menuId',
        },
        onChange: (id) => {
          _technology.forEach((m) => {
            let _node: object = {},
              _technologyIds: string[] = [];
            if (m.hasOwnProperty('children') && m['children']) {
              _node = m.children.filter((i) => i['menuId'] === id)[0];
              if (_node) {
                _technologyIds = _node['children'][0]['children'].map((i) => i['menuId']); // 只取第一个源数据的所有表单
                projectStore.setMenuIds(_technologyIds);
              } else {
                createMessage.warning('请选择技术本身而不是其父级或子级!');
              }
            }
          });
        },
      };
    },
    rules: [
      {
        required: true,
        message: '请输入项目名称',
      },
    ],
  },
  {
    field: 'name',
    label: '项目名称',
    component: 'Input',
    rules: [
      {
        required: true,
        message: '请输入项目名称',
      },
    ],
  },
  {
    field: 'daysLeft',
    label: '到期时间',
    component: 'DatePicker',
    componentProps: ({ formModel, formActionType }) => {
      return {
        style: 'width: 100%',
      };
    },
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
