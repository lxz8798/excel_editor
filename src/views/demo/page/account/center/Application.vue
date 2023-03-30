<template>
  <List :class="prefixCls">
    <a-row :gutter="16">
      <template v-for="item in list" :key="item.title">
        <a-col :span="6">
          <ListItem>
            <Card :hoverable="true" :class="`${prefixCls}__card`">
              <a-dropdown :trigger="['contextmenu']">
                <div class="drop_box"></div>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="editName(item)">修改名称</a-menu-item>
                    <a-menu-item @click="copyProject(item)">复制此项</a-menu-item>
                    <a-menu-item @click="invitationMember(item)">调整成员</a-menu-item>
                    <a-menu-item @click="deleteMenu(item)">删除此项</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <div :class="`${prefixCls}__card-title`">
                <Icon class="icon" v-if="item.icon" :icon="item.icon" :color="item.color" />
                <span :style="{ color: item.color }">{{ item.title }}</span>
              </div>
              <div :class="`${prefixCls}__card-num`">
                项目长：<span>{{ item.leaderName ?? '暂无' }}</span>
              </div>
              <div :class="`${prefixCls}__card-num`">
                参与人员：<span>{{ item.teams ?? '暂无' }}</span>
              </div>
              <div :class="`${prefixCls}__card-num`">
                <span>完成进度：还有<span :style="{ color: item.day < 3 ? 'red' : 'blue'  }">&nbsp;{{ item.day <= 0 ? '0' : item.day }}&nbsp;</span>天到期</span>
                <!--<span>
                  <span>快速工作入口</span>
                  <Icon icon="material-symbols:arrow-circle-right-rounded" title="开始工作" @click="enterProject(item)" />
                </span>-->
              </div>
            </Card>
          </ListItem>
        </a-col>
      </template>
    </a-row>
  </List>
  <!--  添加成员  -->
  <AddProjectMebersModal @register="registerModal" />
