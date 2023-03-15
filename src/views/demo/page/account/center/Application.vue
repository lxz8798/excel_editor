<template>
  <List :class="prefixCls">
    <a-row :gutter="16">
      <template v-for="item in list" :key="item.title">
        <a-col :span="6">
          <ListItem>
            <Card :hoverable="true" :class="`${prefixCls}__card`">
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
                <Icon icon="material-symbols:arrow-circle-right-rounded" title="开始工作" @click="enterProject(item)" />
              </div>
            </Card>
          </ListItem>
        </a-col>
      </template>
    </a-row>
  </List>
</template>
<script lang="ts">
  import { defineComponent, reactive } from 'vue';
  import { List, Card, Row, Col } from 'ant-design-vue';
  import Icon from '/@/components/Icon/index';
  import { useFormStore } from '/@/store/modules/form';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getOwnerProjectList } from '/@/api/sys/project';
  import { useUserStore } from '/@/store/modules/user';
  import { getProjectPath } from '/@/api/demo/form';

  const { apiUrl } = useGlobSetting();
  // 使用表单
  const formStore = useFormStore();
  const userStore = useUserStore();
  import { useGo } from '/@/hooks/web/usePage';
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
      [Row.name]: Row,
      [Col.name]: Col,
    },
    setup() {
      const go = useGo();
      const state = reactive({
        formList: [],
      });
      function Color() {
        let r, g, b;
        r = Math.floor(Math.random() * 255);
        g = Math.floor(Math.random() * 255);
        b = Math.floor(Math.random() * 255);
        return 'rgba(' + r + ',' + g + ',' + b + ',0.8)';
      }
      getOwnerProjectList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId }).then(
        (result) => {
          result['records'].forEach((t) => {
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
