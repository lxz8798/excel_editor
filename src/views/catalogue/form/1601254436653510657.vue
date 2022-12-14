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
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  reactive,
  toRefs,
  toRaw,
  watchEffect
} from "vue";
  import { BasicForm, FormSchema, ApiSelect, useForm } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { PageWrapper } from '/@/components/Page';

  import { Select } from 'ant-design-vue';
  import { useFormStore } from '/@/store/modules/form';
  import { useRoute } from 'vue-router';
  // import { downloadEXCEL } from "/@/api/demo/form";
  import { useUserStore } from '/@/store/modules/user';
  // import { useGlobSetting } from "/@/hooks/setting";
import { useWebSocket } from "@vueuse/core";

  const formStore = useFormStore();
  const userStore = useUserStore();
  // const { wsUrl } = useGlobSetting();
  // const schemas: FormSchema[] = [];

  export default defineComponent({
    components: { BasicForm, CollapseContainer, PageWrapper, ApiSelect, ASelect: Select },
    setup() {
      // 使用消息
      const { createMessage } = useMessage();
      // 使用路由
      const route = useRoute();
      // 获得当前模板的详情
      formStore.setCurrTemp(route.meta.id as string);

      const state = reactive({
        server: 'ws://xiaoshu.gz2vip.91tunnel.com/socket/connection/' + userStore.userInfo.userId,
        sendValue: '',
        recordList: [] as { id: number; time: number; res: string }[],
        sendParams: {
          msg: {},
          type: '5',
          fromId: '',
          toId: '',
          boradFlag: '',
        },
        currTempDetail: {},
        schemas: [] as FormSchema[],
        defaultValues: null,
      });
      // 表单相关业务
      const [register, { appendSchemaByField, setFieldsValue }] = useForm({
        showResetButton: false,
        labelWidth: 200,
        actionColOptions: { span: 24 },
        schemas: state.schemas,
      });
      // 使用websocket
      const { status, data, send, close, open } = useWebSocket(state.server, {
        autoReconnect: false,
        heartbeat: true,
      });

      watchEffect(() => {
        if (data.value) {
          try {
            const res = JSON.parse(data.value);
            state.recordList.push(res);
          } catch (error) {
            state.recordList.push({
              res: data.value,
              id: Math.ceil(Math.random() * 1000),
              time: new Date().getTime(),
            });
          }
        }
      });

      const getIsOpen = computed(() => status.value === 'OPEN');
      const getTagColor = computed(() => (getIsOpen.value ? 'success' : 'red'));

      const getList = computed(() => {
        return [...state.recordList].reverse();
      });

      function toggle() {
        if (getIsOpen.value) {
          close();
        } else {
          open();
        }
      }

      state.currTempDetail = formStore.getCurrTemp;
      // 获得所有的表单项
      formStore.setInputItems({ templateId: route.meta.id });
      const n = ref(1);
      // 进入页面获得回显的数据
      let inputItemsValues = {};
      formStore.getInputItems.map((i) => {
        inputItemsValues[i['field']] = i['inputValue'];
      });

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
            input['componentProps'] = ({ schema, formModel }) => {
              // console.log('form:', schema);
              // console.log('formModel:', formModel);
              return {
                placeholder: '自定义placeholder',
                onChange: (e: any) => {
                  state.sendParams.msg = state.schemas.filter((i) => i['templateId'] === route.meta.id)[0];
                  state.sendParams.fromId = userStore.userInfo.userId;
                  console.log(state.sendParams);
                  send(JSON.stringify(state.sendParams));
                },
              };
            };
            state.schemas.push(input);
          }
        });
        if (!state.schemas.some((i) => i['field'] === '0')) {
          state.schemas.push(addSlotSChema as any);
        }
      }
      onMounted(() => {
        Object.keys(inputItemsValues).length && setFieldsValue(inputItemsValues);
      });
      return {
        ...toRefs(state),
        add,
        del,
        register,
        saveFormDatas: (inputs: any) => {
          // state.schemas.map((i) => {
          //   Object.keys(inputs).forEach((k) => {
          //     if(i['field'] === k) {
          //       i['inputValue'] = inputs[k];
          //     }
          //   });
          //   return i;
          // });
          delete inputs['0'];
          // setFieldsValue(inputs);
          const isSave = formStore.setDefaultValues(inputs);
          formStore.saveForm(state.schemas);
          console.log(isSave);
          createMessage.success('保存成功!');
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
        getList,
        toggle,
        getIsOpen,
        getTagColor,
      };
    },
  });
</script>
