<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="70%">
    <div class="admin_dispatch" v-if="!isNormal">
      <div>项目负责人：</div>
      <AutoComplete
        allowClear
        v-model:value="projectAdminId"
        :defaultValue="projectLeader"
        :options="projectUserList"
        style="min-width: 350px"
        placeholder="管理员账号邀请成员需要指定项目长"
        :filter-option="filterOption"
        @change="getProjectAdminId"
      />
      <span style="margin-left: 15px; color: red; font-size: 12px;">如果项目中有多个项目长，需要确定项目负责人！</span>
    </div>
    <ApiTransfer
      :data-source="userList"
      :target-keys="targetKeys"
      :value="transferRightKeys"
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
  import { BasicForm, ApiTransfer, useForm } from '/@/components/Form/index';
  import { defineComponent, ref, computed, toRaw } from 'vue';
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
  const originTargetKeys = computed(() => userList.value.map((i) => i['id']));
  const isNormal = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'common_user'));
  const targetKeys = ref<string[]>(originTargetKeys);
  // const rightKeys = ref<string[]>()
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
      const leaderId = ref('');
      const projectAdminId = ref(null);
      const projectLeader = ref(null);
      const transferRightKeys = ref([]);

      let transferRightDatas = [];

      // projectStore.setProjectUserList();

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
        rowId.value = data.project['from'] === 'project' ? data.project['id'] : data.project['projectId'];
        leaderId.value = data.project['leaderId'];
        projectAdminId.value = data.project['leaderName'];
        // projectAdminId.value = computed(() => projectUserList.value.filter((i) => i['value'] === data.project.createUserId)[0]);
        isUpdate.value = !!data?.isUpdate;
        transferRightKeys.value = data.project['teamUsers'] ? data.project['teamUsers'].map((i) => i['id']) : [];
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
      const getTitle = computed(() => '编辑项目成员');
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const projectUserList = computed(() => toRaw(projectStore.getProjectUserList).map((i) => ({ value: i['realName'] })));

      function getProjectAdminId(value) {
        if (!value) return;
        return toRaw(projectStore.getProjectUserList).filter((i) => i['name'] === value)[0]['id'];
      }

      function transferHandler(data) {
        transferRightKeys.value = data['keys'];
        transferRightDatas = data['source'];
        if (data.direction.toUpperCase() === 'LEFT') {
          const { moveKeys } = data;
          const params = {
            contractId: leaderId.value,
            removeUserIds: moveKeys,
          };
          projectStore.removeProjectMembers(params).then((res) => createMessage.success(res));
        }
      }

      function filterOption(input: string, option: Option) {
        return option['value'].includes(input);
      }

      async function handleSubmit() {
        if (projectAdminId.value === '' && isAdmin.value) {
          createMessage.info('需要指定一个项目负责人!');
          return;
        }
        try {
          // TODO custom api
          const params: ProjectParamsModel = {
            contractId: rowId.value,
            inviteUserId: transferRightKeys.value,
            projectAdminId: getProjectAdminId(projectAdminId.value),
          };
          projectInviteUsers(params).then((res) => {
            createMessage.success(res);
            window.location.reload();
          });
          closeModal();
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return {
        registerModal,
        registerForm,
        getTitle,
        handleSubmit,
        userList,
        targetKeys,
        disabled,
        showSearch,
        transferHandler,
        transferRightDatas,
        filterOption,
        isAdmin,
        isNormal,
        projectUserList,
        getProjectAdminId,
        projectAdminId,
        projectLeader,
        transferRightKeys,
      };
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
    width: 50% !important;
    height: 100% !important;
  }
</style>
