<template>
  <div :class="prefixCls">
    <a-row :class="`${prefixCls}-top`">
      <a-col :span="6" :class="`${prefixCls}-col`">
        <a-row>
          <a-col :span="16">
            <div :class="`${prefixCls}-top__avatar`">
              <img width="70" :src="avatar" />
              <span>{{ realName }}</span>
              <div>{{ introduction }}</div>
            </div>
          </a-col>
          <!--<a-col :span="16">
            <div :class="`${prefixCls}-top__detail`">
              <template v-for="detail in details" :key="detail.title">
                <p>
                  <Icon :icon="detail.icon" />
                  {{ detail.title }}
                </p>
              </template>
            </div>
          </a-col>-->
        </a-row>
      </a-col>
      <a-col :span="6" :class="`${prefixCls}-col`">
        <CollapseContainer :class="`${prefixCls}-top__team affiliation_wrap`" title="隶属" :canExpan="false">
          <div v-for="(team, index) in affiliationProjects" :key="index" :class="`${prefixCls}-top__team-item`">
            <!-- <Icon :icon="team.icon" :color="team.color" /> -->
            <span :style="{ color: team.status == '3' ? 'red' : 'green' }">{{ team.name }}-{{team.status == '3' ? '项目已结束' : '正在进行中'}}</span>
          </div>
          <a-pagination v-model:current="pages.topProjects.curr" :total="pages.topProjects.total" show-less-items @change="turnThePage" size="small" />
        </CollapseContainer>
      </a-col>
      <a-col :span="6" :class="`${prefixCls}-col`">
        <CollapseContainer :class="`${prefixCls}-top__team`" title="技能" :canExpan="false">
          <div v-for="(team, index) in skills" :key="index" :class="`${prefixCls}-top__team-item`">
            <Icon :icon="team.icon" :color="team.color" />
            <span :style="{ color: team.color }">{{ team.label }}</span>
          </div>
        </CollapseContainer>
      </a-col>
      <a-col :span="6" :class="`${prefixCls}-col`">
        <CollapseContainer title="标签" :canExpan="false">
          <template v-for="tag in tagList" :key="tag">
            <a-input v-if="tag.label == 'add'" v-model:value="addTagValue" style="margin-top: 10px;">
              <template #suffix>
                <Icon :icon="'icon-park-solid:correct'" @click="correctAddTagHandler" class="corrent_icon"></Icon>
              </template>
            </a-input>
            <Tag class="mb-2" @mouseenter="tag.isShow = true" @mouseleave="tag.isShow = false" v-else>
              <div>
                <span>{{ tag.label }}</span>
                <Icon v-show="tag.isShow" :icon="'material-symbols:delete-outline-rounded'" @click="deleteTagHandler(tag)"/>
              </div>
            </Tag>
          </template>
          <template #action>
            <Icon icon="ant-design:plus-square-filled" style="cursor: pointer" @click="addUserTagHandler" />
          </template>
        </CollapseContainer>
      </a-col>
    </a-row>
    <div :class="`${prefixCls}-bottom`">
      <div class="handler_list_wrap">
        <div>计算结果操作日志：</div>
        <ul>
          <li v-for="log in formCalculationLogs">生成：{{ log['contractName'] }}，结果：{{ log['dymcDesc'] }}，生成时间：{{ log['createTime'] }}，操作人：{{ !log['userId'] ? '自动生成' : log['userRealName'] }}</li>
        </ul>
        <a-pagination v-model:current="pages.logs.curr" :total="pages.logs.total" show-less-items @change="turnThePage" />
      </div>
      <Tabs>
        <template v-for="item in achieveList" :key="item.key">
          <TabPane :tab="item.name">
            <component :is="item.component" @updateHistory="turnThePage(pages.logs.page, pages.logs.size)" />
          </TabPane>
        </template>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts">
  import { Tag, Tabs, Row, Col, Pagination } from 'ant-design-vue';
  import { useModalInner } from '/@/components/Modal';
  import { defineComponent, computed, ref, h, reactive, toRaw, toRefs } from 'vue';
  import { CollapseContainer } from '/@/components/Container/index';
  import Icon from '/@/components/Icon/index';
  import Article from './Article.vue';
  import Application from './Application.vue';
  import Project from './Project.vue';

  import { tags, details, achieveList } from './data';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useSkillsStore } from '/@/store/modules/skills';
  import { useTeamsStore } from '/@/store/modules/teams';
  import { useFormStore } from '/@/store/modules/form';

  const APagination = Pagination;

  export default defineComponent({
    components: {
      CollapseContainer,
      Icon,
      Tag,
      Tabs,
      TabPane: Tabs.TabPane,
      Article,
      Application,
      Project,
      APagination,
      [Row.name]: Row,
      [Col.name]: Col,
    },
    setup() {
      const userStore = useUserStore();
      const skillsStore = useSkillsStore();
      const teamStore = useTeamsStore();
      const formStore = useFormStore();
      const { createConfirm, createMessage } = useMessage();

      let pages = reactive({
        logs: {
          page: 1,
          size: 3,
          curr: 1,
          total: 0,
        },
        topProjects: {
          page: 1,
          size: 3,
          curr: 1,
          total: 0,
        },
      });
      let state = reactive({
        formCalculationLogs: [],
      });

      // INIT
      const showDeleteIcon = ref(false);
      const addTagValue = ref('');
      const affiliationProjects = ref([]);
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      const userName = computed(() => userStore.getUserInfo['realName']);

      userStore.setUserTagsList({ userId: userStore.getUserInfo.userId });
      userStore.setLogList({ page: 1, size: 999, userId: userStore.getUserInfo.userId });
      userStore.setUserProjectHistorys({ page: pages.topProjects.page, size: pages.topProjects.size }).then((res) => {
          pages.topProjects.total = res['total'];
          affiliationProjects.value = res['records'];
          console.log(res, 'res111');
        });

      skillsStore.setSkillsUserList();
      teamStore.setTeamsUserList();
      formStore.setFormCalculationLog({ page: pages.logs.page, size: pages.logs.size }).then((res) => {
          pages.logs.total = res.total;
          pages.logs.curr = res.current;
          state.formCalculationLogs = res['records'];
        });
      // if (isAdmin.value) {
      //   teamStore.setTeamsUserList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId });
      //   skillsStore.setSkillsUserList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId });
      //   console.log('111');
      // } else {
      //   teamStore.setTeamsList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId });
      //   skillsStore.setSkillsList({ page: 1, pageSize: 10, userId: userStore.getUserInfo.userId });
      //   console.log('222');
      // }

      const avatar = computed(() => userStore.getUserInfo.avatar || userStore.getUserAvatar);
      const realName = computed(() => userStore.userInfo.realName || '没有设置真名姓名');
      const introduction = computed(() => userStore.userInfo.introduction || '暂时没有简介');
      const tagList = computed(() => userStore.getUserTagsList || []);
      // const teams = computed(() => isAdmin.value ? teamStore.getTeamsUserList : userStore.getTeamList);
      // const skills = computed(() => isAdmin.value ? skillsStore.getSkillsUserList :  skillsStore.getSkillsList);
      const teams = computed(() => userStore.getUserInfo.teams);
      const skills = computed(() => userStore.getUserInfo.skills);

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {});
      // 添加TAG
      function addUserTagHandler() {
        if (!tagList.value.some((i) => i.type === 'add')) {
          tagList.value.push({ label: 'add', color: 'blue' });
        }
      }
      // 确认添加
      function correctAddTagHandler() {
        if (!tagList.value.some((i) => i.type === 'add')) {
          const params = {
            color: '#' + Math.random().toString(16).slice(-6),
            label: addTagValue.value,
            userId: userStore.userInfo.userId,
          };
          userStore.setUserTag(params).then((res) => {
            userStore.setUserTagsList({ userId: userStore.getUserInfo.userId });
            createMessage.success(res);
            tagList.value.pop();
          });
        }
      }
      // 删除TAG
      function deleteTagHandler(tag) {
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '删除有风险!'),
          content: () => h('span', '是否确认删除？'),
          onOk: async () => {
            userStore.deleteUserTag({ id: tag.id }).then((res) => {userStore.setUserTagsList({ userId: userStore.getUserInfo.userId });
              createMessage.success(res);
            });
          },
        });
      }

      // 翻页操作
      function turnThePage(page, pageSize) {
        formStore.setFormCalculationLog({ page: page, size: pageSize }).then((res) => {
          pages.logs.total = res.total;
          pages.logs.curr = res.current;
          state.formCalculationLogs.value.length = 0;
          state.formCalculationLogs.value = [];
          state.formCalculationLogs.value = res['records'];
        });
      }

      return {
        prefixCls: 'account-center',
        avatar,
        realName,
        introduction,
        tags,
        tagList,
        teams,
        skills,
        affiliationProjects,
        details,
        achieveList,
        showDeleteIcon,
        addTagValue,
        pages,
        ...toRefs(state),
        turnThePage,
        addUserTagHandler,
        correctAddTagHandler,
        deleteTagHandler,
        registerModal,
      };
    },
  });
