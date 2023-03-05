<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { accountFormSchema } from './team.data';
  import { addTeamItem, delTeam } from '/@/api/sys/team';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  export default defineComponent({
    name: 'AccountModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const rowId = ref('');

      const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 100,
        baseColProps: { span: 24 },
        schemas: accountFormSchema,
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
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增团队' : '编辑团队'));

      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });
          // TODO custom api
          if (!unref(isUpdate)) {
            addTeamItem(Object.assign(values, { userId: userStore.getUserInfo.userId })).then(() =>  emit('success', { isUpdate: unref(isUpdate), values: values }));
          } else {
            userStore.delTeamItem({ id: rowId.value }).then(() => {
              let timer = null;
              if (timer) clearTimeout(timer);
              addTeamItem(Object.assign(values, { userId: userStore.getUserInfo.userId }))
              setTimeout(() => {
                emit('success', { isUpdate: unref(isUpdate), values: values });
              }, 300);
            });
          }
          closeModal();
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>
