import { computed, h, toRaw } from 'vue';

import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

import { useUserStore } from '/@/store/modules/user';
import { useSkillsStore } from '/@/store/modules/skills';
import { useTeamsStore } from '/@/store/modules/teams';
import { getRoles } from '/@/api/sys/user';
import { Icon } from '/@/components/Icon';
import headerImg from '/@/assets/images/header.jpg';
const userStore = useUserStore();
const skillsStore = useSkillsStore();
const teamStore = useTeamsStore();
export const columns: BasicColumn[] = [
  {
    title: '用户名',
    dataIndex: 'name',
    width: 160,
    customRender: ({ record }) => {
      return h(
        'div',
        { style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        [
          h('img', { src: toRaw(record)['avatar'] ? toRaw(record)['avatar'] : headerImg, width: '20', height: '20', style: 'object-fit: cover; border-radius: 50%' }),
          h('p', { style: { marginBottom: '0', marginLeft: '5px' } }, record['name']),
        ],
      );
    },
  },
  {
    title: '真实名字',
    dataIndex: 'realName',
    width: 160,
  },
  {
    title: '角色',
    dataIndex: 'roleList',
    width: 160,
    customRender: ({ record }) => {
      return h('span', record['roleList'].map((i) => i['roleName']).toString());
    },
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
    dataIndex: 'activeFlag',
    title: '激活状态',
    width: 100,
    customRender: ({ record }) => {
      return h('span', { style: `color: ${record['activeFlag'] ? 'green' : 'red'}` },record['activeFlag'] ? '已激活' : '末激活');
    },
  },
  {
    title: '到期时间',
    dataIndex: 'expireTime',
    width: 200,
    ifShow: () => {
      if (!Object.keys(userStore.getUserInfo).length) return;
      return userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin' || i['roleCode'] === 'project_admin');
    },
    customRender: ({ record }) => {
      return h('span', !record['expireTime'] ? '末设置' : new Date(record['expireTime']).toLocaleDateString());
    },
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
    field: 'realName',
    label: '真实名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    componentProps: {
      placeholder: '如果不需要修改密码则不填',
    },
  },
  {
    label: '邮箱',
    field: 'email',
    component: 'Input',
  },
  {
    field: 'teamName',
    label: '所属团队',
    component: 'Select',
    componentProps: ({ formModel, formActionType }) => {
      const options = computed(() => toRaw(teamStore.getTeamsUserList));
      return {
        mode: 'multiple',
        placeholder: '请选择你的团队',
        options: options,
      };
    },
  },
  {
    field: 'skills',
    label: '专业技能',
    component: 'Select',
    componentProps: ({ formModel, formActionType }) => {
      const options = computed(() => toRaw(skillsStore.getSkillsUserList));
      console.log(options, 'options');
      return {
        mode: 'multiple',
        placeholder: '请选择你的技能',
        options: options,
      };
    },
  },
  {
    field: 'expireTime',
    label: '到期时间',
    component: 'DatePicker',
    ifShow: () => {
      if (!Object.keys(userStore.getUserInfo).length) return;
      return userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin');
    },
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
  {
    label: '角色',
    field: 'roleId',
    component: 'ApiSelect',
    componentProps: {
      api: getRoles,
      labelField: 'roleName',
      valueField: 'roleId',
    },
    ifShow: () => {
      if (!Object.keys(userStore.getUserInfo).length) return;
      return userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin' || i['roleCode'] === 'project_admin');
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