</script>
<style lang="less" scoped>
  .account-center {
    height: 100%;

    display: flex;
    flex-direction: column;
    ::v-deep(.ant-row) {
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .corrent_icon {
      cursor: pointer;
      transition: .3s;
      &:hover {
        color: #59d12d;
      }
    }
    .mb-2 {
      cursor: pointer;
      > div {
        display: flex;
        justify-content: center;
        align-items: center;

        .app-iconify {
          transition: 0.3s;
          &:hover {
            color: red;
          }
        }
      }
    }
    &-col:not(:last-child) {
      padding: 0 10px;

      &:not(:last-child) {
        border-right: 1px dashed rgb(206 206 206 / 50%);
      }
    }

    &-col {
      .affiliation_wrap {
        ::v-deep(.p-2) {
          .vben-collapse-container__body {
            display: flex;
            flex-direction: column;
          }
        }
      }
    }

    &-top {
      padding: 10px;
      margin: 16px 16px 12px;
      background-color: @component-background;
      border-radius: 3px;

      &__avatar {
        text-align: center;

        img {
          margin: auto;
          border-radius: 50%;
        }

        span {
          display: block;
          font-size: 20px;
          font-weight: 500;
        }

        div {
          margin-top: 3px;
          font-size: 12px;
        }
      }

      &__detail {
        padding-left: 20px;
        margin-top: 15px;
      }

      &__team {
        &-item {
          display: inline-block;
          padding: 4px 24px;
        }

        span {
          margin-left: 3px;
        }
      }
    }

    &-bottom {
      flex: 1;
      padding: 10px;
      margin: 0 16px 16px;
      background-color: @component-background;
      border-radius: 3px;
      .handler_list_wrap {
        .ant-pagination {
          margin-left: auto;
        }
      }
    }
  }
</style>
