<template>
  <div>
    <BasicTable @register="registerTable" @fetch-success="onFetchSuccess">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 新增菜单 </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
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
    <MenuDrawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, nextTick } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getMenuList } from '/@/api/demo/system';
  import { deleteMenu } from '/@/api/sys/menu';
  import { useDrawer } from '/@/components/Drawer';
  import MenuDrawer from './MenuDrawer.vue';

  import { columns, searchFormSchema } from './menu.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useUserStore } from '/@/store/modules/user';
  const userStore = useUserStore();
  export default defineComponent({
    name: 'MenuManagement',
    components: { BasicTable, MenuDrawer, TableAction },
    setup() {
      const { createMessage } = useMessage();
      const permissionStore = usePermissionStore();
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerTable, { reload, expandAll }] = useTable({
        title: '菜单列表',
        api: getMenuList,
        columns,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
        },
        isTreeTable: true,
        pagination: false,
        striped: false,
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        showIndexColumn: false,
        canResize: false,
        actionColumn: {
          width: 80,
          title: '操作',
          dataIndex: 'action',
          // slots: { customRender: 'action' },
          fixed: undefined,
        },
      });

      const isActive = computed(() => userStore.getUserInfo.activeFlag);

      function handleCreate() {
        if (isActive) {
          createMessage.info('当前账户末激活!');
          return;
        }
        openDrawer(true, {
          isUpdate: false,
        });
      }

      function handleEdit(record: Recordable) {
        if (isActive) {
          createMessage.info('当前账户末激活!');
          return;
        }
        openDrawer(true, {
          record,
          isUpdate: true,
        });
      }

      function handleDelete(record: Recordable) {
        if (isActive) {
          createMessage.info('当前账户末激活!');
          return;
        }
        deleteMenu({ menuId: record.menuId }).then((res) => {
          permissionStore.buildRoutesAction();
          reload();
          createMessage.success(res);
        });
      }

      function handleSuccess() {
        reload();
      }

      function onFetchSuccess() {
        // 演示默认展开所有表项
        nextTick(expandAll);
      }

      return {
        registerTable,
        registerDrawer,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSuccess,
        onFetchSuccess,
      };
    },
  });
</script>
<style>
  .vben-basic-form--compact {
    display: none;
  }
</style>
