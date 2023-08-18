<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <!--<DeptTree class="w-1/4 xl:w-1/5" @select="handleSelect" />-->
    <BasicTable @register="registerTable" class="w-4/4 xl:w-5/5" :searchInfo="searchInfo">
      <template #toolbar>
        <a-button type="primary" v-if="!isNormal" @click="handleCreate">新增团队</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                tooltip: '删除',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <!--  添加和编辑  -->
    <TeamModal @register="registerModal1" @success="handleSuccess" />
    <!--  添加成员  -->
    <AddTeamMebersModal @register="registerModal2" />
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive, computed, ref } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getAllTeams, getTeams } from '/@/api/sys/team';
  import { PageWrapper } from '/@/components/Page';

  import { useModal } from '/@/components/Modal';
  import TeamModal from './TeamModal.vue';
  import AddTeamMebersModal from './AddTeamMebersModal.vue';
  import { columns, searchFormSchema } from './team.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useTeamsStore } from '/@/store/modules/teams';
  const userStore = useUserStore();
  const teamStore = useTeamsStore();
  const { createMessage } = useMessage();
  export default defineComponent({
    name: 'AccountManagement',
    // AccountModal,
    components: { BasicTable, PageWrapper, TeamModal, AddTeamMebersModal, TableAction },
    setup() {
      const [registerModal1, { openModal: openModal1 }] = useModal();
      const [registerModal2, { openModal: openModal2 }] = useModal();
      const searchInfo = reactive<Recordable>({});
      const isActive = computed(() => userStore.getUserInfo.activeFlag);
      userStore.setUserList({ page: 1, size: 9999 });
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const isNormal = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'common_user'));
      const [registerTable, { reload, updateTableDataRecord, getRawDataSource, setTableData }] =
        useTable({
          title: '团队列表',
          beforeFetch: (params) => {
            params['userId'] = userStore.getUserInfo.userId;
          },
          api: isAdmin.value ? getAllTeams : getTeams,
          rowKey: 'id',
          columns,
          formConfig: {
            labelWidth: 120,
            schemas: searchFormSchema,
            autoSubmitOnEnter: true,
          },
          useSearchForm: false,
          showTableSetting: true,
          bordered: true,
          handleSearchInfoFn(info) {
            return info;
          },
          actionColumn: {
            width: 200,
            title: '操作',
            dataIndex: 'action',
            // slots: { customRender: 'action' },
          },
        });

      // create

      // mounted
      // let timer = null;
      // onMounted(() => {
      //   if (timer) clearTimeout(timer);
      //   timer = setTimeout(() => {
      //     const data = getRawDataSource();
      //     setTableData(data.records);
      //   }, 1000);
      // });

      function handleCreate() {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        openModal1(true, {
          isUpdate: false,
        });
      }

      function handleEdit(record: Recordable) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        record['password'] = '';
        openModal1(true, {
          record,
          isUpdate: true,
        });
      }

      function handleDelete(record: Recordable) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        const { id } = record;
        if (isAdmin.value) {
          userStore.deleteTeamItem({ id: id }).then((res) => {
            createMessage.success(res);
            openModal1(false);
            teamStore.setTeamsUserList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId });
            reload();
          });
        } else {
          userStore.delTeamItem({ id: id }).then((res) => {
            createMessage.success(res);
            openModal1(false);
            teamStore.setTeamsList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId });
            reload();
          });
        }
      }

      function handleSuccess({ isUpdate, values }) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        if (isAdmin.value) {
          teamStore.setTeamsUserList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId });
        } else {
          teamStore.setTeamsList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId });
          console.log('是项目长');
        }
        reload();
        // if (isUpdate) {
        //   // 演示不刷新表格直接更新内部数据。
        //   注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
        //   const result = updateTableDataRecord(values.id, values);
        // } else {
        //   reload().then(() => {
        //     const data = getRawDataSource();
        //     setTableData(data.records);
        //   });
        // }
      }

      function handleSelect(deptId = '') {
        searchInfo.deptId = deptId;
        reload();
      }

      function addTeamMebers(record: Recordable) {
        openModal2(true, {
          isUpdate: false,
        });
      }

      return {
        registerTable,
        registerModal1,
        registerModal2,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSuccess,
        handleSelect,
        addTeamMebers,
        searchInfo,
        isNormal,
      };
    },
  });
</script>
<style lang="less" scope>
  .vben-page-wrapper {
    margin: 16px;
  }
</style>
