<template>
  <PageWrapper title="表单2" contentFullHeight>
    <CollapseContainer title="表单2">
      <BasicForm
        autoFocusFirstItem
        :labelWidth="200"
        :schemas="schemas"
        :actionColOptions="{ span: 24 }"
        @submit="handleSubmit"
        @reset="handleReset"
      ></BasicForm>
    </CollapseContainer>
  </PageWrapper>
</template>
<script lang="ts">
  import { computed, defineComponent, unref, ref } from 'vue';
  import { BasicForm, FormSchema, ApiSelect } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { PageWrapper } from '/@/components/Page';

  import { Select } from 'ant-design-vue';
  // import { useFormStore } from "/@/store/modules/form";

  const schemas: FormSchema[] = [];

  export default defineComponent({
    components: { BasicForm, CollapseContainer, PageWrapper, ApiSelect, ASelect: Select },
    setup() {
      const check = ref(null);
      const { createMessage } = useMessage();
      const keyword = ref<string>('');

      // const formStore = useFormStore();

      // schemas.push(
      //   {
      //     field: 'divider-basic',
      //     component: 'Divider',
      //     label: '基础字段',
      //     colProps: {
      //       span: 24,
      //     },
      //   },
      //   {
      //     field: 'field2',
      //     component: 'Input',
      //     label: '带后缀',
      //     defaultValue: '1112',
      //     colProps: {
      //       span: 8,
      //     },
      //     componentProps: {
      //       onChange: (e: any) => {
      //         console.log(e);
      //       },
      //     },
      //     suffix: '天',
      //   },
      // );

      // const searchParams = computed<Recordable>(() => {
      //   return { keyword: unref(keyword) };
      // });

      // function onSearch(value: string) {
      //   keyword.value = value;
      // }

      // async function test2() {
      //   // 这个api会返回code为401的json数据，Http状态码为200
      //   try {
      //     await tokenExpiredApi();
      //   } catch (err) {
      //     console.log('接口访问错误：', (err as Error).message || '错误');
      //   }
      // }

      // async function getTemplateList() {
      // }

      return {
        schemas,
        // onSearch: useDebounceFn(onSearch, 300),
        // searchParams,
        handleReset: () => {
          keyword.value = '';
        },
        handleSubmit: (values: any) => {
          console.log('values', values);
          createMessage.success('click search,values:' + JSON.stringify(values));
        },
        check,
      };
    },
  });
</script>
