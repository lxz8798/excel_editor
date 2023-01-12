<template>
  <Dropdown
    :dropMenuList="getDropMenuList"
    :trigger="getTrigger"
    placement="bottom"
    overlayClassName="multiple-tabs__dropdown"
    @menu-event="handleMenuEvent"
  >
    <div :class="`${prefixCls}__info`" @contextmenu="handleContext" v-if="getIsTabs">
      <span class="ml-1">{{ getTitle }}</span>
      <!--<span class="ml-1" v-else>{{ getCurrTempTitle }}</span>-->
    </div>
    <span :class="`${prefixCls}__extra-quick`" v-else @click="handleContext">
      <Icon icon="ion:chevron-down" />
    </span>
  </Dropdown>
</template>
<script lang="ts">
  import type { PropType } from 'vue';
  import type { RouteLocationNormalized } from 'vue-router';

  import { defineComponent, computed, unref, toRaw, onMounted } from 'vue';
  import { Dropdown } from '/@/components/Dropdown/index';
  import { Icon } from '/@/components/Icon';

  import { TabContentProps } from '../types';

  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useTabDropdown } from '../useTabDropdown';
  import { useFormStore } from '/@/store/modules/form';

  const formStore = useFormStore();

  export default defineComponent({
    name: 'TabContent',
    components: { Dropdown, Icon },
    props: {
      tabItem: {
        type: Object as PropType<RouteLocationNormalized>,
        default: null,
      },
      isExtra: Boolean,
    },
    setup(props) {
      const currTemp = computed(() => JSON.parse(localStorage.getItem('currTemp')));
      const { prefixCls } = useDesign('multiple-tabs-content');
      const { t } = useI18n();

      const isCurrTemp = computed(() => {
        const range = ['/medical', '/architecture', '/mineral', '/petroleum'];
        return range.some((i) => window.location.href.includes(i));
      });

      const getCurrTempTitle = computed(() => currTemp.value.name);

      const getTitle = computed(() => {
        const { tabItem: { meta } = {} } = props;
        return meta && meta.title.includes('工程') ? getCurrTempTitle : t(meta.title as string);
      });

      const getIsTabs = computed(() => !props.isExtra);

      const getTrigger = computed((): ('contextmenu' | 'click' | 'hover')[] =>
        unref(getIsTabs) ? ['contextmenu'] : ['click'],
      );

      const { getDropMenuList, handleMenuEvent, handleContextMenu } = useTabDropdown(
        props as TabContentProps,
        getIsTabs,
      );

      function handleContext(e) {
        props.tabItem && handleContextMenu(props.tabItem)(e);
      }

      return {
        prefixCls,
        getDropMenuList,
        handleMenuEvent,
        handleContext,
        getTrigger,
        getIsTabs,
        isCurrTemp,
        getTitle,
        getCurrTempTitle,
        currTemp,
      };
    },
  });
</script>
