<template>
  <PageWrapper contentFullHeight class="page_wrap">
    <img class="xl:h-50 h-30 mx-auto" src="../../assets/svg/illustration.svg" />
    <b>当前页面正在开发中...</b>
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, unref, computed, onMounted, ref } from 'vue';

  export default defineComponent({
    name: 'fileUpload2',
    setup() {
      return {

      }
    },
  });
</script>
<style lang="less" scoped>
  .page_wrap {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    > b {
      margin-top: 20px;
      font-size: 25px;
    }
  }
</style>
