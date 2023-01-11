<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="50%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './menu.data';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';

  import { getMenuList } from '/@/api/demo/system';
  import { addMenu, editMenu } from '/@/api/sys/menu';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermissionStore } from '/@/store/modules/permission';

  export default defineComponent({
    name: 'MenuDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      const permissionStore = usePermissionStore();

      const isUpdate = ref(true);
      const state = reactive({
        datas: {},
      });
      let formDatas = {};
      const [
        registerForm,
        { resetFields, getFieldsValue, setFieldsValue, updateSchema, validate },
      ] = useForm({
        labelWidth: 100,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: { lg: 12, md: 24 },
      });

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        state.datas = data;
        resetFields();
        setDrawerProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;

        if (unref(isUpdate)) {
          setFieldsValue({
            ...data.record,
          });
        }
        const treeData = await getMenuList();
        updateSchema({
          field: 'parentMenu',
          componentProps: { treeData },
        });
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增菜单' : '编辑菜单'));

      async function handleSubmit() {
        try {
          formDatas = await validate();
          const { type } = formDatas;
          if (!unref(isUpdate)) {
            // 添加菜单
            setDrawerProps({ confirmLoading: true });
            // TODO custom api
            // if (formDatas['parentMenu'] === '技术') {
            //   formDatas['childFlag'] = true;
            // } else {
            //   formDatas['childFlag'] = false;
            // }
            console.log(formDatas, 'formDatasformDatas');
            if (type == 0 && permissionStore.getAddMenuShowCategory) {
              formDatas['childFlag'] = true;
              // } else if (type == 1) {
              //   console.log(formDatas, 'formDatas');
              //   formDatas['templateFlag'] = '1';
            } else {
              formDatas['childFlag'] = false;
            }
            const addResult = await addMenu(formDatas);
            createMessage.success(addResult);
          } else {
            const { menuId, component } = toRaw(state.datas.record);
            if (type == 1 && component.includes('template')) {
              formDatas['templateFlag'] = '1';
            }
            formDatas['menuId'] = menuId;
            // 编辑菜单
            const editResult = await editMenu(formDatas);
            createMessage.success(editResult);
          }
          closeDrawer();
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }

      return { registerDrawer, registerForm, getTitle, handleSubmit };
    },
  });
</script>
<style lang="less">
  .menuNameBox {
    display: flex;
    flex-direction: row;
    align-items: center;

    > .ant-select {
      width: 80px;
    }
  }
  .parentMenuBox {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
