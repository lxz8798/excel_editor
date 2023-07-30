<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { accountFormSchema } from './account.data';
  import { regUser, editUserPermissions } from '/@/api/sys/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useSkillsStore } from '/@/store/modules/skills';
  import { useTeamsStore } from '/@/store/modules/teams';
  const { createMessage } = useMessage();
  const skillsStore = useSkillsStore();
  const teamStore = useTeamsStore();
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
          // 这里角开弹窗内部没有回显
          // setFieldsValue({
          //   ...data.record,
          // });
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

      const getTitle = computed(() => (!unref(isUpdate) ? '新增账号' : '编辑账号'));

      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });
          // TODO custom api
          if (values['skills'] && values['skills'].length) {
            const options = computed(() => toRaw(skillsStore.getSkillsUserList));
            const _skillsFilter = [];
            values['skills'].forEach((i) => options['value'].forEach((f) => f['value'] === i && _skillsFilter.push(f)));
            values['skills'] = _skillsFilter;
          }
          if (values['teamName'] && values['teamName'].length) {
            const options = computed(() => toRaw(teamStore.getTeamsUserList));
            const _teamsFilter = [];
            values['teamName'].forEach((i) => options['value'].forEach((f) => f['value'] === i && _teamsFilter.push(f)));
            values['teamName'] = _teamsFilter;
          }
          if (!unref(isUpdate)) {
            regUser(values).then((res) => createMessage.success(res));
          } else {
            values.id = rowId.value;
            editUserPermissions(values).then((res) => createMessage.success('更新成功'));
          }
          emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
          closeModal();
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>
