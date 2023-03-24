<template>
  <li :class="getClass" @click.stop="handleClickItem" :style="getCollapse ? {} : getItemStyle">
    <Tooltip placement="right" v-if="showTooptip">
      <template #title>
        <slot name="title"></slot>
      </template>
      <div :class="`${prefixCls}-tooltip`">
        <slot></slot>
      </div>
    </Tooltip>

    <template v-else>
      <slot></slot>
      <slot name="title"></slot>
    </template>
    <a-dropdown :trigger="['contextmenu']" v-if="!item.name.includes('管理') && !item.name.includes('个人') && !isNormal">
      <div class="drop_box"></div>
      <template #overlay>
        <a-menu>
          <a-menu-item @click="addMenu(item)">创建内容</a-menu-item>
          <a-menu-item @click="editName(item)">修改名称</a-menu-item>
          <!--<a-menu-item @click="transformThchnologyMenu(item)">开始工作</a-menu-item>-->
          <a-menu-item @click="invitationMember(item)">邀请成员</a-menu-item>
          <!--<a-menu-item @click="transformProjectMenu(item)">转成项目</a-menu-item>-->
          <!--<a-menu-item @click="startWorking(item)">开始工作</a-menu-item>-->
          <a-menu-item @click="deleteMenu(item)">删除此项</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <!--  添加成员  -->
    <AddProjectMebersModal @register="registerModal" />
  </li>
</template>

<script lang="ts">
  import AddProjectMebersModal from '/@/views/demo/system/project/AddTeamMebersModal.vue';
  import { defineComponent, ref, computed, unref, getCurrentInstance, watch, h, PropType, toRaw } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { propTypes } from '/@/utils/propTypes';
  import { useMenuItem } from './useMenu';
  import { Tooltip } from 'ant-design-vue';
  import { useSimpleRootMenuContext } from './useSimpleMenuContext';
  import { Dropdown, Input, Menu as Menuu } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useFormStore } from '/@/store/modules/form';
  import { usePermissionStore } from '/@/store/modules/permission';
