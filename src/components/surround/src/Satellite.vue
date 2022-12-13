<template>
  <div class="plant_wrap">
    <div class="ball">ball111</div>
    <div class="ball">ball1</div>
    <div class="ball">ball1</div>
  </div>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import { defineComponent } from 'vue';
  import { RoleEnum } from '/@/enums/roleEnum';

  export default defineComponent({
    name: 'Satellite',
    props: {
      /**
       * Specified role is visible
       * When the permission mode is the role mode, the value value can pass the role value.
       * When the permission mode is background, the value value can pass the code permission value
       * @default ''
       */
      value: {
        type: [Number, Array, String] as PropType<RoleEnum | RoleEnum[] | string | string[]>,
        default: '',
      },
    },
    setup(props, { slots }) {
      console.log(props, slots);
      return () => {
        // Role-based value control
      };
    },
  });
</script>

<style scoped>
  .plant_wrap {
    width: 100%;
    height: 100%;
    background: url(/@/assets/images/plane.png) no-repeat 15% center / 50%;
  }
</style>
