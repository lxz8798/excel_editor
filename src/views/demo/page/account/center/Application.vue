<template>
  <List :class="prefixCls">
    <a-row :gutter="16">
      <template v-for="item in list" :key="item.title">
        <a-col :span="6">
          <ListItem>
            <Card :hoverable="true" :class="`${prefixCls}__card`" @click="clickHandler(item)">
              <div :class="`${prefixCls}__card-title`">
                <Icon class="icon" v-if="item.icon" :icon="item.icon" :color="item.color" />
                {{ item.title }}
              </div>
              <div :class="`${prefixCls}__card-num`">
                表单描述：<span>{{ item.des == '' && '暂无描述' }}</span>
              </div>
              <Icon
                :class="`${prefixCls}__card-download`"
                v-if="item.download"
                :icon="item.download"
                @click="downloadExcel(item)"
              />
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
  const { apiUrl } = useGlobSetting();
  // 使用表单
  const formStore = useFormStore();
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
      const state = reactive({
        formList: [],
      });
      formStore.getTempList.forEach((t) => {
        state.formList.push({
          id: t.id,
          title: t.templateTitle,
          icon: 'gg:loadbar-doc',
          color: '#1890ff',
          des: t.templateDesc,
          download: 'bx:bx-download',
          downLoadUri: apiUrl + '/excel/downLoadExcelVertical?templateId=' + t.id,
        });
      });
      function clickHandler(form) {
        // window.location.href = apiUrl + '/form/template/' + form.id;
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
        clickHandler,
        prefixCls: 'account-center-application',
        list: state.formList,
      };
    },
  });
</script>
<style lang="less">
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
