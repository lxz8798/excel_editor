<template>
  <div class="conversation_wrap" :style="{ background: isDel ? '#fa9aa3a6' : '#eee' }">
    <div class="left">
      <div class="avatar"><img :src="avatarImg"></div>
      <div class="name" :style="{ color: isDel ? '#7d134aa6' : 'rgba(0, 0, 0, 0.85)' }">{{ nameText }}</div>
      <!--<div class="introductionText">{{ introductionText }}</div>-->
    </div>
    <div class="right" v-if="userMsg.content">
      <div class="title" :style="{ color: isDel ? '#7d134aa6' : 'rgba(0, 0, 0, 0.85)' }">{{ msgTitle }}</div>
      <div class="content" :style="{ color: isDel ? '#7d134aa6' : 'rgba(0, 0, 0, 0.85)' }">{{ msgContent }}</div>
      <div class="sub" :style="{ color: isDel ? '#7d134aa6' : 'rgba(0, 0, 0, 0.85)' }">{{ msgSub }}</div>
      <div class="sub" :style="{ color: isDel ? '#7d134aa6' : 'rgba(0, 0, 0, 0.85)' }">{{ msgCreateTime }}</div>
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
      const isDel = computed(() => props.userMsg.delFlag);

      return {
        avatarImg,
        nameText,
        msgTitle,
        msgContent,
        msgSub,
        msgCreateTime,
        isDel,
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
