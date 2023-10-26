<template>
  <BasicModal
    v-bind="$attrs"
    destroyOnClose
    @register="register"
    @ok="okHandler"
    :title="getColumnDetail.value"
    @visible-change="handleShow"
  >
    <div class="content"></div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useFormStore } from '/@/store/modules/form';
  export default defineComponent({
    components: { BasicModal },
    setup() {
      const formStore = useFormStore();
      const loading = ref(true);
      const lines = ref(10);
      const state = reactive({
        datas: [],
      });
      const [register, { setModalProps }] = useModalInner(async (data) => {
        state.datas = data['project'];
      });
      const getColumnDetail = computed(() => formStore.getColumnDetail);

      const imgHandler = (path: string) => {
        const $img = document.createElement('img');
        const $content = document.querySelector('.content');
        $img.src = path;
        $img.style.width = '100%';
        $img.style.height = '100%';
        $img.style.objectFit = 'cover';
        $content?.append($img);
      };

      const fileHandler = (path: string) => {
        setModalProps({
          visible: false,
        });
        const $link = document.createElement('a');
        $link.href = path;
        $link.target = '_blank';
        $link.click();
      };

      const xlsHandler = (path: string) => {
        setModalProps({
          visible: false,
        });
        const $link = document.createElement('a');
        $link.href = path;
        $link.target = '_blank';
        $link.click();
      };


      const handleShow = (visible: boolean) => {
        if (visible) {
          setTimeout(() => {
            const { fileName, viewPath, filePath } = state.datas;
            const _type = fileName.split('.')[1];
            /jpg|png|gif/g.test(_type) ? imgHandler(filePath) : /doc|docx/g.test(_type) ? fileHandler(viewPath) : /xls|xlsx/g.test(_type) ? xlsHandler(viewPath) : fileHandler(filePath);
          }, 1000);
        }
      };
      return { register, loading, handleShow, lines, state, getColumnDetail };
    },
  });
</script>
<style scoped>
  .empty-tips {
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
</style>
