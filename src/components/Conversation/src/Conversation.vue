<template>
  <div class="conversation_wrap">
    <div class="left">
      <div class="avatar"><img :src="avatarImg"></div>
      <div class="name">{{ nameText }}</div>
      <!--<div class="introductionText">{{ introductionText }}</div>-->
    </div>
    <div class="right" v-if="userMsg.content">
      <div class="title">{{ msgTitle }}</div>
      <div class="content">{{ msgContent }}</div>
      <div class="sub">{{ msgSub }}</div>
      <div class="sub">{{ msgCreateTime }}</div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import headerImg from '/@/assets/images/header.jpg';
  const userStore = useUserStore();
  export default defineComponent({
    name: 'Conversation',
    props: {
      userMsg: {},
    },
    setup(props, { slots }) {
      const avatarImg = computed(() => props.userMsg.formAvatar ? props.userMsg.formAvatar : headerImg);
      const nameText = computed(() => props.userMsg.formName);
      const msgTitle = computed(() => props.userMsg.content.split(',')[0]);
      const msgContent = computed(() => props.userMsg.content.split(',')[1]);
      const msgSub = computed(() => props.userMsg.content.split(',')[2]);
      const msgCreateTime = computed(() => props.userMsg.createTime);

      return {
        avatarImg,
        nameText,
        msgTitle,
        msgContent,
        msgSub,
        msgCreateTime,
      };
    },
  });
</script>

<style lang="less" scoped>
  div.conversation_wrap {
    overflow: hidden;
    display: flex;
    align-items: center;

    > div.left {
      flex: 0 1 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      > div.avatar {
        width: 35px;
        height: 35px;
        > img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
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
        font-size: 13px;
        font-weight: bold;
      }
      > div.content,
      > div.sub {
        font-size: 12px;
        color: #bbb;
      }
    }
  }
</style>
