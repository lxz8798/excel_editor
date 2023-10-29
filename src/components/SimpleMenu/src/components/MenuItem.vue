<template>
  <!--  <li :class="getClass" :style="getCollapse ? {} : getItemStyle" v-if="isUploadPage" @click.stop="gotoOAuth">-->
  <!--    <Icon icon="ph:upload-bold"></Icon>-->
  <!--    <span class="ml-2 vben-simple-menu-sub-title">原始数据上传</span>-->
  <!--  </li>-->
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
    <a-dropdown :trigger="['contextmenu']" v-if="!item.name.includes('个人')">
      <div class="drop_box"></div>
      <template #overlay>
        <a-menu>
          <!--<a-menu-item @click="addMenu(item)">创建项目</a-menu-item>-->
          <a-menu-item @click="editName(item)">修改名称</a-menu-item>
          <!--<a-menu-item @click="transformThchnologyMenu(item)">开始工作</a-menu-item>-->
          <a-menu-item @click="invitationMember(item)">邀请成员</a-menu-item>
          <!--<a-menu-item @click="transformProjectMenu(item)">转成项目</a-menu-item>-->
          <!--<a-menu-item @click="startWorking(item)">开始工作</a-menu-item>-->
          <a-menu-item @click="deleteMenu(item)">删除此项</a-menu-item>
          <a-menu-item v-if="item['title'].includes('数据归一')">调用此项</a-menu-item>
          <a-menu-item @click="projectApproval(item)" v-if="item['status'] == '0' && isAdmin">项目审批</a-menu-item>
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
  import { Checkbox, Tooltip } from "ant-design-vue";
  import { useSimpleRootMenuContext } from './useSimpleMenuContext';
  import { Dropdown, Input, Menu as Menuu } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useFormStore } from '/@/store/modules/form';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { useProjectStore } from '/@/store/modules/project';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import Icon from '/@/components/Icon/index';
  import { useGo } from '/@/hooks/web/usePage';
  import { router } from '/@/router';
  const ADropdown = Dropdown;
  const AMenu = Menuu;
  const AMenuItem = Menuu.Item;
  const ACheckbox = Checkbox;

  export default defineComponent({
    name: 'MenuItem',
    components: {
      Tooltip,
      ADropdown,
      AMenu,
      AMenuItem,
      AddProjectMebersModal,
      Icon,
      AMenuItem,
      ACheckbox,
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
      const projectStore = useProjectStore();
      const {
        setMenuSetting,
      } = useMenuSetting();
      const [registerModal, { openModal }] = useModal();
      const active = ref(false);
      const { getItemStyle, getParentList, getParentMenu, getParentRootMenu } =
        useMenuItem(instance);

      const { prefixCls } = useDesign('menu');

      const { rootMenuEmitter, activeName } = useSimpleRootMenuContext();

      const isActive = computed(() => userStore.getUserInfo.activeFlag);
      const isNormal = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'common_user'));
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const isLeader = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'project_admin'));
      const isUploadPage = computed(() => toRaw(props['item'])['name'].includes('原始数据上传'));
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
      const showTooptip = computed(() => {
        return unref(getParentMenu)?.type.name === 'Menu' && unref(getCollapse) && slots.title;
      });

      function gotoOAuth() {
        // if (toRaw(props['item'])['name'].includes('原始数据上传')) {
      }

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
        const contentType = ref('0');
        const _checked = ref(true);
        createConfirm({
          iconType: 'warning',
          width: '35vw',
          title: () => h('div', '创建项目!'),
          content: () => {
            return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
              h('label', { style: { width: '72px' } },'内容名称：'),
              h(
                Input,
                {
                  style: {
                    width: '335px',
                  },
                  onChange: (e) => inputValue.value = e.target.value,
                },
                inputValue,
              ),
              h(ACheckbox, { style: { marginLeft: '8px', marginRight: '8px' }, onChange: (e) => {
                  _checked.value = e.target.checked;
                  return e.target.checked ? contentType.value = '1' : contentType.value = '0';
                }},'生成项目')
            ]);
          },
          onOk: () => {
            if (inputValue.value.includes('-')) {
              createMessage.info('名称当中不能包含"-"，请检查后在输入!');
              return;
            }
            const params = {
              type: contentType.value,
              menuName: inputValue.value,
              parentMenu: item.id,
              icon: 'ant-design:appstore-outlined',
              childFlag: false,
            };
            formStore.setNewMenu(params).then((res) => {
              createMessage.success(res);
              permissionStore.setLastBuildMenuTime();
              permissionStore.buildRoutesAction();
              setMenuSetting({ menuWidth: 0, mixSideFixed: false });
            });
          },
        });
      }
      // 修改名称
      function editName(item) {
        const inputValue = ref(item.name);
        // const contentType = ref('1');
        // const _checked = ref(true);
        createConfirm({
          iconType: 'warning',
          width: '35vw',
          title: () => h('span', '修改名称!'),
          content: () => {
            return h('div', [
              h('label', '请输入名称!'),
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
            // return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
            //   h('label', { style: { width: '72px' } },'内容名称：'),
            //   h(
            //     Input,
            //     {
            //       style: {
            //         width: '80%',
            //       },
            //       onChange: (e) => inputValue.value = e.target.value,
            //     },
            //     inputValue,
            //   ),
            //   h(ACheckbox, { style: { marginLeft: '8px', marginRight: '8px' }, checked: _checked, onChange: (e) => {
            //       _checked.value = e.target.checked;
            //       return e.target.checked ? contentType.value = '1' : contentType.value = '0';
            //     }},'生成项目')
            // ]);
          },
          onOk: () => {
            const params = {
              type: item['type'],
              menuName: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
              menuId: item.id,
            };
            formStore.setEditMenu(params).then((res) => {
              createMessage.success(res);
              permissionStore.setLastBuildMenuTime();
              permissionStore.buildRoutesAction();
              setMenuSetting({ menuWidth: 0, mixSideFixed: true });
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
          permissionStore.setLastBuildMenuTime();
          permissionStore.buildRoutesAction();
        });
        // createConfirm({
        //   iconType: 'warning',
        //   title: () => h('span', '创建项目!'),
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
          permissionStore.setLastBuildMenuTime();
          permissionStore.buildRoutesAction();
          startWorking(item);
        });
        // createConfirm({
        //   iconType: 'warning',
        //   title: () => h('span', '创建项目!'),
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
          item['projectId'] = res;
          startWorking(item);
          // 创建成功但没审核的话先不弹窗
          // openModal(true, {
          //   isUpdate: false,
          //   project: item,
          // });
        });
      }
      // 开始工作
      function startWorking(item) {
        const { id, name } = toRaw(item);
        const params = { menuId: id, menuName: name };
        formStore.setBasicSubMenu(params).then((res) => {
          permissionStore.setLastBuildMenuTime();
          permissionStore.buildRoutesAction();
          if (res) {
            createMessage.success('创建成功!');
            openModal(true, {
              isUpdate: false,
              project: item,
            });
          } else {
            createMessage.info('项目未审核，请联系管理员!');
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
            const params = {
              menuId: item.id,
            };
            formStore.setProjectMembersInfo({ menuId: item.id }).then((res) => {
              const { leaderUser, teamUsers } = res;
              // if (item['type'] === '1' && !isAdmin.value) {
              //   if (leaderUser) item['leaderId'] = leaderUser['id'];
              //   if (teamUsers) item['teamUsers'] = teamUsers;
              //   if (!leaderUser || !teamUsers) {
              //     createMessage.info('当前菜单没有权限或者不是项目成员!');
              //     return;
              //   }
              // }
              formStore.setJudgResult(params).then((judge) => {
                console.log(judge, 'judge');
                formStore.setDeleteMenu(params).then((res) => {
                  createMessage.success(res);
                  permissionStore.buildRoutesAction();
                  permissionStore.setLastBuildMenuTime();
                  window.location.reload();
                });
              });
            });
          },
        });
      }
      // 项目审核
      function projectApproval(item) {
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '项目审批'),
          content: () => h('span', '是否同意立项？'),
          cancelText: '拒绝',
          okText: '同意',
          closable: true,
          maskClosable: true,
          cancelButtonProps: { style: { background:'red', color: 'white' } },
          onOk: () => {
            formStore.setMenuIdTransformId({ menuId: item['id'] }).then((id) => {
              projectStore.setAuditStatus({ contractId: id, status: '1' }).then((res) => createMessage.success(res));
              setMenuSetting({ menuWidth: 0, mixSideFixed: false });
            });
          },
          onCancel: () => {
            formStore.setMenuIdTransformId({ menuId: item['id'] }).then((id) => {
              projectStore.setAuditStatus({ contractId: id, status: '2' }).then((res) => createMessage.warning(res))
              setMenuSetting({ menuWidth: 0, mixSideFixed: false });
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
        gotoOAuth,
        showTooptip,
        isNormal,
        isAdmin,
        isUploadPage,
        addMenu,
        editName,
        transformProjectMenu,
        transformThchnologyMenu,
        invitationMember,
        startWorking,
        deleteMenu,
        registerModal,
        projectApproval,
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
