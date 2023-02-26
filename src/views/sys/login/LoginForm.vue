<template>
  <div class="my-auto" v-if="getLoginState === 0 || getLoginState === 3">
    <img :alt="title" src="../../../assets/svg/login-box-bg.svg" class="w-1/2 -mt-16 -enter-x" />
    <div class="mb-30 font-medium text-white -enter-x">
      <span class="inline-block mt-4 text-3xl line-animate" style="color: #0960bd">
        {{ t('sys.login.signInTitle') }}</span
      >
    </div>
    <!--<div class="mt-5 font-normal text-white dark:text-gray-500 -enter-x">
      {{ t('sys.login.signInDesc') }}
    </div>-->
  </div>
  <Satellite />
  <LoginFormTitle v-show="getShow" class="enter-x" />
  <Form
    class="p-4 enter-x"
    :model="formData"
    :rules="getFormRules"
    ref="formRef"
    v-show="getShow"
    @keypress.enter="handleLogin"
  >
    <FormItem name="account" class="enter-x account_form">
      <Input
        size="large"
        v-model:value="formData.account"
        :placeholder="t('sys.login.userName')"
        class="fix-auto-fill"
      />

    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword
        size="large"
        visibilityToggle
        v-model:value="formData.password"
        :placeholder="t('sys.login.password')"
      />
    </FormItem>

    <ARow class="enter-x">
      <ACol :span="12">
        <FormItem>
          <!-- No logic, you need to deal with it yourself -->
          <Checkbox v-model:checked="rememberMe" size="small">
            {{ t('sys.login.rememberMe') }}
          </Checkbox>
        </FormItem>
      </ACol>
      <ACol :span="12">
        <FormItem :style="{ 'text-align': 'right' }">
          <!-- No logic, you need to deal with it yourself -->
          <Button type="link" size="small" @click="setLoginState(LoginStateEnum.RESET_PASSWORD)">
            {{ t('sys.login.forgetPassword') }}
          </Button>
        </FormItem>
      </ACol>
    </ARow>

    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </Button>
      <!-- <Button size="large" class="mt-4 enter-x" block @click="handleRegister">
        {{ t('sys.login.registerButton') }}
      </Button> -->
    </FormItem>
    <ARow class="enter-x justify-between">
      <ACol :md="12" :xs="24">
        <Button block @click="setLoginState(LoginStateEnum.MOBILE)">
          {{ t('sys.login.mobileSignInFormTitle') }}
        </Button>
      </ACol>
      <!--<ACol :md="8" :xs="24" class="!my-2 !md:my-0 xs:mx-0 md:mx-2">
        <Button block @click="setLoginState(LoginStateEnum.QR_CODE)">
          {{ t('sys.login.qrSignInFormTitle') }}
        </Button>
      </ACol>-->
      <ACol :md="11" :xs="24">
        <Button block @click="setLoginState(LoginStateEnum.REGISTER)">
          {{ t('sys.login.registerButton') }}
        </Button>
      </ACol>
    </ARow>
    <!--  其他登录方式  -->
    <!--<Divider class="enter-x">{{ t('sys.login.otherSignIn') }}</Divider>-->
    <!--  其他登录方式入口，如微信登录、支付宝登录等等  -->
    <!--<div class="flex justify-evenly enter-x" :class="`${prefixCls}-sign-in-way`">
      <GithubFilled />
      <WechatFilled />
      <AlipayCircleFilled />
      <GoogleCircleFilled />
      <TwitterCircleFilled />
    </div>-->
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed } from 'vue';
  // 被注释的其他组件可能会用到 Divider
  import { Checkbox, Form, Input, Row, Col, Button } from 'ant-design-vue';
  // import {
  //   GithubFilled,
  //   WechatFilled,
  //   AlipayCircleFilled,
  //   GoogleCircleFilled,
  //   TwitterCircleFilled,
  // } from '@ant-design/icons-vue';
  import LoginFormTitle from './LoginFormTitle.vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';

  const ACol = Col;
  const ARow = Row;
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { notification, createErrorModal } = useMessage();
  const { prefixCls } = useDesign('login');
  const userStore = useUserStore();
  import { useRouter } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';
  const { setLoginState, getLoginState } = useLoginState();
  const { getFormRules } = useFormRules();

  const formRef = ref();
  const loading = ref(false);
  const rememberMe = ref(false);
  const formData = reactive({
    account: '',
    password: '',
  });

  const { validForm } = useFormValid(formRef);
  const router = useRouter();
  const go = useGo();
  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const type = userStore.getGotoDocID;
      const userInfo = await userStore.login({
        // goHome: type !== '' ? router.push(`/${type}/form`) : '/account/center',
        // goHome: '/account/center',
        redirect: type !== '' ? `/${type}/form` : '/account/center',
        // AES.encrypt(data.password, 'exam_repot!QAZ2wsx202212') // 这个是AES加密，因服务器SDK不得行，所以不能用
        password: data.password,
        account: data.account,
        mode: 'none', //不要默认的错误提示
      });
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.realName}`,
          duration: 3,
        });
        // console.log(userInfo.redirect, 'userInfo.redirect');
        // console.log(type, 'type');
        // window.location.href = 'http://' + window.location.href.split('/')[2] + type;
        // console.log(window.location.href, 'window.location.href');
        location.reload();
      }
    } catch (error) {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
    } finally {
      loading.value = false;
    }
  }

  function registerHandler() {
    setLoginState(LoginStateEnum.REGISTER);

  }
</script>
<style lang="less">
  .account_form {
    .ant-form-item-control-input-content {
      display: flex;
      align-items: center;
    }
  }
  .line-animate {
    display: inline-block;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 85%;
      border-right: 2px solid #0960bd;
      transform: translate(10px, 15%);
      animation: fadenum 1s infinite;
    }
  }
  @keyframes fadenum {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
