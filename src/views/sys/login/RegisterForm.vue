<template>
  <template v-if="getShow">
    <img :alt="title" src="../../../assets/svg/login-box-bg.svg" class="w-1/2 -mt-16 -enter-x" style="visibility:hidden;" />
    <LoginFormTitle class="enter-x" />
    <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef">
      <!-- 角色选择 -->
      <FormItem name="account" class="enter-x role_wrap">
        <a-select
          v-model:value="formData.roleId"
          class="select-wrap"
          :token-separators="[',']"
          :placeholder="t('sys.login.team')"
          :options="roleOptions"
          style="width: 120px"
        />
        <Input
          class="fix-auto-fill"
          size="large"
          v-model:value="formData.account"
          :placeholder="t('sys.login.userName')"
        />
      </FormItem>

      <!--新增表单-->
      <FormItem name="team" class="enter-x role_wrap">
        <a-select v-model:value="state.teamValue" mode="multiple" class="select-wrap" :placeholder="t('sys.login.team')" v-if="state['teamState']" @change="getTeamOptionItem">
          <a-select-option v-for="(item, key) in state.teamOptions" :value="key">{{item.label}}</a-select-option>
        </a-select>
        <a-input v-model:value="state.teamValue" placeholder="输入完成后回车添加" @pressEnter="addTeam" v-else />
        <Icon icon="material-symbols:add-box-outline" title="我的团队" size="32" class="add_button" @click="clickTeamOptionItem" />
      </FormItem>
      <FormItem name="skills" class="enter-x role_wrap">
        <a-select v-model:value="state.skillValue" mode="multiple" class="select-wrap" :placeholder="t('sys.login.skills')" v-if="state['skillState']" @change="getSkillOptionItem">
          <a-select-option v-for="(item, key) in state.skillOptions" :value="key">{{item.label}}</a-select-option>
        </a-select>
        <a-input v-model:value="state.skillValue" placeholder="输入完成后回车添加" @pressEnter="addSkills" v-else />
        <Icon icon="material-symbols:add-box-outline" title="添加技能" size="32" class="add_button" @click="clickSkillsOptionItem" />
      </FormItem>

      <FormItem name="realName" class="enter-x">
        <Input
          class="fix-auto-fill"
          size="large"
          v-model:value="formData.realName"
          :placeholder="t('sys.login.realName')"
        />
      </FormItem>
      <FormItem name="phone" class="enter-x">
        <Input
          type="number"
          size="large"
          v-model:value="formData.phone"
          :placeholder="t('sys.login.phone')"
          class="fix-auto-fill"
        />
      </FormItem>
      <!--<FormItem name="sms" class="enter-x">
        <CountdownInput
          size="large"
          class="fix-auto-fill"
          v-model:value="formData.sms"
          :placeholder="t('sys.login.smsCode')"
        />
      </FormItem>-->
      <FormItem name="password" class="enter-x">
        <StrengthMeter
          size="large"
          v-model:value="formData.password"
          :placeholder="t('sys.login.password')"
        />
      </FormItem>
      <FormItem name="confirmPassword" class="enter-x">
        <InputPassword
          size="large"
          visibilityToggle
          v-model:value="formData.confirmPassword"
          :placeholder="t('sys.login.confirmPassword')"
        />
      </FormItem>

      <FormItem class="enter-x" name="policy">
        <!-- No logic, you need to deal with it yourself -->
        <Checkbox v-model:checked="formData.policy" size="small">
          {{ t('sys.login.policy') }}
        </Checkbox>
      </FormItem>

      <Button
        type="primary"
        class="enter-x"
        size="large"
        block
        @click="handleRegister"
        :loading="loading"
      >
        {{ t('sys.login.registerButton') }}
      </Button>
      <Button size="large" block class="mt-4 enter-x" @click="handleBackLogin">
        {{ t('sys.login.backSignIn') }}
      </Button>
    </Form>
  </template>
