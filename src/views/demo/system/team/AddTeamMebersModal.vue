<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="70%">
    <ApiTransfer
      :data-source="userList"
      :target-keys="targetKeys"
      :show-search="showSearch"
      :filter-option="(inputValue, item) => item.title.indexOf(inputValue) !== -1"
      :show-select-all="false"
    >
    </ApiTransfer>
  </BasicModal>
</template>
<script lang="ts">
  import { BasicForm, FormSchema, ApiTransfer, useForm } from '/@/components/Form/index';
  import { defineComponent, ref, computed, unref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { accountFormSchema } from './team.data';
  import { addTeamItem } from '/@/api/sys/team';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const userList = computed(() => userStore.getUserList);
  const originTargetKeys = userList.value.map((i) => i['id']);
  const targetKeys = ref<string[]>(originTargetKeys);
  const disabled = ref<boolean>(false);
  const showSearch = ref<boolean>(true);
  export default defineComponent({
    name: 'AccountModal',
    components: { BasicModal, BasicForm, ApiTransfer },
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
        // resetFields();
        setModalProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;

        // if (unref(isUpdate)) {
        //   rowId.value = data.record.id;
        //   setFieldsValue({
        //     ...data.record,
        //   });
        // }

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

      // const getTitle = computed(() => (!unref(isUpdate) ? '新增账号' : '编辑账号'));
      const getTitle = computed(() => '添加成员');

      async function handleSubmit() {
        try {
          // const values = await validate();
          // setModalProps({ confirmLoading: true });
          // addTeamItem(Object.assign(values, { userId: userStore.getUserInfo.userId })).then((res) => {
          //     emit('success', { isUpdate: unref(isUpdate), values: values });
          //   },
          // );

          // TODO custom api
          closeModal();
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit, userList, targetKeys, disabled, showSearch };
    },
  });
</script>
<style lang="less">
  .ant-transfer-list {
    width: 50% !important;
    height: 100% !important;
  }
</style>
