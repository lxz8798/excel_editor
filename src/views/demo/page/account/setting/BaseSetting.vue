<template>
  <CollapseContainer title="基本设置" :canExpan="false">
    <a-row :gutter="24">
      <a-col :span="14">
        <BasicForm @register="register" />
      </a-col>
      <a-col :span="10">
        <div class="change-avatar">
          <div class="mb-2">头像</div>
          <CropperAvatar
            :uploadApi="uploadAvatar"
            :value="avatar"
            btnText="更换头像"
            :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
            @change="updateAvatar"
            width="150"
          />
        </div>
      </a-col>
    </a-row>
    <Button type="primary" @click="handleSubmit"> 更新基本信息 </Button>
  </CollapseContainer>
</template>
<script lang="ts">
  import { Button, Row, Col } from 'ant-design-vue';
  import { computed, defineComponent, onMounted, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container';
  import { CropperAvatar } from '/@/components/Cropper';

  import { useMessage } from '/@/hooks/web/useMessage';

  import headerImg from '/@/assets/images/header.jpg';
  import { baseSetschemas } from './data';
  import { useUserStore } from '/@/store/modules/user';
  import { uploadAvatar } from '/@/api/sys/upload';
  import { editUser } from '/@/api/sys/user';
  import { useSkillsStore } from '/@/store/modules/skills';
  import { useTeamsStore } from '/@/store/modules/teams';

  export default defineComponent({
    components: {
      BasicForm,
      CollapseContainer,
      Button,
      ARow: Row,
      ACol: Col,
      CropperAvatar,
    },
    setup() {
      const { createMessage } = useMessage();
      const userStore = useUserStore();
      const skillsStore = useSkillsStore();
      const teamStore = useTeamsStore();

      const [register, { setFieldsValue, getFieldsValue, validate }] = useForm({
        labelWidth: 120,
        schemas: baseSetschemas,
        showActionButtonGroup: false,
      });

      const avatar = computed(() => {
        const { avatar } = userStore.getUserInfo;
        return avatar || headerImg;
      });

      function updateAvatar({ src, data }) {
        const userinfo = userStore.getUserInfo;
        userinfo.avatar = src;
        userStore.setUserInfo(userinfo);
      }

      return {
        avatar,
        register,
        uploadAvatar: uploadAvatar as any,
        updateAvatar,
        handleSubmit: async () => {
          const values = await validate();
          if (values['skills'] && values['skills'].length) {
            const options = computed(() => toRaw(skillsStore.getSkillsUserList));
            const _skillsFilter = [];
            values['skills'].forEach((i) => options['value'].forEach((f) => f['value'] === i && _skillsFilter.push(f)));
            values['skills'] = _skillsFilter;
          }
          if (values['teamName'] && values['teamName'].length) {
            const options = computed(() => toRaw(teamStore.getTeamsUserList));
            const _teamsFilter = [];
            values['teamName'].forEach((i) => options['value'].forEach((f) => f['value'] === i && _teamsFilter.push(f)));
            values['teamName'] = _teamsFilter;
          }
          editUser(Object.assign(values, { id: userStore.getUserInfo.userId })).then((res) => {
            const _userInfo = toRaw(userStore.getUserInfo);
            _userInfo['token'] = res['token'];
            userStore.setToken(res['token']);
            userStore.setUserInfo(_userInfo);
            createMessage.success('编辑成功!');
            location.reload();
          });
        },
      };
    },
  });
</script>

<style lang="less" scoped>
  .change-avatar {
    img {
      display: block;
      margin-bottom: 15px;
      border-radius: 50%;
    }
  }
</style>
