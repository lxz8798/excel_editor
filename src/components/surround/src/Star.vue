<script lang="ts">
  import type { PropType } from 'vue';
  import { defineComponent } from 'vue';
  import { RoleEnum } from '/@/enums/roleEnum';

  export default defineComponent({
    name: 'Star',
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
