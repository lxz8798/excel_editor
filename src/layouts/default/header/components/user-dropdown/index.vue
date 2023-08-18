<template>
  <Dropdown placement="bottomLeft" :overlayClassName="`${prefixCls}-dropdown-overlay`">
    <span :class="[prefixCls, `${prefixCls}--${theme}`]" class="flex">
      <img :class="`${prefixCls}__header`" :src="getUserInfo.avatar" />
      <span :class="`${prefixCls}__info hidden md:block`">
        <span :class="`${prefixCls}__name  `" class="truncate">
          {{ getUserInfo.realName }}
        </span>
      </span>
    </span>

    <template #overlay>
      <Menu @click="handleMenuClick">
        <!--<MenuItem
          key="doc"
          :text="t('layout.header.dropdownItemDoc')"
          icon="ion:document-text-outline"
          v-if="getShowDoc"
        />
        <MenuDivider v-if="getShowDoc" />-->
        <MenuItem
          v-if="getUseLockPage"
          key="lock"
          :text="t('layout.header.tooltipLock')"
          icon="ion:lock-closed-outline"
        />
        <MenuItem
          v-if="getUseLockPage"
          key="changePassword"
          :text="t('routes.demo.system.password')"
          icon="mdi:password-check-outline"
        />
        <MenuItem
          key="logout"
          :text="t('layout.header.dropdownItemLoginOut')"
          icon="ion:power-outline"
        />
      </Menu>
    </template>
  </Dropdown>
  <LockAction @register="register" />
</template>
<script lang="ts">
  // components
  import { Dropdown, Menu, Input } from 'ant-design-vue';
  import type { MenuInfo } from 'ant-design-vue/lib/menu/src/interface';

  import { defineComponent, computed, h } from 'vue';

  import { DOC_URL } from '/@/settings/siteSetting';

  import { useUserStore } from '/@/store/modules/user';
  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';

  import headerImg from '/@/assets/images/header.jpg';
  import { propTypes } from '/@/utils/propTypes';
  import { openWindow } from '/@/utils';

  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { delProject, getOwnerProjectList } from '/@/api/sys/project';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { editUserPermissions } from "/@/api/sys/user";
  type MenuEvent = 'logout' | 'doc' | 'lock' | 'changePassword';
  export default defineComponent({
    name: 'UserDropdown',
    components: {
      Dropdown,
      Menu,
      MenuItem: createAsyncComponent(() => import('./DropMenuItem.vue')),
      MenuDivider: Menu.Divider,
      LockAction: createAsyncComponent(() => import('../lock/LockModal.vue')),
    },
    props: {
      theme: propTypes.oneOf(['dark', 'light']),
    },
    setup() {
      const { prefixCls } = useDesign('header-user-dropdown');
      const { t } = useI18n();
      const { getShowDoc, getUseLockPage } = useHeaderSetting();
      const userStore = useUserStore();
      const { createMessage, createConfirm } = useMessage();
      const getUserInfo = computed(() => {
        const { realName = '', avatar, desc } = userStore.getUserInfo || {};
        return { realName, avatar: avatar || headerImg, desc };
      });

      const [register, { openModal }] = useModal();

      function handleLock() {
        openModal(true);
      }

      //  login out
      function handleLoginOut() {
        sessionStorage.clear('isNewUser');
        userStore.confirmLoginOut();
      }

      // open doc
      function openDoc() {
        openWindow(DOC_URL);
      }

      // changePassword
      function changePasswordHandle() {
        let _passwordValue = '';
        let _confirmPasswordValue = '';
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '修改密码!'),
          content: () => {
            return h('div', { className: 'changePsswordWrap' }, [
              h('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '15px' } }, [h('label', { style: { width: '120px', paddingRight: '5px', textAlignLast: 'justify' } }, '输入密码：'), h(Input, { placeholder: '请输入密码', type: 'password', onChange: e => _passwordValue = e.target.value })]),
              h('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '15px' } }, [h('label', { style: { width: '120px', paddingRight: '5px', textAlignLast: 'justify' } }, '确认密码：'), h(Input, { placeholder: '请确认密码', type: 'password', onChange: e => _confirmPasswordValue = e.target.value })]),
            ]);
          },
          onOk: async () => {
            if (_passwordValue !== _confirmPasswordValue) {
              createMessage.warning('密码不一致, 请重新输入');
            } else {
              editUserPermissions({ password: _passwordValue, id: userStore.getUserInfo.userId, phone: userStore.getUserInfo.phone }).then((res) => {
                createMessage.success('密码修改成功!');
                userStore.logout();
                window.location.reload();
              });
            }
          },
        });
      }

      function handleMenuClick(e: MenuInfo) {
        switch (e.key as MenuEvent) {
          case 'logout':
            handleLoginOut();
            break;
          case 'doc':
            openDoc();
            break;
          case 'lock':
            handleLock();
            break;
          case 'changePassword':
            changePasswordHandle();
            break;
        }
      }

      return {
        prefixCls,
        t,
        getUserInfo,
        handleMenuClick,
        getShowDoc,
        register,
        getUseLockPage,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-user-dropdown';

  .@{prefix-cls} {
    height: @header-height;
    padding: 0 0 0 10px;
    padding-right: 10px;
    overflow: hidden;
    font-size: 12px;
    cursor: pointer;
    align-items: center;

    img {
      width: 24px;
      height: 24px;
      margin-right: 12px;
    }

    &__header {
      border-radius: 50%;
    }

    &__name {
      font-size: 14px;
    }

    &--dark {
      &:hover {
        background-color: @header-dark-bg-hover-color;
      }
    }

    &--light {
      &:hover {
        background-color: @header-light-bg-hover-color;
      }

      .@{prefix-cls}__name {
        color: @text-color-base;
      }

      .@{prefix-cls}__desc {
        color: @header-light-desc-color;
      }
    }

    &-dropdown-overlay {
      .ant-dropdown-menu-item {
        min-width: 160px;
      }
    }
  }
</style>
