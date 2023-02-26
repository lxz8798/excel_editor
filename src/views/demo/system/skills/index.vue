<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <!--<DeptTree class="w-1/4 xl:w-1/5" @select="handleSelect" />-->
    <BasicTable @register="registerTable" class="w-4/4 xl:w-5/5" :searchInfo="searchInfo">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate">新增团队</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              // {
              //   icon: 'material-symbols:play-arrow-rounded',
              //   color: 'green',
              //   tooltip: '计算',
              //   // onClick: handleView.bind(null, record),
              // },
              {
                icon: 'fluent-mdl2:permissions-solid',
                tooltip: '权限',
                // onClick: handleView.bind(null, record),
              },
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
    <!--<AccountModal @register="registerModal" @success="handleSuccess" />-->
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive, onMounted } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getAccountList } from '/@/api/demo/system';
  import { PageWrapper } from '/@/components/Page';
  import DeptTree from './DeptTree.vue';

  import { useModal } from '/@/components/Modal';
  import AccountModal from './AccountModal.vue';
  import { columns, searchFormSchema } from './skills.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  const userStore = useUserStore();
  const { createMessage } = useMessage();
  export default defineComponent({
    name: 'AccountManagement',
    // DeptTree, AccountModal,
    components: { BasicTable, PageWrapper, TableAction },
    setup() {
      const go = useGo();
      const [registerModal, { openModal }] = useModal();
      const searchInfo = reactive<Recordable>({});
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

      // create
      userStore.setProjectList();

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
        openModal(true, {
          isUpdate: false,
        });
      }

      function handleEdit(record: Recordable) {
        console.log(record, 'record');
        record['password'] = '';
        openModal(true, {
          record,
          isUpdate: true,
        });
      }

      function handleDelete(record: Recordable) {
        userStore.deleteUser({ userId: record.id }).then((res) => {
          getAccountList({ page: 1, pageSize: 30 }).then((result) => {
            setTableData(result.records);
            createMessage.success(res);
          });
        });
      }

      function handleSuccess({ isUpdate, values }) {
        if (isUpdate) {
          // 演示不刷新表格直接更新内部数据。
          // 注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
          const result = updateTableDataRecord(values.id, values);
        } else {
          reload().then(() => {
            const data = getRawDataSource();
            setTableData(data.records);
          });
        }
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
        handleEdit,
        handleDelete,
        handleSuccess,
        handleSelect,
        handleView,
        searchInfo,
      };
    },
  });
</script>
<style lang="less" scope>
  .vben-page-wrapper {
    margin: 16px;
  }
</style>
