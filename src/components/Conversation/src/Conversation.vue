<template>
  <div class="conversation_wrap">
    <div class="left">
      <div class="avatar"><img :src="avatarImg"></div>
      <div class="name">{{ nameText }}</div>
      <div class="introductionText">{{ introductionText }}</div>
    </div>
    <div class="right">
      <div class="content">{{ userMsg.value }}</div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();
  export default defineComponent({
    name: 'Conversation',
    props: {
      userMsg: {},
    },
    setup(props, { slots }) {
      const avatarImg = computed(() => userStore.getUserInfo.avatar);
      const nameText = computed(() => userStore.getUserInfo.userName);
      const introductionText = computed(() => userStore.getUserInfo.introduction);

      return {
        avatarImg,
        nameText,
        introductionText,
      };
    },
  });
</script>

<style lang="less" scoped>
  div.conversation_wrap {
    display: flex;
    align-items: center;

    > div.left {
      flex: 0 1 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      > div.avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;

        > img {
          object-fit: cover;
        }
      }
      > div.name {
        font-size: 16px;
        font-weight: bold;
      }
      > div.introductionText {
        font-size: 12px;
        color: #bbb;
      }
    }
    > div.right {
      flex: 1;
      height: 100%;

      > div.title {
        font-size: 16px;
      }
      > div.content {
        font-size: 14px;
        color: #bbb;
      }
    }
  }
</style>
