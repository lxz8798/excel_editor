<template>
  <BasicModal
    v-bind="$attrs"
    destroyOnClose
    @register="register"
    @ok="okHandler"
    :title="getColumnDetail.value"
    @visible-change="handleShow"
  >
    <template #insertFooter>
    <!--<a-button type="primary" danger @click="setLines" :disabled="loading">点我更新内容</a-button>-->
    </template>
    <template v-if="loading">
      <div class="empty-tips">加载中，请稍等……</div>
    </template>
    <template v-if="!loading">
      <ul class="row_list" v-if="datas.length">
        <li :key="index" v-for="(input, index) in datas" @mouseenter="showIocn(input)" @mouseleave="leaveIcon(input)">
          [no.{{index}}]-<input style="color: #4dc6cb; font-weight: bold; font-size: 16px;" v-model="input.value" @change="changeInfoInputVlaue($event, input, index)">
          <CloseCircleOutlined v-show="input.showIconFlag" @click="deleteInputItem(input)" />
        </li>
        <li class="add_icon" @click="addInputRow"><PlusSquareOutlined style="cursor: pointer" /></li>
      </ul>
    </template>
  </BasicModal>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, computed, h, toRaw, toRefs } from "vue";
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useFormStore } from '/@/store/modules/form';
  import { PlusSquareOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { changeInfoInputVlaueApi, saveAddInputs, deleteInputItemApi } from '/@/api/demo/form';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage, createConfirm } = useMessage();
  export default defineComponent({
    components: { BasicModal, PlusSquareOutlined, CloseCircleOutlined },
    setup() {
      const formStore = useFormStore();
      const userStore = useUserStore();
      const loading = ref(true);
      const lines = ref(10);
      const [register, { setModalProps, redoModalHeight }] = useModalInner();
      const getColumnDetail = computed(() => formStore.getColumnDetail);
      const state = reactive({
        datas: [],
        copyObj: {},
      });
      function handleShow(visible: boolean) {
        if (visible) {
          loading.value = true;
          setModalProps({ loading: true, confirmLoading: true });
          setTimeout(() => {
            lines.value = Math.round(Math.random() * 30 + 5);
            loading.value = false;
            state.datas = formStore.getColumnList;
            setModalProps({ loading: false, confirmLoading: false });
          }, 1000);
        }
      }

      function modalCallBack(data) {
        console.log(data, 'data');
      }

      function setLines() {
        lines.value = Math.round(Math.random() * 20 + 10);
      }

      function addInputRow() {
        const copyDatas = toRaw(formStore.getColumnList[0]);
        const newItem = {
          columnIndex: copyDatas.columnIndex,
          columnType: copyDatas.columnType,
          templateId: copyDatas.templateId,
          type: 'input',
          value: '',
        };
        state.datas.splice(formStore.getColumnList.length, 0, newItem);
      }

      function changeInfoInputVlaue(e, input, index) {
        input.headFlag = !index ? true : false;
        changeInfoInputVlaueApi(input).then((res) => createMessage.success(res));
      }

      function okHandler() {
        const filterList = state.datas.filter((i) => i.type !== 'add');
        if (filterList.length) {
          saveAddInputs(JSON.parse(JSON.stringify(filterList))).then((res) => createMessage.success(res));
        }
        setModalProps({ visible: false });
      }

      function showIocn(input) {
        input.showIconFlag = true;
      }
      function leaveIcon(input) {
        input.showIconFlag = false;
      }
      function deleteInputItem(input) {
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '删除有风险!'),
          content: () => h('span', '是否确认删除？'),
          onOk: () => {
            state.datas = state.datas.filter((i) => i.id !== input.id);
            deleteInputItemApi({ infoId: input.id }).then((res) => createMessage.success(res));
          },
        });
      }
      return { register, loading, handleShow, lines, setLines, ...toRefs(state), getColumnDetail, addInputRow, changeInfoInputVlaue, okHandler, showIocn, leaveIcon, deleteInputItem };
    },
  });
</script>
<style scoped>
  .row_list {
    width: 100%;

    display: inline-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    > li {
      padding: 3px;
      flex: 1 1 100px;
      border: 1px solid #ddd;

      display: inline-flex;
      flex-direction: row;
      position: relative;
      > input {
        width: 100%;
        outline: none;
      }
      > span.anticon-close-circle {
        position: absolute;
        top: 35%;
        right: 5px;
        cursor: pointer;
        transition: .3s;
        &:hover {
          color: red;
        }
      }
    }
    > li.add_icon {
      flex: 0 0 100%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      padding: 5px 0;
    }
  }
  .empty-tips {
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
</style>
