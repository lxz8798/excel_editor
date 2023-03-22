<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <!--<DeptTree class="w-1/4 xl:w-1/5" @select="handleSelect" />-->
    <BasicTable @register="registerTable" class="w-4/4 xl:w-5/5" :searchInfo="searchInfo">
      <template #toolbar>
        <a-button type="primary" v-if="!isNormal" @click="handleCreate">新增项目</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'material-symbols:play-arrow-rounded',
                color: 'green',
                tooltip: '计算',
              },
              {
                icon: 'fluent:people-team-add-24-filled',
                tooltip: '邀请成员',
                onClick: addProjectMebers.bind(null, record),
              },
              {
                icon: 'clarity:note-edit-line',
                tooltip: '关联内容',
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
    <!--  新增和编辑  -->
    <ProjectModal @register="registerModal1" @success="handleSuccess" />
    <!--  添加成员  -->
    <AddProjectMebersModal @register="registerModal2" />
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive, onMounted, h, computed } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getProjects, getOwnerProjectList, delProject, getProjects } from "/@/api/sys/project";
  import { PageWrapper } from '/@/components/Page';

  import { useModal } from '/@/components/Modal';
  import ProjectModal from './projectModal.vue';
  import AddProjectMebersModal from './AddTeamMebersModal.vue';
  import { columns, searchFormSchema } from './project.data';

  import { useGo } from '/@/hooks/web/usePage';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermissionStore } from '/@/store/modules/permission';
  const permissionStore = usePermissionStore();
  const userStore = useUserStore();
  const { createMessage, createConfirm } = useMessage();
  export default defineComponent({
    name: 'AccountManagement',
    components: { BasicTable, PageWrapper, ProjectModal, AddProjectMebersModal, TableAction },
    setup() {
      const go = useGo();
      const [registerModal1, { openModal: openModal1 }] = useModal();
      const [registerModal2, { openModal: openModal2, setModalProps }] = useModal();
      const searchInfo = reactive<Recordable>({});
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const isActive = computed(() => userStore.getUserInfo.activeFlag);
      const isNormal = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'common_user'));

      userStore.setUserList({ page: 1, pageSize: 10 });
      permissionStore.setTechnologyTree({ page: 1, pageSize: 10 });

      const [registerTable, { reload, updateTableDataRecord, getDataSource, getRawDataSource, setTableData }] =
        useTable({
          title: '项目列表',
          api: isAdmin.value ? getProjects : getOwnerProjectList,
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

      onMounted(() => {
        let timer = null;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const data = getRawDataSource();
          setTableData(data.records);
        }, 1500);
      });

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

      function addProjectMebers(record: Recordable) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        openModal2(true, {
          isUpdate: false,
          project: record,
        });
      }

      function handleEdit(record: Recordable) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
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
        // userStore.deleteUser({ userId: record.id }).then((res) => {
        //   delProject({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId }).then(
        //     (result) => {
        //       setTableData(result['records']);
        //       createMessage.success(res);
        //     },
        //   );
        // });
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '删除有风险!'),
          content: () => h('span', '是否确认删除？'),
          onOk: async () => {
            delProject({ id: record['id'] }).then((result) => {
              createMessage.success(result);
              getOwnerProjectList({
                page: 1,
                pageSize: 10,
                userId: userStore.getUserInfo.userId,
              }).then((res) => {
                setTableData(res['records']);
              });
            });
          },
        });
      }

      function handleSuccess({ isUpdate, values }) {
        setTableData(values);
        // if (isUpdate) {
        //   // 演示不刷新表格直接更新内部数据。
        //   // 注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
        //   const result = updateTableDataRecord(values.id, values);
        // } else {
        //   reload().then(() => {
        //     getOwnerProjectList({
        //       page: 1,
        //       pageSize: 10,
        //       userId: userStore.getUserInfo.userId,
        //     }).then((res) => setTableData(res));
        //   });
        // }
        reload();
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
        registerModal1,
        registerModal2,
        handleCreate,
        addProjectMebers,
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
