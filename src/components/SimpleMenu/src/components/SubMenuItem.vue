<template>
  <li :class="getClass">
    <!--<div class="sort_placement" @drop="dropHandler($event, item)" @dragover="e=>e.preventDefault()"></div>-->
    <template v-if="!getCollapse">
      <div :class="`${prefixCls}-submenu-title`" @click.stop="handleClick" :style="getItemStyle">
        <slot name="title"></slot>
        <a-dropdown :trigger="['contextmenu']" v-if="openRightButton">
          <div class="drop_box"></div>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="addMenu(item)">创建项目</a-menu-item>
              <a-menu-item @click="editName(item)">修改名称</a-menu-item>
              <a-menu-item @click="copyProject(item)">复制此项</a-menu-item>
              <!--<a-menu-item @click="transformThchnologyMenu(item)">转成技术</a-menu-item>-->
              <a-menu-item @click="invitationMember(item)">调整成员</a-menu-item>
              <!--<a-menu-item @click="transformProjectMenu(item)">关联项目</a-menu-item>-->
              <!--<a-menu-item @click="startWorking(item)">开始工作</a-menu-item>-->
              <a-menu-item @click="startCalculation(item)">开始计算</a-menu-item>
              <a-menu-item @click="deleteMenu(item)">删除此项</a-menu-item>
              <a-menu-item @click="projectApproval(item)" v-if="item['status'] == '0' && isAdmin">项目审批</a-menu-item>
              <a-menu-item @click="closeProject(item)">结束项目</a-menu-item>
              <a-menu-item v-if="item['meta']['type'] == '1'" @click="checkProjectDetail(item)">表单操作</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <Icon
          icon="eva:arrow-ios-downward-outline"
          :size="14"
          :class="`${prefixCls}-submenu-title-icon`"
        />
      </div>
      <CollapseTransition>
        <ul :class="prefixCls" v-show="opened">
          <slot></slot>
        </ul>
      </CollapseTransition>
    </template>

    <Popover
      placement="right"
      :overlayClassName="`${prefixCls}-menu-popover`"
      v-else
      :visible="getIsOpend"
      @visible-change="handleVisibleChange"
      :overlayStyle="getOverlayStyle"
      :align="{ offset: [0, 0] }"
    >
      <div :class="getSubClass" v-bind="getEvents(false)">
        <div
          :class="[
            {
              [`${prefixCls}-submenu-popup`]: !getParentSubMenu,
              [`${prefixCls}-submenu-collapsed-show-tit`]: collapsedShowTitle,
            },
          ]"
        >
          <slot name="title"></slot>
        </div>
        <Icon
          v-if="getParentSubMenu"
          icon="eva:arrow-ios-downward-outline"
          :size="14"
          :class="`${prefixCls}-submenu-title-icon`"
        />
      </div>
      <!-- eslint-disable-next-line -->
      <template #content v-show="opened">
        <div v-bind="getEvents(true)">
          <ul :class="[prefixCls, `${prefixCls}-${getTheme}`, `${prefixCls}-popup`]">
            <slot></slot>
          </ul>
        </div>
      </template>
    </Popover>
    <!--  添加成员  -->
    <AddProjectMebersModal @register="registerModal" />
    <!-- 抽屉 -->
    <ProjectDetailDrawer @register="registerDrawer" />
  </li>
</template>

