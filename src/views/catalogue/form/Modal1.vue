<template>
  <BasicModal
    v-bind="$attrs"
    destroyOnClose
    @register="register"
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
      <ul class="row_list">
        <li v-for="(input, index) in state.datas" :key="index">[no.{{index}}]-<span style="color: #4dc6cb; font-weight: bold; font-size: 16px;">{{ input.value }}</span></li>
      </ul>
    </template>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, toRaw, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useFormStore } from '/@/store/modules/form';
  export default defineComponent({
    components: { BasicModal },
    setup() {
      const formStore = useFormStore();
      const loading = ref(true);
      const lines = ref(10);
      const [register, { setModalProps, redoModalHeight }] = useModalInner();
      const getColumnDetail = computed(() => formStore.getColumnDetail);
      const state = reactive({
        datas: [],
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

      function setLines() {
        lines.value = Math.round(Math.random() * 20 + 10);
      }
      return { register, loading, handleShow, lines, setLines, state, getColumnDetail };
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
      display: inline-block;
      border: 1px solid #ddd;
    }
  }
  .empty-tips {
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
</style>
