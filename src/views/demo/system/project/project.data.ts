import { computed, h, toRaw } from 'vue';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { usePermissionStore } from '/@/store/modules/permission';
import { useProjectStore } from '/@/store/modules/project';
import { getProjectUserList } from '/@/api/sys/project';
import { getMenuList } from '/@/api/demo/system';
import { useMessage } from '/@/hooks/web/useMessage';
import { useUserStore } from '/@/store/modules/user';
import { Option } from 'ant-design-vue/es/vc-util/Children/toArray';
const { createMessage } = useMessage();
const projectStore = useProjectStore();
const userStore = useUserStore();
export const columns: BasicColumn[] = [
  {
    title: '项目名称',
    dataIndex: 'name',
  },
  {
    title: '关联内容',
    dataIndex: 'contracts',
    customRender: ({ record }) => {
      return h('span', record['contracts'] && record['contracts'].map((i) => i && i['menuName'].split('-')[i['menuName'].split('-').length - 1]).toString());
    },
  },
  {
    title: '项目长',
    dataIndex: 'leaderName',
    width: 120,
  },
  {
    title: '项目成员',
    dataIndex: 'teamUsers',
    width: 300,
    customRender: ({ record }) => {
      return h('span', record['teamUsers'] && record['teamUsers'].map((i) => i && i['name']).toString());
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
  // {
  //   field: 'parentMenu',
  //   label: '选择技术',
  //   component: 'TreeSelect',
  //   required: true,
  //   componentProps: {
  //     fieldNames: {
  //       label: 'menuName',
  //       value: 'menuId',
  //       key: 'menuId',
  //     },
  //     getPopupContainer: () => document.body,
  //   },
  // },
  {
    field: 'menuName',
    label: '关联内容',
    component: 'TreeSelect',
    componentProps: ({ formModel, formActionType }) => {
      const permissionStore = usePermissionStore();
      const _technology = toRaw(permissionStore.getTechnologyTree);
      const menuId = computed(() => toRaw(formModel));

      return {
        multiple: true,
        allowClear: true,
        showSearch: true,
        placeholder: '请选择关联内容',
        treeData: _technology.map((item) => {
          return { ...item, children: [] };
        }),
        filterTreeNode: (str, node) => {
          return node['menuName'].includes(str);
        },
        fieldNames: {
          children: 'children',
          label: 'menuName',
          key: 'menuId',
          value: 'menuId',
        },
        onChange: (ids) => {
          // const _arr = [];
          // if (!_arr.includes(id)) {
          //   _arr.push(id);
          //   console.log(_arr, '_arr');
          //   projectStore.setMenuIds(id);
          // }
          projectStore.setMenuIds(ids);
          // _technology.forEach((m) => {
          //   const _arr = [];
          //   let _node: object = {};
          //   if (m.hasOwnProperty('children') && m['children']) {
          //     _node = m.children.filter((i) => i['menuId'] === id)[0];
          //     if (_node) {
          //       if (!_arr.includes(id)) {
          //         _arr.push(id);
          //         projectStore.setMenuIds(_arr);
          //       }
          //     } else {
          //       createMessage.warning('请选择技术本身而不是其父级或子级!');
          //     }
          //   }
          // });
        },
      };
    },
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
