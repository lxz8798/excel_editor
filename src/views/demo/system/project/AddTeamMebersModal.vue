<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="70%">
    <div class="admin_dispatch" v-if="isAdmin">
      <div>指定项目长：</div>
      <AutoComplete
        allowClear
        v-model:value="projectAdminId"
        :options="projectUserList"
        style="min-width: 350px"
        placeholder="管理员账号邀请成员需要指定项目长"
        :filter-option="filterOption"
        @change="getProjectAdminId"
      />
    </div>
    <ApiTransfer
      :data-source="userList"
      :target-keys="targetKeys"
      :show-search="showSearch"
      :filter-option="(inputValue, item) => item.title.indexOf(inputValue) !== -1"
      :show-select-all="false"
      @change="transferHandler"
    >
    </ApiTransfer>
  </BasicModal>
</template>
<script lang="ts">
  import { AutoComplete } from 'ant-design-vue';
  import { BasicForm, FormSchema, ApiTransfer, useForm } from '/@/components/Form/index';
  import { defineComponent, ref, computed, unref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { projectFormSchema } from './project.data';
  import { projectInviteUsers } from '/@/api/sys/project';

  import { ProjectParamsModel } from '/@/api/sys/model/projectModel';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { Option } from 'ant-design-vue/es/vc-util/Children/toArray';
  import { useProjectStore } from '/@/store/modules/project';

  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const projectStore = useProjectStore();

  const userList = computed(() => userStore.getUserList);
  const originTargetKeys = userList.value.map((i) => i['id']);
  const targetKeys = ref<string[]>(originTargetKeys);
  const disabled = ref<boolean>(false);
  const showSearch = ref<boolean>(true);
  export default defineComponent({
    name: 'AccountModal',
    components: { BasicModal, BasicForm, ApiTransfer, AutoComplete },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const projectData = ref({});
      const rowId = ref('');
      const projectAdminId = ref('');

      let transferRightDatas = [], transferRightKeys = [];

      projectStore.setProjectUserList();

      const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 100,
        baseColProps: { span: 24 },
        schemas: projectFormSchema,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 23,
        },
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        // resetFields();
        setModalProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;
        projectData.value = data['project'];

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
      const getTitle = computed(() => '添加成员');
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const projectUserList = computed(() => toRaw(projectStore.getProjectUserList).map((i) => ({ value: i['name'] })));

      function getProjectAdminId(value) {
        console.log(value, 'value');
        if (!value) return;
        return toRaw(projectStore.getProjectUserList).filter((i) => i['name'] === value)[0]['id'];
      }

      function transferHandler(data) {
        transferRightKeys = data['keys'];
        transferRightDatas = data['source'];
      }

      function filterOption(input: string, option: Option) {
        return option['value'].includes(input);
      }

      async function handleSubmit() {
        try {
          // TODO custom api
          const params: ProjectParamsModel = {
            contractIds: ['1630229585536770050'],
            inviteUserId: transferRightKeys,
            projectAdminId: isAdmin.value ? getProjectAdminId(projectAdminId.value) : null,
          };
          projectInviteUsers(params).then((res) => {
            console.log(res, 'res');
          });
          closeModal();
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit, userList, targetKeys, disabled, showSearch, transferHandler, transferRightDatas, filterOption, isAdmin, projectUserList, getProjectAdminId, projectAdminId };
    },
  });
</script>
<style lang="less">
  .admin_dispatch {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  .ant-transfer-list {
    width: 50%;
  }
  .ant-transfer-list {
    height: 100%;
  }
</style>