import { useModal } from "/@/components/Modal";
  import { useUserStore } from '/@/store/modules/user';
  const ADropdown = Dropdown;
  const AMenu = Menuu;
  const AMenuItem = Menuu.Item;
  export default defineComponent({
    name: 'MenuItem',
    components: {
      Tooltip,
      ADropdown,
      AMenu,
      AMenuItem,
      AddProjectMebersModal,
    },
    props: {
      item: {
        type: Object,
        default: {},
      },
      name: {
        type: [String, Number] as PropType<string | number>,
        required: true,
      },
      disabled: propTypes.bool,
    },
    setup(props, { slots }) {
      const instance = getCurrentInstance();
      const { createMessage, createConfirm } = useMessage();
      const permissionStore = usePermissionStore();
      const formStore = useFormStore();
      const userStore = useUserStore();
      const [registerModal, { openModal }] = useModal();
      const active = ref(false);
      const { getItemStyle, getParentList, getParentMenu, getParentRootMenu } =
        useMenuItem(instance);

      const { prefixCls } = useDesign('menu');

      const { rootMenuEmitter, activeName } = useSimpleRootMenuContext();
      const isNormal = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'common_user'));
      const getClass = computed(() => {
        return [
          `${prefixCls}-item`,
          {
            [`${prefixCls}-item-active`]: unref(active),
            [`${prefixCls}-item-selected`]: unref(active),
            [`${prefixCls}-item-disabled`]: !!props.disabled,
          },
        ];
      });

      const getCollapse = computed(() => unref(getParentRootMenu)?.props.collapse);
      const isActive = computed(() => userStore.getUserInfo.activeFlag);
      const showTooptip = computed(() => {
        return unref(getParentMenu)?.type.name === 'Menu' && unref(getCollapse) && slots.title;
      });

      function handleClickItem() {
        const { disabled } = props;
        if (disabled) {
          return;
        }

        rootMenuEmitter.emit('on-menu-item-select', props.name);
        if (unref(getCollapse)) {
          return;
        }
        const { uidList } = getParentList();

        rootMenuEmitter.emit('on-update-opened', {
          opend: false,
          parent: instance?.parent,
          uidList: uidList,
        });
      }
      watch(
        () => activeName.value,
        (name: string) => {
          if (name === props.name) {
            const { list, uidList } = getParentList();
            active.value = true;
            list.forEach((item) => {
              if (item.proxy) {
                (item.proxy as any).active = true;
              }
            });

            rootMenuEmitter.emit('on-update-active-name:submenu', uidList);
          } else {
            active.value = false;
          }
        },
        { immediate: true },
      );
      // 添加菜单
      function addMenu(item) {
        const inputValue = ref('');
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '创建内容!'),
          content: () => {
            return h('div', [
              h('label', '内容名称'),
              h(
                Input,
                {
                  onChange: (e) => {
                    inputValue.value = e.target.value;
                  },
                },
                inputValue,
              ),
            ]);
          },
          onOk: () => {
            const params = {
              type: '0',
              menuName: inputValue.value,
              parentMenu: item.id,
              icon: 'ant-design:appstore-outlined',
              childFlag: false,
            };
            formStore.setNewMenu(params).then((res) => {
              createMessage.success(res);
              permissionStore.buildRoutesAction();
              permissionStore.setLastBuildMenuTime();
            });
          },
        });
      }
      // 修改名称
      function editName(item) {
        const inputValue = ref(item.name);
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '创建内容!'),
          content: () => {
            return h('div', [
              h('label', '内容名称'),
              h(
                Input,
                {
                  value: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
                  onChange: (e) => {
                    inputValue.value = e.target.value;
                  },
                },
                inputValue,
              ),
            ]);
          },
          onOk: () => {
            const params = {
              type: '1',
              menuName: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
              menuId: item.id,
            };
            formStore.setEditMenu(params).then((res) => {
              createMessage.success(res);
              permissionStore.buildRoutesAction();
              permissionStore.setLastBuildMenuTime();
            });
          },
        });
      }
      // 转换成项目
      function transformProjectMenu(item) {
        const inputValue = ref(item.name);
        const params = {
          type: '1',
          menuName: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
          menuId: item.id,
        };
        formStore.setEditMenu(params).then((res) => {
          createMessage.success(res);
          permissionStore.buildRoutesAction();
          permissionStore.setLastBuildMenuTime();
        });
        // createConfirm({
        //   iconType: 'warning',
        //   title: () => h('span', '创建内容!'),
        //   content: () => {
        //     return h('div', [
        //       h('label', '内容名称'),
        //       h(
        //         Input,
        //         {
        //           value: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
        //           onChange: (e) => {
        //             inputValue.value = e.target.value;
        //           },
        //         },
        //         inputValue,
        //       ),
        //     ]);
        //   },
        //   onOk: () => {
        //     const params = {
        //       menuName: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
        //       menuId: item.id,
        //     };
        //     formStore.setEditMenu(params).then((res) => {
        //       createMessage.success(res);
        //       permissionStore.buildRoutesAction();
        //       permissionStore.setLastBuildMenuTime();
        //     });
        //   },
        // });
      }
      // 转换成技术
      function transformThchnologyMenu(item) {
        const inputValue = ref(item.name);
        const params = {
          type: '2',
          menuName: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
          menuId: item.id,
        };
        formStore.setEditMenu(params).then((res) => {
          createMessage.success(res);
          permissionStore.buildRoutesAction();
          permissionStore.setLastBuildMenuTime();
          startWorking(item);
        });
        // createConfirm({
        //   iconType: 'warning',
        //   title: () => h('span', '创建内容!'),
        //   content: () => {
        //     return h('div', [
        //       h('label', '内容名称'),
        //       h(
        //         Input,
        //         {
        //           value: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
        //           onChange: (e) => {
        //             inputValue.value = e.target.value;
        //           },
        //         },
        //         inputValue,
        //       ),
        //     ]);
        //   },
        //   onOk: () => {
        //     const params = {
        //       type: '2',
        //       menuName: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
        //       menuId: item.id,
        //     };
        //     formStore.setEditMenu(params).then((res) => {
        //       createMessage.success(res);
        //       permissionStore.buildRoutesAction();
        //       permissionStore.setLastBuildMenuTime();
        //     });
        //   },
        // });
      }
      // 邀请成员
      function invitationMember(item) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        const inputValue = ref(item.name);
        const params = {
          type: '1',
          menuName: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
          menuId: item.id,
        };
        formStore.setEditMenu(params).then((res) => {
          startWorking(item);
          // createMessage.success(res);
          permissionStore.buildRoutesAction();
          permissionStore.setLastBuildMenuTime();
          item['projectId'] = res;
          openModal(true, {
            isUpdate: false,
            project: item,
          });
        });
      }
      // 开始工作
      function startWorking(item) {
        const { id, name } = toRaw(item);
        const params = { menuId: id, menuName: name };
        formStore.setBasicSubMenu(params).then((res) => {
          if (res) {
            createMessage.success('创建成功!');
            permissionStore.buildRoutesAction();
            permissionStore.setLastBuildMenuTime();
            // window.location.reload();
          } else {
            createMessage.error('创建失败，请检查后重试!');
          }
        });
      }
      // 删除菜单
      function deleteMenu(item) {
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '删除有风险!'),
          content: () => h('span', '是否确认删除？'),
          onOk: () => {
            formStore.setDeleteMenu({ menuId: item.id }).then((res) => {
              createMessage.success(res);
              permissionStore.buildRoutesAction();
              permissionStore.setLastBuildMenuTime();
            });
          },
        });
      }

      return {
        getClass,
        prefixCls,
        getItemStyle,
        getCollapse,
        handleClickItem,
        showTooptip,
        isNormal,
        addMenu,
        editName,
        transformProjectMenu,
        transformThchnologyMenu,
        invitationMember,
        startWorking,
        deleteMenu,
        registerModal,
      };
    },
  });
</script>
<style lang="less">
  li.vben-menu-item {
    position: relative;
    .drop_box {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
</style>
