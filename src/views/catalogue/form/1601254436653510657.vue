<template>
  <PageWrapper :title="currTempDetail['templateTitle']" contentFullHeight>
    <CollapseContainer :title="`${currTempDetail['templateTitle']}-${currTempDetail['templateDesc']}`">
      <!--autoFocusFirstItem-->
      <!--@reset="handleReset"-->
      <BasicForm @register="register" @submit="handleSubmit" @save="saveFormDatas">
        <template #add="{ field }">
          <Button v-if="Number(field) === 0" @click="add">+</Button>
          <Button v-if="field > 0" @click="del(field)">-</Button>
        </template>
      </BasicForm>
    </CollapseContainer>
  </PageWrapper>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, reactive, toRefs, toRaw } from "vue";
  import { BasicForm, FormSchema, ApiSelect, useForm } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { PageWrapper } from '/@/components/Page';

  import { Select } from 'ant-design-vue';
  import { useFormStore } from '/@/store/modules/form';
  import { useRoute } from 'vue-router';
import { downloadEXCEL } from "/@/api/demo/form";

  const formStore = useFormStore();
  // const schemas: FormSchema[] = [];

  export default defineComponent({
    components: { BasicForm, CollapseContainer, PageWrapper, ApiSelect, ASelect: Select },
    setup() {
      const state = reactive({
        currTempDetail: {},
        schemas: [] as FormSchema[],
      });
      const [register, { appendSchemaByField, setFieldsValue, getFieldsValue, resetFields, validate }] = useForm({
        showResetButton: false,
        labelWidth: 200,
        actionColOptions: { span: 24 },
        schemas: state.schemas,
      });
      const check = ref(null);
      const { createMessage } = useMessage();
      const route = useRoute();
      // 获得当前模板的详情
      formStore.setCurrTemp(route.meta.id as string);
      state.currTempDetail = formStore.getCurrTemp;
      // 获得所有的表单项
      formStore.setInputItems({ templateId: formStore.getCurrTemp['id'] });
      const n = ref(1);

      const addSlotSChema: FormSchema = {
        field: '0',
        component: 'Input',
        label: ' ',
        colProps: {
          span: 8,
        },
        slot: 'add',
      };

      function add() {
        const _id = Math.floor(Math.random() * 1000000) + '';
        n.value = state.schemas.length++;
        if (!state.schemas.map((input) => input.id).includes(_id)) {
          let _obj = state.schemas.length && toRaw(JSON.parse(JSON.stringify(state.schemas[0])));
          _obj['field'] = `field${n.value}`;
          _obj['label'] = '字段' + n.value;
          _obj['id'] = _id;
          _obj['sort'] = n.value;
          appendSchemaByField(_obj, _obj['field'], true);
        }
      }

      function del(field) {
        console.log(field);
        // removeSchemaByField([`k${field}`, `k${field}`, `${field}`]);
        n.value--;
      }

      if (formStore.getInputItems.length) {
        formStore.getInputItems.forEach((input) => {
          if (!state.schemas.some((i) => input['id'] === i['id'])) {
            input.required = false;
            input.colProps = { span: 11 };
            state.schemas.push(input);
          }
        });
        if (!state.schemas.some((i) => i['field'] === '0')) {
          state.schemas.push(addSlotSChema as any);
        }
      };
      return {
        ...toRefs(state),
        add,
        del,
        register,
        saveFormDatas: (inputs: any) => {
          console.log(inputs, 'inputs');
          state.schemas.map((i) => {
            Object.keys(inputs).forEach((k) => {
              if(i['field'] === k) {
                i['inputValue'] = inputs[k];
              }
            });
            return i;
          });
          formStore.saveForm(state.schemas);
        },
        // onSearch: useDebounceFn(onSearch, 300),
        // searchParams,
        handleSubmit: async (values: any) => {
          const a = document.createElement('a');
          a.href = `http://xiaoshu.gz2vip.91tunnel.com/excel/downLoadExcel?templateId=${state.currTempDetail['id']}`;
          document.body.appendChild(a);
          a.click();//触发下载
          document.body.removeChild(a);
          // downloadEXCEL({ templateId: state.currTempDetail['id'] })
          // createMessage.success('click search,values:' + JSON.stringify(values));
        },
        check,
      };
    },
  });
</script>
