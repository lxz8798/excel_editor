<template>
  <PageWrapper :title="currTempDetail['templateTitle']" contentFullHeight>
    <CollapseContainer :title="`${currTempDetail['templateTitle']}-${currTempDetail['templateDesc']}`">
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
import { defineComponent, ref, reactive, toRefs, nextTick, toRaw } from "vue";
  import { useRoute } from 'vue-router';
  import { BasicForm, FormSchema, ApiSelect } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { PageWrapper } from '/@/components/Page';

  import { Select } from 'ant-design-vue';
  import { useFormStore } from '/@/store/modules/form';

  const formStore = useFormStore();
  const schemas: FormSchema[] = [];

  export default defineComponent({
    components: { BasicForm, CollapseContainer, PageWrapper, ApiSelect, ASelect: Select },
    setup() {
      const check = ref(null);
      const { createMessage } = useMessage();
      const keyword = ref<string>('');

      const route = useRoute();

      const state = reactive({
        currTempDetail: {},
      });
      // 获得当前模板的详情
      formStore.setCurrTemp(route.meta.id as string);
      state.currTempDetail = formStore.getCurrTemp;
      // 获得所有的表单
      formStore.setInputItems({ templateId: formStore.getCurrTemp['id'] });
      if (formStore.getInputItems.length) {
        // let _obj: FormSchema = {
        //   field: formStore.getInputItems[i]['field'],
        //   component: 'Input',
        //   label: formStore.getInputItems[i]['label'],
        //   colProps: {
        //     span: 8,
        //   },
        // };
        // let _obj: FormSchema = Object.values(formStore.getInputItems[i]).map(i => i)
        delete formStore.getInputItems[0]['inputOn'];
        delete formStore.getInputItems[0]['inputValue'];
        delete formStore.getInputItems[0]['id'];
        // delete formStore.getInputItems[0]['component'] = 'Input';
        // formStore.getInputItems[0]['colProps'] = {
        //   span: 8,
        // };
        // console.log(formStore.getInputItems[0]);
        formStore.getInputItems.forEach((input) => {
          if (!schemas.some((i) => input['id'] === i['id'])) {
            schemas.push(formStore.getInputItems[0]);
          }
        });
        // formStore.getInputItems.forEach((input) => {
        //   Object.keys(input).forEach((k) => {
        //     if (input[k] && input[k] !== '') {
        //       console.log(input[k]);
        //       let _obj: FormSchema = {
        //         field: k === 'field' && input[k],
        //       };
        //     }
        //   });
        // });
      }
      return {
        schemas,
        ...toRefs(state),
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
