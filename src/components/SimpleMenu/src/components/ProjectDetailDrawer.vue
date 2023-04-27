<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="datas['title']"
    width="25%"
  >
    <ul class="drawer_templates_list_wrap">
      <template v-for="item in templates">
        <li v-if="item['templateFlag'] == '1'">
          <p>
            <span><Icon icon="fluent:form-multiple-20-regular"></Icon></span>
            <span>{{ titleHandler(item['menuName']) }}</span>
            <span class="event"><Icon icon="grommet-icons:iteration" title="调用迭代" @click="copyTemplateToNewForm(item)"></Icon></span>
            <span class="event"><Icon icon="bi:calendar2-date" title="设置有效期" @click="setTemplateTimeHndler(item)"></Icon></span>
            <span class="event"><Icon icon="iconoir:open-in-browser" title="快速进入" @click="enterPath(item)"></Icon></span>
          </p>
          <!-- <Icon icon="eos-icons:timeout"></Icon> -->
          <p :style="{ color: item.day < 3 ? 'red' : '#bbb'}">离到期还有<span >&nbsp;{{ calcExpirationDate(item['meta']['targetTime']) }}&nbsp;</span>天</p>
        </li>
      </template>
    </ul>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, reactive, toRefs, computed, h } from 'vue';
  import { router } from '/@/router';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import Icon from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useUserStore } from '/@/store/modules/user';
  import { useFormStore } from '/@/store/modules/form';
  import { DatePicker, TreeSelect } from 'ant-design-vue';
  import { getProjectPath } from '/@/api/demo/form';
  import { useGo } from '/@/hooks/web/usePage';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  export default defineComponent({
    name: 'MenuDrawer',
    components: { BasicDrawer, Icon, DatePicker, TreeSelect },
    emits: ['success', 'register', 'reload'],
    setup(_, { emit }) {
      const { createMessage, createConfirm } = useMessage();
      const permissionStore = usePermissionStore();
      const userStore = useUserStore();
      const formStore = useFormStore();
      const {
        setMenuSetting,
      } = useMenuSetting();
      const go = useGo(router);
      const isUpdate = ref(true);
      const state = reactive({
        datas: {
          title: '暂无',
        },
        templates: [],
        timeSelect: '',
        projects: [],
        projectSelect: '',
      });
      // 进入页面取消勾选
      // permissionStore.setAddMenuShowCategory(false);
      function flattenByDFS(data) {
        let leafNodes = [];
        function findLeaves(node) {
          if (!node.children || node.children.length === 0) {
            leafNodes.push(node);
          } else {
            for (let i = 0; i < node.children.length; i++) {
              findLeaves(node.children[i]);
            }
          }
        }
        for (let i = 0; i < data.length; i++) {
          findLeaves(data[i]);
        }
        return leafNodes;
      }
      // 递归处理项目列表
      function processTreeData(data) {
        if (data === null || data === undefined) {
          return [];
        }

        return data.map((item) => {
          const processedItem = {
            label: titleHandler(item.menuName),
            value: item.menuId,
          };

          if (item.children !== null && item.children !== undefined) {
            processedItem.children = processTreeData(item.children);
          }

          return processedItem;
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

      function copyTemplateToNewForm(item) {
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '迭代表单数据，请指定目标表单!'),
          content: () =>
            h('div', [
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                },
                [
                  h(
                    'label',
                    {
                      style: {
                        marginRight: '8px',
                        width: '80px',
                        textAlignLast: 'justify',
                      },
                    },
                    '目标表单',
                  ),
                  h(TreeSelect, { style: { width: '100%' }, treeData: state.projects, value: state.projectSelect,'onUpdate:value': (value) => { state.projectSelect = value }}),
                ],
              ),
            ]),
          closable: true,
          maskClosable: true,
          onOk: () => formStore.setCopyTemplate({ sourceMenuId: item['menuId'], targetMenuId: state.projectSelect }).then((res) => {
                setMenuSetting({ menuWidth: 0, mixSideFixed: false });
                formStore.setMenuIdToTemplateId({ menuId: state.projectSelect }).then((res) => enterPath({ templateId: res }));
                // state.projectSelect 这个ID需要转成templateId
                // enterPath({ templateId: item['templateId'] });
              }),
        });
      }

      function setTemplateTimeHndler(item) {
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '设置到期时间'),
          content: () => h(DatePicker, {
              value: state.timeSelect,
              style: {
                width: '100%',
              },
              format: 'YYYY-MM-DD',
              'onUpdate:value': (value) => {
                state.timeSelect = value;
              },
            }),
          closable: true,
          maskClosable: true,
          onOk: () => {
            const params = {
              targetTime: state.timeSelect,
              templateId: item['templateId'],
            };
            formStore.setTemplateTime(params).then((msg) => {
              userStore.setProjectTemplates({ contractId: state.datas['id'] }).then((res) => {
                if (res.length) state.templates = flattenByDFS(res[0]['children']);
              });
            });
          },
        });
      }

      function enterPath(item) {
        getProjectPath({ templateId: item['templateId'] }).then((res) => go(res + `?confirm=${item['confirmFlag']}`));
      }

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        state.datas = Object.assign(data, { confirmFlag: state.datas['confirmFlag']} );
        // 这个是components->ProjectDetailDrawer.vue组件需要的标题，复制过去后解开注释
        // state.datas.title = data['menuName'];
        setDrawerProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;
        const params = {
          contractId: data['id'],
        };
        userStore.setProjectTemplates(params).then((res) => {
          if (res.length) state.templates = flattenByDFS(res[0]['children']);
        });
        userStore.setProjectTreeList().then((res) => state.projects = processTreeData(res));
      });

      function calcExpirationDate(str) {
        let _day = Math.floor((new Date(str).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        return _day <= 0 ? '0' : _day;
      }

      return {
        ...toRefs(state),
        registerDrawer,
        titleHandler,
        enterPath,
        copyTemplateToNewForm,
        setTemplateTimeHndler,
        calcExpirationDate,
      };
    },
  });
</script>
<style class="less">
  .drawer_templates_list_wrap {
    width: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    > li {
      width: 100%;
      display: inline-flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      > p {
        padding: 5px;
        margin-bottom: 0;
        > span.event {
          margin-left: 5px;
          cursor: pointer;
          font-size: 12px;
          transition: .3s;
          &:hover {
            color: #0a6cd5;
          }
        }
      }
      > p:last-child {
        margin-left: auto;
      }
    }
    > li:nth-child(odd) {
      background: #ededed;
      border-radius: 5px;
      border: 1px dashed #bbb;
    }
  }
</style>
