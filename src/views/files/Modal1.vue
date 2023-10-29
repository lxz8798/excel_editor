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

      const xlsHandler = (path: string, name: string) => {
        // setModalProps({
        //   visible: false,
        // });
        // fetch(path).then((response) => response.blob()).then((blob) => {
        //     const reader = new FileReader();
        //     reader.readAsArrayBuffer(blob);
        //     reader.onload = (event) => {
        //       const arrayBuffer = event.target.result;
        //       const data = new Uint8Array(arrayBuffer);
        //       const workbook = XLSX.read(data, { type: 'array' });
        //       const sheetName = workbook.SheetNames[0];
        //       const sheet = workbook.Sheets[sheetName];
        //       // const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        //       const html = XLSX.utils.sheet_to_html(sheet, { editable: false });
        //
        //       const newWindow = window.open();
        //       newWindow.document.open();
        //       newWindow.document.write(html);
        //       newWindow.document.close();
        //     };
        //   })
        //   .catch((error) => {
        //     console.error('下载文件时出错：', error);
        //   });
      };

      const okHandler = () => {
        setModalProps({
          visible: false,
        });
      }

      const handleShow = (visible: boolean) => {
        if (visible) {
          setTimeout(() => {
            const { fileName, viewPath, filePath } = state.datas;
            const _type = fileName.split('.')[1];
            // /jpg|png|gif/g.test(_type) ? imgHandler(filePath) : /doc|docx/g.test(_type) ? fileHandler(viewPath) : /xls|xlsx/g.test(_type) ? xlsHandler(viewPath, fileName) : fileHandler(filePath);
            /jpg|png|gif/g.test(_type) ? imgHandler(filePath) : /doc|docx|xls|xlsx/g.test(_type) ? fileHandler(viewPath) : fileHandler(filePath);
          }, 1000);
        }
      };
      return { register, loading, handleShow, okHandler, lines, state, getColumnDetail };
    },
  });
</script>
<style scoped>
  .empty-tips {
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .content {
    min-height: 450px;
    display: flex;
    justify-content: center;
    align-items: center;
    > img {
      flex: 1;
      object-fit: cover;
    }
  }
</style>
