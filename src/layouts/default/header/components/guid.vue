<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="操作教程" :height="600" :showCancelBtn="false" :showOkBtn="false" :closeFunc="closeHandler">
    <Icon icon="material-symbols:play-lesson" style="width: 50px; height: 50px; background: red;"></Icon>
    <div class="guid_modal">
      <!-- <div class="left">
        <img src="/src/assets/guid/guid.png" />
      </div>-->
      <div class="right">
        <video controls>
          <source src="/src/assets/guid/guid_video.mp4" type="video/mp4">
          您的浏览器不支持 video 标签。
        </video>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, onMounted, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import Icon from '/@/components/Icon/index';
  export default defineComponent({
    components: { BasicModal, Icon },
    setup() {
      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {

      });

      onMounted(() => {
        setModalProps({
          width: '76%',
        });
      });

      const closeHandler = () => {
        sessionStorage.isNewUser = 'no';
        return true;
      };

      return {
        registerModal,
        closeHandler,
      };
    },
  });
</script>
<style lang="less" scoped>
  .guid_modal {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    > .left,
    > .right {
      flex: 1;
    }

    > .left {
      width: 35%;
    }

    > .right {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