<script lang="ts">
  import type { CSSProperties, PropType } from 'vue';
  import type { SubMenuProvider } from './types';
  import {
    defineComponent,
    computed,
    unref,
    getCurrentInstance,
    toRefs,
    reactive,
    provide,
    onBeforeMount,
    inject,
    ref,
    h,
    toRaw,
  } from 'vue';
  import AddProjectMebersModal from '/@/views/demo/system/project/AddTeamMebersModal.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { propTypes } from '/@/utils/propTypes';
  import { useMenuItem } from './useMenu';
  import { useSimpleRootMenuContext } from './useSimpleMenuContext';
  import { CollapseTransition } from '/@/components/Transition';
  import Icon from '/@/components/Icon';
  import { Popover, Dropdown, Input, Menu as Menuu, Checkbox } from 'ant-design-vue';
  import { isBoolean, isObject } from '/@/utils/is';
  import mitt from '/@/utils/mitt';
  import ProjectDetailDrawer from './ProjectDetailDrawer.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useFormStore } from '/@/store/modules/form';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { useDrawer } from '/@/components/Drawer';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useProjectStore } from "/@/store/modules/project";
  const DELAY = 200;
  const ADropdown = Dropdown;
  const AMenu = Menuu;
  const AMenuItem = Menuu.Item;
  const ACheckbox = Checkbox;

  interface ProjectCarModel {
    id?: number | string;
    title: string;
    icon?: string;
    color?: Function | string;
    day: string;
  }

  export default defineComponent({
    name: 'SubMenu',
    components: {
      Icon,
      CollapseTransition,
      Popover,
      ADropdown,
      AMenu,
      AMenuItem,
      ACheckbox,
      AddProjectMebersModal,
      ProjectDetailDrawer,
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
      collapsedShowTitle: propTypes.bool,
    },
    setup(props) {
      const instance = getCurrentInstance();
      const { createMessage, createConfirm } = useMessage();
      const formStore = useFormStore();
      const permissionStore = usePermissionStore();
      const userStore = useUserStore();
      const projectStore = useProjectStore();
      const {
        setMenuSetting,
      } = useMenuSetting();
      const [registerDrawer, { openDrawer }] = useDrawer();
      const state = reactive({
        active: false,
        opened: false,
        formList: [],
      });

      const data = reactive({
        timeout: null as TimeoutHandle | null,
        mouseInChild: false,
        isChild: false,
      });

      // userStore.setUserList({ page: 1, pageSize: 10 });
      // permissionStore.setTechnologyTree({ page: 1, pageSize: 10 });

      const { getParentSubMenu, getItemStyle, getParentMenu, getParentList } =
        useMenuItem(instance);

      const { prefixCls } = useDesign('menu');

      const subMenuEmitter = mitt();

      const { rootMenuEmitter } = useSimpleRootMenuContext();
      const isNormal = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'common_user'));
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const [registerModal, { openModal }] = useModal();

      const {
        addSubMenu: parentAddSubmenu,
        removeSubMenu: parentRemoveSubmenu,
        removeAll: parentRemoveAll,
        getOpenNames: parentGetOpenNames,
        isRemoveAllPopup,
        sliceIndex,
        level,
        props: rootProps,
        handleMouseleave: parentHandleMouseleave,
      } = inject<SubMenuProvider>(`subMenu:${getParentMenu.value?.uid}`)!;

      const getClass = computed(() => {
        return [
          `${prefixCls}-submenu`,
          {
            [`${prefixCls}-item-active`]: state.active,
            [`${prefixCls}-opened`]: state.opened,
            [`${prefixCls}-submenu-disabled`]: props.disabled,
            [`${prefixCls}-submenu-has-parent-submenu`]: unref(getParentSubMenu),
            [`${prefixCls}-child-item-active`]: state.active,
          },
        ];
      });

      const getAccordion = computed(() => rootProps.accordion);
      const getCollapse = computed(() => rootProps.collapse);
      const getTheme = computed(() => rootProps.theme);
      const isActive = computed(() => userStore.getUserInfo.activeFlag);
      const openRightButton = computed(() => !props.item.name.includes('个人') && !props.item.name.includes('原始数据录入') && !props.item.name.includes('数据处理过程') && !props.item.name.includes('计算结果展示') && !props.item.name.includes('结果现象图形化'))
      const getOverlayStyle = computed((): CSSProperties => {
        return {
          minWidth: '200px',
        };
      });

      const getIsOpend = computed(() => {
        const name = props.name;
        if (unref(getCollapse)) {
          return parentGetOpenNames().includes(name);
        }
        return state.opened;
      });

      const getSubClass = computed(() => {
        const isActive = rootProps.activeSubMenuNames.includes(props.name);
        return [
          `${prefixCls}-submenu-title`,
          {
            [`${prefixCls}-submenu-active`]: isActive,
            [`${prefixCls}-submenu-active-border`]: isActive && level === 0,
            [`${prefixCls}-submenu-collapse`]: unref(getCollapse) && level === 0,
          },
        ];
      });

      function getEvents(deep: boolean) {
        if (!unref(getCollapse)) {
          return {};
        }
        return {
          onMouseenter: handleMouseenter,
          onMouseleave: () => handleMouseleave(deep),
        };
      }

      function handleClick(e) {
        const { disabled } = props;
        if (disabled || unref(getCollapse)) return;
        const opened = state.opened;
        if (unref(getAccordion)) {
          const { uidList } = getParentList();
          rootMenuEmitter.emit('on-update-opened', {
            opend: false,
            parent: instance?.parent,
            uidList: uidList,
          });
        } else {
          rootMenuEmitter.emit('open-name-change', {
            name: props.name,
            opened: !opened,
          });
        }
        state.opened = !opened;
      }

      function handleMouseenter() {
        const disabled = props.disabled;
        if (disabled) return;

        subMenuEmitter.emit('submenu:mouse-enter-child');

        const index = parentGetOpenNames().findIndex((item) => item === props.name);

        sliceIndex(index);

        const isRoot = level === 0 && parentGetOpenNames().length === 2;
        if (isRoot) {
          parentRemoveAll();
        }
        data.isChild = parentGetOpenNames().includes(props.name);
        clearTimeout(data.timeout!);
        data.timeout = setTimeout(() => {
          parentAddSubmenu(props.name);
        }, DELAY);
      }

      function handleMouseleave(deepDispatch = false) {
        const parentName = getParentMenu.value?.props.name;
        if (!parentName) {
          isRemoveAllPopup.value = true;
        }

        if (parentGetOpenNames().slice(-1)[0] === props.name) {
          data.isChild = false;
        }

        subMenuEmitter.emit('submenu:mouse-leave-child');
        if (data.timeout) {
          clearTimeout(data.timeout!);
          data.timeout = setTimeout(() => {
            if (isRemoveAllPopup.value) {
              parentRemoveAll();
            } else if (!data.mouseInChild) {
              parentRemoveSubmenu(props.name);
            }
          }, DELAY);
        }
        if (deepDispatch) {
          if (getParentSubMenu.value) {
            parentHandleMouseleave?.(true);
          }
        }
      }

      onBeforeMount(() => {
        subMenuEmitter.on('submenu:mouse-enter-child', () => {
          data.mouseInChild = true;
          isRemoveAllPopup.value = false;
          clearTimeout(data.timeout!);
        });
        subMenuEmitter.on('submenu:mouse-leave-child', () => {
          if (data.isChild) return;
          data.mouseInChild = false;
          clearTimeout(data.timeout!);
        });

        rootMenuEmitter.on(
          'on-update-opened',
          (data: boolean | (string | number)[] | Recordable) => {
            if (unref(getCollapse)) return;
            if (isBoolean(data)) {
              state.opened = data;
              return;
            }
            if (isObject(data) && rootProps.accordion) {
              const { opend, parent, uidList } = data as Recordable;
              if (parent === instance?.parent) {
                state.opened = opend;
              } else if (!uidList.includes(instance?.uid)) {
                state.opened = false;
              }
              return;
            }

            if (props.name && Array.isArray(data)) {
              state.opened = (data as (string | number)[]).includes(props.name);
            }
          },
        );

        rootMenuEmitter.on('on-update-active-name:submenu', (data: number[]) => {
          if (instance?.uid) {
            state.active = data.includes(instance?.uid);
          }
        });
      });

      function handleVisibleChange(visible: boolean) {
        state.opened = visible;
      }

      // provide
      provide<SubMenuProvider>(`subMenu:${instance?.uid}`, {
        addSubMenu: parentAddSubmenu,
        removeSubMenu: parentRemoveSubmenu,
        getOpenNames: parentGetOpenNames,
        removeAll: parentRemoveAll,
        isRemoveAllPopup,
        sliceIndex,
        level: level + 1,
        handleMouseleave,
        props: rootProps,
      });

      // 添加菜单
      function addMenu(item) {
        const inputValue = ref('');
        const contentType = ref('1');
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
                    width: '335px'
                  },
                  onChange: (e) => inputValue.value = e.target.value,
                },
                inputValue,
              ),
              h(ACheckbox, { style: { marginLeft: '8px', marginRight: '8px' }, checked: _checked, onChange: (e) => {
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
        createConfirm({
          iconType: 'warning',
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
      // 复制项目
      function copyProject(item) {
        const inputValue = ref(item.name);
        createConfirm({
          iconType: 'warning',
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
          },
          onOk: () => {
            const { id } = item;
            const copyParams = {
              menuId: id,
              menuName: inputValue.value,
            };
            permissionStore.setCopyMenuResult(copyParams).then((res) => {
              createMessage.success(res);
              permissionStore.setLastBuildMenuTime();
              permissionStore.buildRoutesAction();
            });
          },
        });
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
        item['teamUsers'] = [];
        item['projectId'] = 0;
        item['leaderId'] = 0;
        if (isAdmin.value) {
          openModal(true, {
            isUpdate: false,
            project: item,
          });
        } else {
          formStore.setMenuIdTransformId({ menuId: item['id'] }).then((id) => {
            item['projectId'] = id;
            formStore.setProjectMembersInfo({ menuId: item['id'] }).then((res) => {
              const { leaderUser, teamUsers } = res;
              item['leaderId'] = leaderUser['id'];
              item['teamUsers'] = teamUsers;

              if (!leaderUser || !teamUsers || !isAdmin) {
                createMessage.info('当前菜单没有权限或者不是项目成员!');
                return;
              }

              if (leaderUser['id'] === userStore.getUserInfo.userId || isAdmin.value) {
                openModal(true, {
                  isUpdate: false,
                  project: item,
                });
              } else {
                createMessage.info('不是项目成员不可对项目调整!');
                if (teamUsers.some((i) => i.id === userStore.getUserInfo.userId || isAdmin.value)) {
                  openModal(true, {
                    isUpdate: false,
                    project: item,
                  });
                } else {
                  createMessage.info('不是项目成员不可调整!');
                }
              }
            });
          });
        }
      }
      // 转换成项目
      function transformProjectMenu(item) {
        const inputValue = ref(item.name);
        const contentType = ref('1');
        const _checked = ref(true);
        createConfirm({
          iconType: 'warning',
          width: '35vw',
          title: () => h('span', '创建项目!'),
          content: () => {
            return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
              h('label', { style: { width: '72px' } },'内容名称：'),
              h(
                Input,
                {
                  style: {
                    width: '335px'
                  },
                  onChange: (e) => inputValue.value = e.target.value,
                },
                inputValue,
              ),
              h(ACheckbox, { style: { marginLeft: '8px', marginRight: '8px' }, onChange: (e) => {
                  _checked.value = e.target.checked
                  return e.target.checked ? contentType.value = '1' : contentType.value = '0'
                }},'生成项目')
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
              permissionStore.setLastBuildMenuTime();
              permissionStore.buildRoutesAction();
            });
          },
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
            window.location.reload();
          } else {
            createMessage.error('创建失败，请检查后重试!');
          }
        });
      }

      // 开始计算
      function startCalculation(item) {
        formStore.setMenuIdTransformId({ menuId: item['id'] }).then((id) => {
          formStore.startCalculationHandler({ contractId: id }).then((res) => {
            if (res) {
              createMessage.success('计算成功');
              window.location.reload();
            }
          })
        })
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
              if (leaderUser || teamUsers) {
                item['leaderId'] = leaderUser['id'];
                item['teamUsers'] = teamUsers;
                if (!leaderUser || !teamUsers || !isAdmin) {
                  createMessage.info('当前菜单没有权限或者不是项目成员!');
                  return;
                }
              }
              formStore.setJudgResult(params).then((judge) => {
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
      function dropHandler(event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // 设置有效期
      function checkProjectDetail(item) {
        setMenuSetting({ menuWidth: 0, mixSideFixed: false });
        formStore.setMenuIdTransformId({ menuId: item['id'] }).then((id) => {
          openDrawer(true, { id: id, menuName: item['title'] });
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
            state.formList<ProjectCarModel>.map((i) => {
              if (i['id'] === item['id']) {
                i['status'] == '1';
              }
            })
            projectStore.setAuditStatus({ contractId: item['id'], status: '1' }).then((res) => {
              createMessage.success(res);
              window.location.reload();
            })
          },
          onCancel: () => {
            state.formList<ProjectCarModel>.map((i) => {
              if (i['id'] === item['id']) {
                i['status'] == '2';
              }
            })
            projectStore.setAuditStatus({ contractId: item['id'], status: '2' }).then((res) => createMessage.warning(res))
          }
        });
      }

      // 结束项目
      function closeProject(item) {
        formStore.setMenuIdTransformId({ menuId: item['id'] }).then((id) => {
          formStore.setProjectComplateState({ contractId: id, status: 3 }).then((res) => {
            if (res) createMessage.success('项目已结束!')
          })
        })
      }

      return {
        getClass,
        prefixCls,
        getCollapse,
        getItemStyle,
        handleClick,
        handleVisibleChange,
        getParentSubMenu,
        openRightButton,
        getOverlayStyle,
        getTheme,
        getIsOpend,
        isNormal,
        getEvents,
        getSubClass,
        addMenu,
        editName,
        copyProject,
        transformProjectMenu,
        transformThchnologyMenu,
        invitationMember,
        startWorking,
        startCalculation,
        deleteMenu,
        registerModal,
        dropHandler,
        registerDrawer,
        checkProjectDetail,
        projectApproval,
        closeProject,
        isAdmin,
        ...toRefs(state),
        ...toRefs(data),
      };
    },
  });
</script>
<style lang="less">
  .vben-menu-dark.vben-menu-vertical .vben-menu-item-active:not(.vben-menu-submenu), .vben-menu-dark.vben-menu-vertical .vben-menu-submenu-title-active:not(.vben-menu-submenu) {
    background: #0656859e !important;
  }
  li.vben-menu-submenu {
    .sort_placement {
      width: 100%;
      height: 100px;
    }
    .vben-menu-submenu-title {
      position: relative;
      &:hover {
        background: #0656859e !important;
      }
      .drop_box {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    .vben-menu {
      .vben-menu-item {
        &:hover {
          background: #0656859e !important;
        }
      }
    }
  }
</style>
