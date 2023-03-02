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
        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          setFieldsValue({
            ...data.record,
          });
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
          const { name, daysLeft, projectAdminId } = values;
          const params = {
            name: name,
            targetTime: new Date(daysLeft).toLocaleString().replace(/\/+/g, '-'),
            createUserId: projectAdminId,
            templateIds: getMenuIds.value,
          };
          console.log(params, 'params');
          setModalProps({ confirmLoading: true });
          // TODO custom api
          addProject(Object.assign(params, { userId: userStore.getUserInfo.userId })).then((res) => {
              emit('success', { isUpdate: unref(isUpdate), values: values });
              createMessage.success(res);
            },
          );
          closeModal();
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>