</template>
<script lang="ts">
import { computed, defineComponent, h, reactive, ref, toRaw } from "vue";
  import { List, Card, Row, Col, Input, Dropdown, Menu } from 'ant-design-vue';
  import AddProjectMebersModal from '/@/views/demo/system/project/AddTeamMebersModal.vue';
  import Icon from '/@/components/Icon/index';
  import { useGo } from '/@/hooks/web/usePage';
  import { useModal } from '/@/components/Modal';
  import { useFormStore } from '/@/store/modules/form';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getOwnerProjectList } from '/@/api/sys/project';
  import { useUserStore } from '/@/store/modules/user';
  import { getProjectPath } from '/@/api/demo/form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermissionStore } from '/@/store/modules/permission';

  const ADropdown = Dropdown;
  const AMenu = Menu;
  const AMenuItem = Menu.Item;

  interface ProjectCarModel {
    id?: number | string;
    title: string;
    icon?: string;
    color?: Function | string;
    day: string;
  }
  export default defineComponent({
    components: {
      List,
      ListItem: List.Item,
      Card,
      Icon,
      ADropdown,
      AMenu,
      AMenuItem,
      AddProjectMebersModal,
      [Row.name]: Row,
      [Col.name]: Col,
    },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { apiUrl } = useGlobSetting();
      // 使用表单
      const formStore = useFormStore();
      const userStore = useUserStore();
      const permissionStore = usePermissionStore();
      const { createMessage, createConfirm } = useMessage();
      const [registerModal, { openModal }] = useModal();
      const go = useGo();
      const state = reactive({
        formList: [],
      });
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      // 修改名称
      function editName(item) {
        const inputValue = ref(item.title);
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '修改名称!'),
          content: () => {
            return h('div', [
              h('label', '请输入名称!'),
              h(
                Input,
                {
                  // value: inputValue.value.split('-')[inputValue.value.split('-').length - 1],
                  value: inputValue.value,
                  onChange: (e) => {
                    inputValue.value = e.target.value;
                  },
                },
                inputValue,
              ),
            ]);
          },
          onOk: () => {
            formStore.setTransformId({ contractId: item['id'] }).then((id) => {
              if (!id) {
                createMessage('该项目可能没有设置项目长或者没有权限!');
                return;
              }
              const params = {
                type: '1',
                menuName: inputValue.value,
                menuId: id,
              };
              formStore.setEditMenu(params).then((res) => {
                createMessage.success('修改成功!');
                item['title'] = inputValue.value;
              });
            })
          },
        });
      }
      // 复制项目
      function copyProject(item) {
        const inputValue = ref(item.title);
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '修改名称!'),
          content: () => {
            return h('div', [
              h('label', '请输入名称!'),
              h(
                Input,
                {
                  value: inputValue.value,
                  onChange: (e) => {
                    inputValue.value = e.target.value;
                  },
                },
                inputValue,
              ),
            ]);
          },
          onOk: () => {
            formStore.setTransformId({ contractId: item['id'] }).then((id) => {
              if (!id) {
                createMessage('该项目可能没有设置项目长或者没有权限!');
                return;
              }
              const copyParams = {
                menuId: id,
                menuName: inputValue.value,
              };
              permissionStore.setCopyMenuResult(copyParams).then((res) => {
                createMessage.success(res);
                getOwnerProjectListFn();
              });
            })
          },
        });
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
          formStore.setTransformId({ contractId: item['id'] }).then((id) => {
            if (!id) {
              createMessage('该项目可能没有设置项目长或者没有权限!');
              return;
            }
            item['projectId'] = item['id'];
            formStore.setProjectMembersInfo({ menuId: id }).then((res) => {
              const { leaderUser, teamUsers } = res;
              item['leaderId'] = leaderUser['id'];
              item['teamUsers'] = teamUsers;
              if (!leaderUser || !teamUsers) {
                createMessage.info('当前菜单没有权限或者不是项目成员!');
                return;
              }
              if (leaderUser['id'] === userStore.getUserInfo.userId) {
                openModal(true, {
                  isUpdate: false,
                  project: item,
                });
              } else {
                createMessage.info('不是项目长不可对项目进行调整!');
                if (teamUsers.some((i) => i.id === userStore.getUserInfo.userId)) {
                  openModal(true, {
                    isUpdate: false,
                    project: item,
                  });
                } else {
                  createMessage.info('不是项目成员不可调整!');
                }
              }
            });
          })
        }
      }
      // 删除菜单
      function deleteMenu(item) {
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '删除有风险!'),
          content: () => h('span', '是否确认删除？'),
          onOk: () => {
            formStore.setTransformId({ contractId: item['id'] }).then((id) => {
              if (!id) {
                createMessage('该项目可能没有设置项目长或者没有权限!');
                return;
              }
              const params = {
                menuId: id
              }
              // const _filter = JSON.parse(JSON.stringify(state.formList.filter((i) => i['id'] !== item['id'])));
              formStore.setDeleteMenu(params).then((res) => {
                createMessage.success(res);
                const index = state.formList.findIndex((i) => i['id'] === item['id']);
                // 如果找到了，使用pop()方法移除该元素
                if (index !== -1) {
                  state.formList.splice(index, 1);
                }
              });
            })
          },
        });
      }
      function Color() {
        let r, g, b;
        r = Math.floor(Math.random() * 255);
        g = Math.floor(Math.random() * 255);
        b = Math.floor(Math.random() * 255);
        return 'rgba(' + r + ',' + g + ',' + b + ',0.8)';
      }

      function getOwnerProjectListFn() {
        getOwnerProjectList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId }).then(
          (result) => {
            result['records'].forEach((t) => {
              const ids = state.formList.map((i) => i['id']);
              if (ids.includes(t['id'])) return;
              state.formList<ProjectCarModel>.push({
                id: t['id'],
                title: t['name'],
                leaderName: t['leaderName'],
                teams: t['teamUsers'].map((i) => i['name']).toString(),
                icon: 'gg:loadbar-doc',
                color: Color(),
                day: Math.floor((new Date(t['targetTime']).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
                // des: t.templateDesc,
                // download: 'bx:bx-download',
                // downLoadUri: apiUrl + '/excel/downLoadExcelVertical?templateId=' + t.id,
              });
            });
          },
        );
      }
      getOwnerProjectListFn();

      function enterProject(item) {
        const { id } = item;
        getProjectPath({ contractId: id }).then((res) => go(res));
      }
      async function downloadExcel(form) {
        const a = document.createElement('a');
        a.target = '_blank';
        a.href = form.downLoadUri;
        document.body.appendChild(a);
        a.click(); //触发下载
        document.body.removeChild(a);
      }
      return {
        downloadExcel,
        enterProject,
        prefixCls: 'account-center-application',
        list: state.formList,
        editName,
        copyProject,
        invitationMember,
        deleteMenu,
        registerModal
      };
    },
  });
</script>
<style lang="less">
  .ant-list {
    .ant-spin-container {
      .ant-row {
        justify-content: flex-start !important;
        align-items: center !important;
        .ant-list-item {
          .ant-card {
            .ant-card-body {
              position: relative;
              .drop_box {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
              }
              .account-center-application__card-num {
                margin-left: 0;

                display: flex;
                justify-content: space-between;
                align-items: center;

                .app-iconify {
                  transition: .3s;
                  &:hover {
                    color: #0960bd;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .account-center-application {
    &__card {
      width: 100%;
      margin-bottom: -12px;

      .ant-card-body {
        padding: 16px;
      }

      &-title {
        margin-bottom: 5px;
        font-size: 16px;
        font-weight: 500;

        .icon {
          margin-top: -5px;
          font-size: 22px;
        }
      }

      &-num {
        margin-left: 24px;
        line-height: 36px;
        color: @text-color-secondary;

        span {
          font-size: 14px;
        }
      }

      &-download {
        float: right;
        font-size: 20px !important;
        color: @primary-color;
      }
    }
  }
</style>
