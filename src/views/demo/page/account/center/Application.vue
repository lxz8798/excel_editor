<template>
  <List :class="prefixCls">
    <a-row :gutter="16">
      <template v-for="item in list" :key="item.title">
        <a-col :span="6">
          <ListItem>
            <!-- 鼠标经过 -->
            <a-popover placement="top" overlayClassName="center_popover_wrap" :mouseEnterDelay="0.5">
              <template #content>
                <ul>
                  <li v-for="history in formHistoryList">
                    <p>
                      <b>{{ titleHandler(history.templateName) }}</b>
                    </p>
                    <ul>
                      <li v-for="content in history['records']">
                        <p>
                          <span style="color: #78aadf">【{{content['formName']}}】</span><span style="color: green">{{content['createTime']}}</span>，<span class="click_item" @click="enterPath(content, history)">{{content['content']}}</span>
                        </p>
                      </li>
                    </ul>
                  </li>
                </ul>
              </template>
              <template #title>
                <span>最近更新</span>
              </template>
              <Card :hoverable="true" :class="`${prefixCls}__card`" @mouseover="formHandlerHistoryList(item)" @click="enterAllPath(item)">
              <a-dropdown :trigger="['contextmenu']">
                <div class="drop_box"></div>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="editName(item)">修改名称</a-menu-item>
                    <a-menu-item @click="copyProject(item)">复制此项</a-menu-item>
                    <a-menu-item @click="invitationMember(item)">调整成员</a-menu-item>
                    <a-menu-item @click="startCalculation(item)">开始计算</a-menu-item>
                    <a-menu-item @click="deleteMenu(item)">删除此项</a-menu-item>
                    <a-menu-item @click="projectApproval(item)" v-if="item['status'] === '0' && isAdmin">项目审批</a-menu-item>
                    <a-menu-item @click="closeProject(item)">结束项目</a-menu-item>
                    <a-menu-item @click="checkProjectDetail(item)">表单操作</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <div :class="`${prefixCls}__card-title`">
                <Icon class="icon" v-if="item.icon" :icon="item.icon" :color="'#161616'" />
                <span style="color: #161616;">{{ item.title }}</span>
              </div>
              <div :class="`${prefixCls}__card-num`">
                项目长：<span>{{ item.leaderName ?? '暂无' }}</span>
              </div>
              <div :class="`${prefixCls}__card-num`">
                参与人员：<span>{{ item.teams ?? '暂无' }}</span>
              </div>
              <div :class="`${prefixCls}__card-num`">
                <!-- 0-待审核 1-审核通过 2-审核不通过 -->
                审批状态：<span :style="{ color: item.status == '0' ? 'blue' : item.status == '3' ? 'red' : 'green' }">{{ item.status == '0' ? '待审核' : item.status == '1' ? '审批通过' : item.status == '2' ? '审核不通过' : '项目已结束' }}</span>
              </div>
              <!--<div :class="`${prefixCls}__card-num`">
                <span>完成进度：还有<span :style="{ color: item.day < 3 ? 'red' : 'blue'  }">&nbsp;{{ item.day <= 0 ? '0' : item.day }}&nbsp;</span>天到期</span>
              </div>-->
            </Card>
            </a-popover>
          </ListItem>
        </a-col>
      </template>
    </a-row>
    <a-row :gutter="16" style="padding-left: 5px; padding-top: 10px;">
      <a-pagination v-model:current="pages.curr" :pageSize="pages.size" :total="pages.total" size="small" show-less-items showTotal @change="getOwnerProjectListFn" />
    </a-row>
  </List>
  <!--  添加成员  -->
  <AddProjectMebersModal @register="registerModal" />
  <!-- 抽屉 -->
  <ProjectDetailDrawer @register="registerDrawer" />
