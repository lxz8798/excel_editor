<template>
  <MenuItem :item="item" :name="item.path" v-bind="$props" :class="getLevelClass" v-if="!menuHasChildren(item) && getShowMenu" @click="setMenuShowState">
    <Icon v-if="getIcon" :icon="getIcon" :size="16" />
    <div v-if="collapsedShowTitle && getIsCollapseParent" class="mt-1 collapse-title">
      {{ getI18nName }}
    </div>
    <template #title>
      <span :class="['ml-2', `${prefixCls}-sub-title`]">
        <!-- 这里是子级 -->
        {{ getI18nName }}
      </span>
      <SimpleMenuTag :item="item" :collapseParent="getIsCollapseParent" />
    </template>
  </MenuItem>
  <SubMenu
    v-if="menuHasChildren(item) && getShowMenu"
    :item="item"
    :name="item.path"
    :class="[getLevelClass, theme]"
    :collapsedShowTitle="collapsedShowTitle"
    :draggable="true"
    @dragstart="dragStartHandler($event, item)"
    @drop="dropHandler($event, item)"
    @dragover="e=>e.preventDefault()"
  >
    <template #title>
      <Icon v-if="getIcon" :icon="getIcon" :size="16" />
      <div v-if="collapsedShowTitle && getIsCollapseParent" class="mt-2 collapse-title">
        {{ getI18nName }}
      </div>

      <span v-show="getShowSubTitle" :class="['ml-2', `${prefixCls}-sub-title`]">
        <!-- 这里是父级 -->
        {{ getI18nName }}
      </span>
      <SimpleMenuTag :item="item" :collapseParent="!!collapse && !!parent" />
    </template>
    <template
      v-for="childrenItem in item.children || []"
      :key="childrenItem.paramPath || childrenItem.path"
    >
      <SimpleSubMenu v-bind="$props" :item="childrenItem" :parent="false" />
    </template>
  </SubMenu>
</template>
<script lang="ts">
  import type { PropType } from 'vue';
  import type { Menu } from '/@/router/types';

  import { defineComponent, computed, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Icon from '/@/components/Icon/index';

  import MenuItem from './components/MenuItem.vue';
  import SubMenu from './components/SubMenuItem.vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { Dropdown, Menu as Menuu, Input } from 'ant-design-vue';
  import { useFormStore } from '/@/store/modules/form';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useAppStore } from "/@/store/modules/app";
  const ADropdown = Dropdown;
  const AMenu = Menuu;
  const AMenuItem = Menuu.Item;
  const { createMessage, createConfirm } = useMessage();
  const formStore = useFormStore();
  const permissionStore = usePermissionStore();
  export default defineComponent({
    name: 'SimpleSubMenu',
    components: {
      SubMenu,
      MenuItem,
      SimpleMenuTag: createAsyncComponent(() => import('./SimpleMenuTag.vue')),
      Icon,
      ADropdown,
      AMenu,
      AMenuItem,
      Input,
    },
    props: {
      item: {
        type: Object as PropType<Menu>,
        default: () => ({}),
      },
      parent: propTypes.bool,
      collapsedShowTitle: propTypes.bool,
      collapse: propTypes.bool,
      theme: propTypes.oneOf(['dark', 'light']),
    },
    setup(props) {
      const { setMenuSetting } = useMenuSetting();
      const { t } = useI18n();
      const { prefixCls } = useDesign('simple-menu');
      const sourceItem = ref(null);
      const getShowMenu = computed(() => !props.item?.meta?.hideMenu);
      const getIcon = computed(() => props.item?.icon);
      const getI18nName = computed(() =>
        t(props.item?.name.split('-')[props.item?.name.split('-').length - 1]),
      );
      const getShowSubTitle = computed(() => !props.collapse || !props.parent);
      const getIsCollapseParent = computed(() => !!props.collapse && !!props.parent);
      const getLevelClass = computed(() => {
        return [
          {
            [`${prefixCls}__parent`]: props.parent,
            [`${prefixCls}__children`]: !props.parent,
          },
        ];
      });
      function setMenuShowState() {
        setMenuSetting({ menuWidth: 0, mixSideFixed: false });
      }
      function menuHasChildren(menuTreeItem: Menu): boolean {
        return (
          !menuTreeItem.meta?.hideChildrenInMenu &&
          Reflect.has(menuTreeItem, 'children') &&
          !!menuTreeItem.children &&
          menuTreeItem.children.length > 0
        );
      }
      function getMenuData(item) {
        const params = {
          upMenuId: item['id'],
          downMenuId: sourceItem.value['id'],
        };
        // 发送请求获取菜单数据
        formStore.setSwapOrderNo(params).then((res) => {
          permissionStore.buildRoutesAction();
          permissionStore.setLastBuildMenuTime();
          setMenuShowState();
          createMessage.success('修改成功!');
        });
      }
      function dragStartHandler(event, item) {
        event.stopPropagation();
        if (item['meta'].type !== '1') {
          createMessage.warning('该类目不可更改顺序，请在项目上操作!');
          return;
        }
        // 在拖拽开始时，设置被拖拽元素的数据
        event.dataTransfer.setData('text/plain', JSON.stringify(item));
      }
      function dropHandler(event, item) {
        // 在拖拽结束时，获取被拖拽元素的数据以及放置位置的数据，发送请求保存数据
        event.preventDefault();
        event.stopPropagation();
        if (item['meta'].type !== '1') {
          createMessage.warning('该类目不可更改顺序，请在项目上操作!');
          return;
        }
        sourceItem.value = JSON.parse(event.dataTransfer.getData('text/plain'));
        let tempSort1 = sourceItem.value['meta'].orderNo, tempSort2 = item['meta'].orderNo;

        sourceItem.value['meta'].orderNo = tempSort2;
        item['meta'].orderNo = tempSort1;

        // 发送请求更新菜单项位置信息
        // 更新完后重新获取菜单数据
        getMenuData(item);
      }
      return {
        prefixCls,
        menuHasChildren,
        setMenuShowState,
        getShowMenu,
        getIcon,
        getI18nName,
        getShowSubTitle,
        getLevelClass,
        getIsCollapseParent,
        dragStartHandler,
        dropHandler,
      };
    },
  });
</script>
