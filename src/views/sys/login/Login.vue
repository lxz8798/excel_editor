<template>
  <div :class="prefixCls" class="relative w-full h-full px-4">
    <div class="flex items-center absolute right-4 top-4">
      <AppDarkModeToggle class="enter-x mr-2" v-if="!sessionTimeout" />
      <AppLocalePicker
        class="text-white enter-x xl:text-gray-600"
        :show-text="false"
        v-if="!sessionTimeout && showLocale"
      />
    </div>

    <!--<span class="-enter-x xl:hidden">
      <AppLogo :alwaysShowTitle="true" />
    </span>-->

    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full">
        <!-- 登录页面左侧AD -->
        <div class="hidden min-h-full pl-4 mr-4 xl:flex xl:flex-col xl:w-6/12">
          <!--<AppLogo class="-enter-x" />
          <div class="my-auto">
            <img
              :alt="title"
              src="../../../assets/svg/login-box-bg.svg"
              class="w-1/2 -mt-16 -enter-x"
            />
            <div class="mt-10 font-medium text-white -enter-x">
              <span class="inline-block mt-4 text-3xl"> {{ t('sys.login.signInTitle') }}</span>
            </div>
            <div class="mt-5 font-normal text-white dark:text-gray-500 -enter-x">
              {{ t('sys.login.signInDesc') }}
            </div>
          </div>
          <Satellite />-->
          <div class="plant_wrap -enter-x">
            <div class="circle box1 animate-pulse">
              <p>封堵</p>
            </div>
            <div class="circle box2 animate-pulse">
              <p>理论</p>
            </div>
            <div class="circle box3 animate-pulse">
              <p>方法</p>
            </div>
            <div class="circle box4 animate-pulse">
              <p>工艺</p>
            </div>
            <div class="plant">
              <div class="ball"><p>石油工程</p></div>
              <div class="ball second"><p>建筑工程</p></div>
              <div class="ball third"><p>医学工程</p></div>
              <div class="ball fourth"><p>矿业工程</p></div>
              <div class="ball fifth"><p>...</p></div>
            </div>
          </div>
        </div>
        <!-- 登录栏 -->
        <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12">
          <div
            :class="`${prefixCls}-form`"
            class="relative w-full px-5 py-8 mx-auto my-auto rounded-md shadow-md xl:ml-16 xl:bg-transparent sm:px-8 xl:p-4 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto enter-x"
          >
            <LoginForm />
            <ForgetPasswordForm />
            <RegisterForm />
            <MobileForm />
            <QrCodeForm />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, onMounted } from 'vue';
  // import { AppLogo } from '/@/components/Application';
  // import { Satellite } from '/@/components/surround';
  import { AppLocalePicker, AppDarkModeToggle } from '/@/components/Application';
  import LoginForm from './LoginForm.vue';
  import ForgetPasswordForm from './ForgetPasswordForm.vue';
  import RegisterForm from './RegisterForm.vue';
  import MobileForm from './MobileForm.vue';
  import QrCodeForm from './QrCodeForm.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLocaleStore } from '/@/store/modules/locale';
  import { useUserStore } from '/@/store/modules/user';
  import { getFromTemplateList } from '/@/api/demo/form';
  import { useFormStore } from '/@/store/modules/form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  // const router = useRouter();
  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });
  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const userStore = useUserStore();
  const formStore = useFormStore();
  const { createMessage } = useMessage();
  // 点击小球把ID存起来
  // getFromTemplateList().then((template) => {
  //   if (template.length) {
  //     formStore.setTempList(template);
  //     const $balls = document.querySelectorAll('.ball');
  //     template.forEach((temp, key) => {
  //       const $p = document.createElement('p');
  //       $p.innerText = temp.templateTitle.replace('检测报告单', '报告').replace('天然气', ' ');
  //       // $p.dataset.templateId = t.id;
  //       $balls[key].appendChild($p);
  //       $balls[key].addEventListener('click', () => {
  //         userStore.setGotoDocID(temp.id);
  //         if (!Object.keys(userStore.getUserInfo).length) {
  //           createMessage.warning(t('component.verify.loginFail'));
  //         }
  //       });
  //     });
  //   }
  // });
  // function toEditDocHandler(e) {
  //   userStore.setGotoDocID(e);
  // }
  const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';
  @countdown-prefix-cls: ~'@{namespace}-countdown-input';
  @dark-bg: #293146;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg;

      &::before {
        background-image: url(/@/assets/svg/login-bg-dark.svg);
      }

      .ant-input,
      .ant-input-password {
        background-color: #232a3b;
      }

      .ant-btn:not(.ant-btn-link):not(.ant-btn-primary) {
        border: 1px solid #4a5569;
      }

      &-form {
        background: transparent !important;
      }

      .app-iconify {
        color: #fff;
      }
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }
  }

  .@{prefix-cls} {
    height: 100%;
    min-height: 100%;
    overflow: hidden;
    @media (max-width: @screen-xl) {
      background-color: #293146;

      .@{prefix-cls}-form {
        background-color: #fff;
      }
    }

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin-left: -48%;
      background-image: url(/@/assets/svg/login-bg.svg);
      background-position: 100%;
      background-repeat: no-repeat;
      background-size: auto 100%;
      content: '';
      @media (max-width: @screen-xl) {
        display: none;
      }
    }

    .@{logo-prefix-cls} {
      position: absolute;
      top: 12px;
      height: 30px;

      &__title {
        font-size: 16px;
        color: #fff;
      }

      img {
        width: 32px;
      }
    }

    .container {
      .@{logo-prefix-cls} {
        display: flex;
        width: 60%;
        height: 80px;

        &__title {
          font-size: 24px;
          color: #fff;
        }

        img {
          width: 48px;
        }
      }
    }

    &-sign-in-way {
      .anticon {
        font-size: 22px;
        color: #888;
        cursor: pointer;

        &:hover {
          color: @primary-color;
        }
      }
    }

    input:not([type='checkbox']) {
      min-width: 360px;

      @media (max-width: @screen-xl) {
        min-width: 320px;
      }

      @media (max-width: @screen-lg) {
        min-width: 260px;
      }

      @media (max-width: @screen-md) {
        min-width: 240px;
      }

      @media (max-width: @screen-sm) {
        min-width: 160px;
      }
    }

    .@{countdown-prefix-cls} input {
      min-width: unset;
    }

    .ant-divider-inner-text {
      font-size: 12px;
      color: @text-color-secondary;
    }
  }

  @keyframes planet-rotate {
    0% {
      transform: rotate(30deg) scaleY(0.5) rotate(0); // 倾斜30度
    }
    100% {
      transform: rotate(30deg) scaleY(0.5) rotate(360deg);
    }
  }

  /* // 自转动画 */
  @keyframes self-rotate {
    0% {
      transform: rotate(0) scaleY(2) rotate(-30deg);
    }
    100% {
      transform: rotate(-360deg) scaleY(2) rotate(-30deg);
    }
  }

  .plant_wrap {
    width: 100%;
    height: 100%;
    //background: url(/@/assets/images/plane.png) no-repeat center center / 25%;
    display: flex;
    justify-content: center;
    align-items: center;

    .circle,
    .plant {
      border: 2px solid #13c2c2;
    }

    .circle {
      width: 200px;
      height: 200px;
      border-radius: 50%;

      position: absolute;

      display: flex;
      justify-content: center;
      align-items: center;

      > p {
        font-size: 16px;
        writing-mode: vertical-lr;
        color: white;
        letter-spacing: 8px;

        transform: translateY(10px);
      }
    }

    .circle.box1 {
      width: 120px;
      height: 120px;
      background: rgba(164, 140, 85, 0.3);
    }

    .circle.box2 {
      width: 220px;
      height: 220px;
      background: rgba(46, 186, 45, 0.3);
      > p {
        transform: translate(82px, 10px);
      }
    }

    .circle.box3 {
      width: 290px;
      height: 290px;
      background: rgba(16, 193, 149, 0.3);
      > p {
        transform: translate(125px, 10px);
      }
    }

    .circle.box4 {
      width: 350px;
      height: 350px;
      background: rgba(4, 152, 207, 0.3);
      > p {
        transform: translate(158px, 10px);
      }
    }

    .plant {
      position: absolute;

      width: 550px;
      height: 550px;

      transform-style: preserve-3d;
      transform: scaleY(0.1) rotateZ(30deg);
      border-radius: 50%;
      animation: planet-rotate 16s linear infinite; // 无限次
    }

    .ball {
      width: 80px;
      height: 80px;
      position: absolute;
      border-radius: 50%;
      background-color: rgba(20, 12, 33, 0.5);
      left: calc(50% - 135px);
      top: -15px;
      text-align: center;
      line-height: 50px;
      color: #13c2c2;

      display: flex;
      justify-content: center;
      align-items: center;

      transform: rotateZ(-30deg) scaleY(2);
      animation: self-rotate 16s linear infinite;

      //animation-name: self-rotate, ping;
      //animation-duration: 16s, 1s;
      //animation-timing-function: linear, cubic-bezier(0, 0, 0.2, 1);
      //animation-iteration-count: infinite;
      cursor: pointer;
      > p {
        padding: 15px;
        font-size: 12px;
        line-height: 18px;
        transform: translateY(5px);
      }
      &:hover {
        transition: 0.3s;
        background-color: rgba(60, 32, 53, 0.5);
      }
    }
    .second {
      left: 30%;
      top: 495px;
    }
    .third {
      left: -10%;
      top: 230px;
    }
    .fourth {
      left: 83%;
      top: 80px;
    }
    .fifth {
      left: 88%;
      top: 380px;
    }
  }
</style>
