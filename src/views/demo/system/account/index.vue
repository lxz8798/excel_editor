<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <!--<DeptTree class="w-1/4 xl:w-1/5" @select="handleSelect" />-->
    <BasicTable @register="registerTable" class="w-4/4 xl:w-5/5" :searchInfo="searchInfo">
      <template #toolbar>
        <a-button type="primary" v-if="!isNormal" @click="handleCreate">新增账号</a-button>
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
    <!--  用户编辑  -->
    <AccountModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive, onMounted, computed } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getAccountList } from '/@/api/demo/system';
  import { PageWrapper } from '/@/components/Page';
  import DeptTree from './DeptTree.vue';

  import { useModal } from '/@/components/Modal';
  import AccountModal from './AccountModal.vue';
  import { columns, searchFormSchema } from './account.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useSkillsStore } from '/@/store/modules/skills';
  import { useTeamsStore } from '/@/store/modules/teams';
  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const skillsStore = useSkillsStore();
  const teamStore = useTeamsStore();
  export default defineComponent({
    name: 'AccountManagement',
    components: { BasicTable, PageWrapper, DeptTree, AccountModal, TableAction },
    setup() {
      const go = useGo();
      const [registerModal, { openModal }] = useModal();
      const searchInfo = reactive<Recordable>({});
      const isActive = computed(() => userStore.getUserInfo.activeFlag);
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const isNormal = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'common_user'));
      const [registerTable, { reload, updateTableDataRecord, getRawDataSource, setTableData }] =
        useTable({
          title: '用户列表',
          api: getAccountList,
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

      // INIT
      isAdmin.value ? skillsStore.setSkillsUserList() : skillsStore.setSkillsUserList();
      isAdmin.value ? teamStore.setTeamsUserList() : teamStore.setTeamsUserList();
      // getRoles().then((roles) => {
      //   userStore.setRoleList(roles);
      // });

      // mounted
      let timer = null;
      onMounted(() => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const data = getRawDataSource();
          setTableData(data.records);
        }, 1000);
      });

      function handleCreate() {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        openModal(true, {
          isUpdate: false,
        });
      }

      function activeAccount(record: Recordable) {
        const params = {
          expireTime: '',
          targetUserId: 0,
        };
        // userStore.setActiveUser()
      }

      function handleEdit(record: Recordable) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        record['password'] = '';
        openModal(true, {
          record,
          isUpdate: true,
        });
      }

      function handleDelete(record: Recordable) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        userStore.deleteUser({ userId: record.id }).then((res) => {
          getAccountList({ page: 1, pageSize: 30 }).then((result) => {
            setTableData(result.records);
            createMessage.success(res);
          });
        });
      }

      function handleSuccess({ isUpdate, values }) {
        console.log(isUpdate, 'isUpdate');
        // if (!isUpdate) {
        //   getAccountList({ page: 1, pageSize: 30 }).then((result) => setTableData(result['records']));
        // } else {
        //   getAccountList({ page: 1, pageSize: 30 }).then((result) => setTableData(result['records']));
        //   reload().then(() => {
        //     const data = getRawDataSource();
        //     console.log(data.records, 'data.records');
        //     setTableData(data.records);
        //   });
        // }
        getAccountList({ page: 1, pageSize: 30 })
          .then((result) => setTableData(result['records']))
          .then(() => {
            reload().then(() => {
              const data = getRawDataSource();
              console.log(data.records, 'data.records');
              setTableData(data.records);
            });
          });
      }

      function handleSelect(deptId = '') {
        searchInfo.deptId = deptId;
        reload();
      }

      function handleView(record: Recordable) {
        go('/system/account_detail/' + record.id);
      }

      return {
        registerTable,
        registerModal,
        handleCreate,
        activeAccount,
        handleEdit,
        handleDelete,
        handleSuccess,
        handleSelect,
        handleView,
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
