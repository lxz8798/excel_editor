
import type { Menu } from '/@/router/types';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h, ref, reactive, warn, toRaw } from "vue";
import { Tag, Input, Select, SelectOption, Form, Checkbox, Cascader } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';
import { getCategory } from '/@/api/sys/menu';
import { usePermissionStore } from '/@/store/modules/permission';
const FormItemRest = Form.ItemRest; //正解
export const columns: BasicColumn[] = [
  {
    title: '菜单名称',
    dataIndex: 'menuName',
    align: 'left',
    customRender: ({ record }) => {
      return h('span', record.name.split('-')[record.name.split('-').length - 1]);
    },
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 50,
    customRender: ({ record }) => {
      return h(Icon, { icon: record.icon });
    },
  },
  // {
  //   title: '权限标识',
  //   dataIndex: 'permission',
  //   width: 180,
  // },
  {
    title: '组件',
    dataIndex: 'component',
  },
  {
    title: '排序',
    dataIndex: 'orderNo',
    width: 50,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ record }) => {
      const status = record.status;
      const enable = ~~status === 0;
      const color = enable ? 'green' : 'red';
      const text = enable ? '启用' : '停用';
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
];

const isDir = (type: string) => type === '0';
const isMenu = (type: string) => type === '1';
const isButton = (type: string) => type === '2';
const permissionStore = usePermissionStore();
export const searchFormSchema: FormSchema[] = [
  {
    field: 'menuName',
    label: '菜单名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: '0' },
        { label: '停用', value: '1' },
      ],
    },
    colProps: { span: 8 },
  },
];
const cascadePrefix = ref(''), cascadeSuffix = ref('');
const isShowCategory = ref(false);
const state = reactive({
  categoryOptions: [],
});
const validCascader = (rule, value, callback) => {
  if (cascadePrefix.value === '' || !cascadePrefix.value) {
    return callback(new Error('路由地址必须填写!'));
  } else {
    return callback();
  }
};
export const formSchema: FormSchema[] = [
  {
    field: 'type',
    label: '菜单类型',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '目录', value: '0' },
        { label: '项目', value: '1' },
        { label: '技术', value: '2' },
      ],
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'menuName',
    label: '菜单名称',
    component: 'Input',
    // rules: [{ required: true }],
    render: ({ model, field }) => h('div', { class: 'menuNameBox' }, [
        // h(
        //   Select,
        //   {
        //     style: isShowCategory.value ? 'display: block;' : 'display: none;',
        //     placeholder: '请选择分类',
        //   },
        //   state.categoryOptions.map((i) =>
        //     h(SelectOption, { label: i.menuName.split('-')[i.menuName.split('-').length - 1], value: i.menuName.split('-')[i.menuName.split('-').length - 1] }),
        //   ),
        // ),
        h(Input, {
          placeholder: '请输入名称',
          value: model[field],
          onChange: (e) => {
            model[field] = e.target.value;
          },
        }),
        h(Checkbox, {
          style: {
            marginLeft: '8px',
          },
          onChange: (e) => {
            // isShowCategory.value = e.target.checked;
            permissionStore.setAddMenuShowCategory(e.target.checked);
          },
        }),
      ]),
  },
  {
    field: 'parentMenu',
    label: '上级菜单',
    component: 'TreeSelect',
    // suffix: (recoder) =>
    //   h(FormItemRest, {}, [
    //     h(Checkbox, {
    //       onChange: (e) => {
    //         isShowCategory.value = e.target.checked;
    //         permissionStore.setAddMenuShowCategory(e.target.checked);
    //       },
    //     }),
    //   ]),
    componentProps: {
      fieldNames: {
        label: 'name',
        value: 'menuId',
        key: 'menuId',
      },
      onChange: (id) => {
        getCategory({ menuId: id }).then((res) => {
          state.categoryOptions = res;
        });
      },
      getPopupContainer: () => document.body,
    },
  },
  {
    field: 'orderNo',
    label: '排序',
    component: 'InputNumber',
    required: true,
  },
  {
    field: 'icon',
    label: '图标',
    component: 'IconPicker',
    required: true,
    ifShow: ({ values }) => !isButton(values.type),
  },
  // {
  //   field: 'path',
  //   label: '路由地址',
  //   component: 'Input',
  //   // componentProps: ({ formModel }) => {
  //   //   return {
  //   //     placeholder: '极联选择器',
  //   //   };
  //   // },
  //   rules: [{ required: true, validator: validCascader, trigger: 'change' }],
  //   ifShow: ({ values }) => !isButton(values.type),
  //   render: ({ model, field }) => {
  //     const transformMenu = (list) => {
  //       return list.map(({ menuId: value, menuName: label, children }) => {
  //         if (children && children.length > 0) {
  //           children = transformMenu(children);
  //         }
  //         return { value, label, children };
  //       });
  //     };
  //     return h('div', { class: 'cascaderBox' }, [
  //       h(Cascader, {
  //         allowClear: true,
  //         changeOnSelect: true,
  //         placeholder: '请选择路由前缀',
  //         options: transformMenu(toRaw(permissionStore.getApiBackMenuList) as Menu[]),
  //         style: {
  //           width: '60%',
  //         },
  //         onChange: (e) => {
  //           if (e) {
  //             cascadePrefix.value = e.length ? e.toString().replace(',', '/') : '';
  //           } else {
  //             cascadePrefix.value = '';
  //           }
  //           model[field] = cascadePrefix.value + cascadeSuffix.value;
  //         },
  //       }),
  //       h(Input, {
  //         placeholder: '请输入访问地址',
  //         style: {
  //           width: '40%',
  //         },
  //         onChange: (e) => {
  //           cascadeSuffix.value = '/' + e.target.value;
  //           model[field] = cascadePrefix.value + cascadeSuffix.value;
  //         },
  //       }),
  //     ]);
  //   },
  // },
  // {
  //   field: 'component',
  //   label: '组件路径',
  //   component: 'Input',
  //   ifShow: ({ values }) => isMenu(values.type),
  // },
  // {
  //   field: 'permission',
  //   label: '权限标识',
  //   component: 'Input',
  //   // ifShow: ({ values }) => !isDir(values.type),
  // },
  {
    field: 'status',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '启用', value: '0' },
        { label: '禁用', value: '1' },
      ],
    },
  },
  {
    field: 'isExt',
    label: '是否外链',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '否', value: '0' },
        { label: '是', value: '1' },
      ],
    },
    ifShow: ({ values }) => !isButton(values.type),
  },

  {
    field: 'keepalive',
    label: '是否缓存',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '否', value: '0' },
        { label: '是', value: '1' },
      ],
    },
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'show',
    label: '是否显示',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '是', value: '0' },
        { label: '否', value: '1' },
      ],
    },
    ifShow: ({ values }) => !isButton(values.type),
  },
];