</template>
<script lang="ts">
  import { computed, defineComponent, h, reactive, ref, toRaw, toRefs } from 'vue';
  import { List, Card, Row, Col, Input, Dropdown, Menu, Popover, Pagination } from "ant-design-vue";
  import ProjectDetailDrawer from './ProjectDetailDrawer.vue';
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
  import { useDrawer } from '/@/components/Drawer';
  import { useProjectStore } from '/@/store/modules/project';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useRouter } from "vue-router";

  const ADropdown = Dropdown;
  const AMenu = Menu;
  const AMenuItem = Menu.Item;
  const APopover = Popover;
  const APagination = Pagination;

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
      APopover,
      APagination,
      AddProjectMebersModal,
      [Row.name]: Row,
      [Col.name]: Col,
      ProjectDetailDrawer,
    },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { apiUrl } = useGlobSetting();
      // 使用表单
      const formStore = useFormStore();
      const userStore = useUserStore();
      const permissionStore = usePermissionStore();
      const projectStore = useProjectStore();
      const {
        setMenuSetting,
      } = useMenuSetting();
      const { createMessage, createConfirm } = useMessage();
      const [registerModal, { openModal }] = useModal();
      const [registerDrawer, { openDrawer }] = useDrawer();
      const go = useGo();
      const router = useRouter();
      const state = reactive({
        formList: [],
        formHistoryList: [],
        pages: {
          page: 1,
          size: 12,
          curr: 1,
          total: 0,
        }
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
                type: item['type'],
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
          item['projectId'] = item['id'];
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
          })
        }
      }
      // 开始计算
      function startCalculation(item) {
        formStore.startCalculationHandler({ contractId: item['id'] }).then((res) => {
          if (res) {
            createMessage.success('计算成功');
          }
        })
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
      // 设置有效期
      function checkProjectDetail(item) {
        setMenuSetting({ menuWidth: 0, mixSideFixed: false });
        openDrawer(true, item);
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
        const { id } = item;
        formStore.setProjectComplateState({ contractId: id, status: 3 }).then((res) => {
          if (res) createMessage.success('项目已结束!')
        })
      }

      function Color() {
        let r, g, b;
        r = Math.floor(Math.random() * 255);
        g = Math.floor(Math.random() * 255);
        b = Math.floor(Math.random() * 255);
        return 'rgba(' + r + ',' + g + ',' + b + ',0.8)';
      }

      function resultHandler(result: any) {
        result['records'].forEach((t) => {
          const ids = state.formList.map((i) => i['id']);
          if (ids.includes(t['id'])) return;
          state.formList<ProjectCarModel>.push({
            id: t['id'],
            title: t['name'],
            leaderName: t['leaderName'],
            teams: t['teamUsers'].map((i) => i['realName']).toString(),
            icon: 'gg:loadbar-doc',
            type: t['type'],
            // closePopFlag: false,
            color: Color(),
            status: t['status'],
            confirmFlag: t['confirmFlag'],
            day: Math.floor((new Date(t['targetTime']).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
            // des: t.templateDesc,
            // download: 'bx:bx-download',
            // downLoadUri: apiUrl + '/excel/downLoadExcelVertical?templateId=' + t.id,
          });
        });
      }

      function getOwnerProjectListFn(page?: number | string, pageSize?:  number | string) {
        if (page) {
          state.pages['curr'] = Number(page)
          state.pages['size'] = Number(pageSize)
        }
        getOwnerProjectList({ page: state.pages['curr'], size: state.pages['size'], userId: userStore.getUserInfo.userId }).then(
          (result) => {
            if (result['records']) result['records'] = result['records'].map((i) => ({ ...i, type: 1 }));
            state.pages['total'] = result['total']
            state.pages['curr'] = result['current']
            state.pages['size'] = result['size']
            state.formList.length = 0
            resultHandler(result)
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

      // 表单操作历史
      function formHandlerHistoryList(item) {
        const { id } = item;
        formStore.setFormHandlerHistoryList({ contractId: id }).then((res) => {
          if (state.formHistoryList.length) {
            state.formHistoryList.length = 0;
            state.formHistoryList = [];
          }
          state.formHistoryList = res
        });
      }

      // 处理调标题包含的-
      function titleHandler(title) {
        if (!title) return;
        if (title.includes('-')) {
          return title.split('-')[title.split('-').length - 1];
        } else {
          return title;
        }
      }

      // 快速访问
      function enterPath(item, his) {
        getProjectPath({ templateId: item['templateId'] }).then((res) => {
          // go(res + `?confirm=${item['confirmFlag']}`)
          router.push({
            path: res,
            query: {
              confirm: item['confirmFlag'],
            },
            state: item
          })
        });
      }

      // 进入所有的表单
      function enterAllPath(item) {
        state.formHistoryList.forEach((i) => {
          if (i['records'].length) {
            // i['records'].map((item) => Object.assign(item, { confirmFlag: i['confirmFlag'] }))
            // 原
            // enterPath(i['records'][0], { confirmFlag: i['confirmFlag'] });
            // 新
            item['templateId'] = i['records'][0]['templateId'];
            enterPath(item, { confirmFlag: i['confirmFlag'] });
          }
        })
      }
      return {
        ...toRefs(state),
        downloadExcel,
        enterProject,
        prefixCls: 'account-center-application',
        list: state.formList,
        editName,
        copyProject,
        invitationMember,
        startCalculation,
        deleteMenu,
        checkProjectDetail,
        projectApproval,
        closeProject,
        registerModal,
        registerDrawer,
        formHandlerHistoryList,
        titleHandler,
        enterPath,
        enterAllPath,
        getOwnerProjectListFn,
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
        overflow: hidden;
        height: 50px;
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