</template>
<script lang="ts" setup>
import { reactive, ref, unref, computed, toRaw } from "vue";
  import LoginFormTitle from './LoginFormTitle.vue';
  import { Form, Input, Button, Checkbox, Select } from 'ant-design-vue';
  import { StrengthMeter } from '/@/components/StrengthMeter';
  import { Icon } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLoginState, useFormRules, useFormValid, LoginStateEnum } from './useLogin';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useSkillsStore } from '/@/store/modules/skills';
  import { useTeamsStore } from '/@/store/modules/teams';

  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { handleBackLogin, getLoginState, setLoginState } = useLoginState();

  const ASelect = Select;
  const ASelectOption = Select.Option;

  const formRef = ref();
  const loading = ref(false);

  const formData = reactive({
    roleId: '3',
    account: '',
    teamName: [],
    skills: [],
    realName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    sms: '',
    policy: false,
  });

  const state = reactive({
    teamValue: [],
    teamState: true,
    teamOptions: [],
    skillValue: [],
    skillState: true,
    skillOptions: [],
  });

  const { createMessage, createConfirm } = useMessage();
  const { getFormRules } = useFormRules(formData);
  const { validForm } = useFormValid(formRef);
  const userStore = useUserStore();
  const skillsStore = useSkillsStore();
  const teamStore = useTeamsStore();

  // INIT
  state.skillOptions = computed(() => toRaw(skillsStore.getSkillsUserList));
  state.teamOptions = computed(() => toRaw(teamStore.getTeamsUserList));
  // skillsStore.setSkillsUserList().then((res) => {
  //   state.skillOptions = res;
  // });
  // teamStore.setTeamsUserList().then((res) => {
  //   state.teamOptions = res;
  // });

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.REGISTER);
  const roleOptions = computed(() =>
    userStore.getRoleList
      ? userStore.getRoleList.map((i) => {
          i['value'] = i['roleId'];
          i['label'] = i['roleName'];
          return i;
        })
      : [],
  );

  function addTeam(e) {
    if (!state.teamOptions.some((i) => i.value === e.target.value)) {
      state.teamOptions.push({
        icon: '',
        label: e.target.value,
        value: e.target.value,
      });
    } else {
      createMessage.info('已存在相同团队，请直接选择。');
    }
    state['teamState'] = true;
    state['teamValue'] = state.teamOptions;
  }

  function getTeamOptionItem(e) {
    state['teamValue'] = toRaw(state.teamValue).map((i,k) => ({ icon: state.teamOptions[k]['icon'], label: state.teamOptions[k]['label'] }));
  }

  function clickTeamOptionItem() {
    if (state['teamState']) {
      state['teamValue'] = '';
    }
    state.teamState = !state.teamState;
  }

  function addSkills(e) {
    if (!state.skillOptions.some((i) => i.value === e.target.value)) {
      state.skillOptions.push({
        icon: '',
        label: e.target.value,
        value: e.target.value,
      });
    } else {
      createMessage.info('已存在相同技能，请直接选择。');
    }
    state['skillState'] = true;
    state['skillValue'] = state.skillOptions;
  }

  function getSkillOptionItem(value, option) {
    // state['skillValue'] = option;
    state['skillValue'] = toRaw(state.skillValue).map((i,k) => ({ icon: state.skillOptions[k]['icon'], label: state.skillOptions[k]['label'] }));
  }

  function clickSkillsOptionItem() {
    if (state['skillState']) {
      state['skillValue'] = '';
    } else {
      addSkills();
    }
    state.skillState = !state.skillState;
  }

  async function handleRegister() {
    const data = await validForm();
    data['roleId'] = formData.roleId;
    data['teamName'] = state['teamValue'];
    data['skills'] = state['skillValue'];
    const { account, phone, password, policy, realName, sms } = data;
    formData.account = account;
    formData.teamName = state.teamValue;
    formData.skills = state.skillValue;
    formData.realName = realName;
    formData.password = password;
    formData.confirmPassword = password;
    formData.phone = phone;
    formData.sms = sms;
    formData.policy = policy;
    if (!data['teamName'].length) {
      if (formData['roleId'] === '3') {
        createMessage.info('请先输入或选择团队!');
        return;
      }
    }
    userStore.regUser(data).then((res) => {
      for (let name in formData) {
        switch (name) {
          case 'roleId':
            formData['roleId'] = '3';
            break;
          case 'teamName':
            formData['teamName'] = [];
            break;
          case 'skills':
            formData['skills'] = [];
            break;
          case '':
            formData['policy'] = false;
            break;
          default:
            formData[name] = '';
            break;
        }
      }
      if (res === '注册成功') setLoginState(LoginStateEnum.LOGIN);
    });
    if (!data) return;
  }
</script>
<style lang="less" scoped>
  .role_wrap {
    ::v-deep(.ant-form-item-control-input-content) {
      display: flex;
      align-items: center;
      .ant-select-selector {
        display: flex;
        align-items: center;
      }
      .ant-input {
        height: inherit;
        height: 40px;
        font-size: 16px;
      }
    }
    .add_button {
      margin-left: 10px;
      cursor: pointer;
      transition: .3s;
      &:hover {
        color: #2a7dc9;
      }
    }
  }
  .select-wrap {
    width: 100%;
    height: 40px;
    ::v-deep(.ant-select-selector) {
      height: inherit;
      font-size: 16px;
    }
  }
</style>
