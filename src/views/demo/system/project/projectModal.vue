<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { projectFormSchema } from './project.data';
  import { editProject, addProject } from '/@/api/sys/project';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useProjectStore } from '/@/store/modules/project';
  import { getMenuList } from '/@/api/demo/system';
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();
  const projectStore = useProjectStore();
  export default defineComponent({
    name: 'AccountModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const rowId = ref('');
      const leaderId = ref('');

      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const isLeader = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'project_admin'));
      const isNormal = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'common_user'));

      const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
        labelWidth: 100,
        baseColProps: { span: 24 },
        schemas: projectFormSchema,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 23,
        },
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        resetFields();
        setModalProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;
        leaderId.value = data['record'].leaderId;
        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          setFieldsValue({
            ...data.record,
          });
        }

        const treeData = await getMenuList();
        treeData.forEach((i) => processName(i));
        updateSchema({
          field: 'parentMenu',
          componentProps: { treeData },
        });

        function processName(node) {
          const parts = node.name.split('-');
          const lastPart = parts[parts.length - 1];
          node.menuName = node.name = lastPart;
          if (node.children) {
            node.children.forEach((child) => processName(child));
          }
        }
        // const treeData = await getDeptList();
        // updateSchema([
        //   {
        //     field: 'pwd',
        //     show: !unref(isUpdate),
        //   },
        //   {
        //     field: 'dept',
        //     componentProps: { treeData },
        //   },
        // ]);
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增项目' : '编辑项目'));
      const getMenuIds = computed(() => toRaw(projectStore.getMenuIds));

      async function handleSubmit() {
        try {
          const values = await validate();
          const { name, daysLeft, projectAdminId, parentMenu } = values;
          if (name.includes('-')) {
            createMessage.info('名称当中不能包含"-"，请检查后在输入!');
            return;
          }
          const params = {
            name: name,
            // createUserId: isAdmin.value ? toRaw(projectStore.getProjectUserList).filter((i) => i['name'] === projectAdminId)[0]['id'] : null,
            createUserId: leaderId.value,
            parentMenu: parentMenu,
            menuIds: getMenuIds.value,
            targetTime: daysLeft ? new Date(daysLeft).toLocaleString().replace(/\/+/g, '-') : null,
            userId: userStore.getUserInfo.userId,
            id: rowId.value,
          };
          setModalProps({ confirmLoading: true });
          // TODO custom api
          if (!unref(isUpdate)) {
            addProject(params).then((res) => {
              createMessage.success(res);
              userStore
                .setProjectList({
                  page: 1,
                  pageSize: 10,
                  userId: userStore.getUserInfo.userId,
                })
                .then((res) => {
                  emit('success', { isUpdate: unref(isUpdate), values: res['records'] });
                });
            });
          } else {
            editProject(params).then((res) => {
              createMessage.success(res);
              userStore
                .setProjectList({
                  page: 1,
                  pageSize: 10,
                  userId: userStore.getUserInfo.userId,
                })
                .then((res) => {
                  emit('success', { isUpdate: unref(isUpdate), values: res['records'] });
                });
            });
          }
          // emit('success', { isUpdate: unref(isUpdate), values: values });
          closeModal();
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>
<style lang="less">
  .ant-row {
    height: 70%;
  }
</style>
