<template>
  <PageWrapper :title="currTempDetail['templateTitle']" contentFullHeight>
    <CollapseContainer
      class="form_wrap"
      :title="`${currTempDetail['templateTitle']}-${currTempDetail['templateDesc']}`"
    >
      <div class="form">
        <div
          class="form_item"
          v-for="(form, index) in [...basicFormHeader, ...dynamicFormHeader]"
          :key="index"
        >
          <div class="row">{{ form.label }}</div>
          <div
            class="column"
            v-for="(input, key) in form.inputs"
            :key="key"
            :class="input.type === 'add' && 'add_icon'"
            @click="clickInputItem($event, input, form)"
          >
            <Input
              size="large"
              v-model:value="input.value"
              :item="input"
              v-if="input.type === 'input'"
              @change="changeInputeValue($event, input)"
            />
            <PlusSquareOutlined style="cursor: pointer" v-else-if="input.type === 'add'" />
          </div>
        </div>
      </div>
      <BasicForm @register="register" @submit="handleSubmit" @save="saveFormDatas">
        <template #add="{ field }">
          <!--<div class="roll">
            <ul>
              <li v-for="msg in recordList">{{msg.value}}</li>
            </ul>
          </div>-->
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
    watchEffect,
  } from 'vue';
  import { BasicForm, FormSchema, ApiSelect, useForm } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { PageWrapper } from '/@/components/Page';

  import { Select } from 'ant-design-vue';
  import { PlusSquareOutlined } from '@ant-design/icons-vue';
  import { useFormStore } from '/@/store/modules/form';
  import { useRoute } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import { useWebSocket } from '@vueuse/core';
  import { useGlobSetting } from '/@/hooks/setting';

  const formStore = useFormStore();
  const userStore = useUserStore();
  const { wsUrl, apiUrl } = useGlobSetting();

  export default defineComponent({
    components: {
      BasicForm,
      CollapseContainer,
      PageWrapper,
      ApiSelect,
      ASelect: Select,
      PlusSquareOutlined,
    },
    setup() {
      // 使用消息
      const { createMessage } = useMessage();
      // 使用路由
      const route = useRoute();
      // 获得当前模板的详情
      formStore.setCurrTemp(route.meta.id as string);
      // STATE
      const state = reactive({
        server: wsUrl + userStore.userInfo.userId,
        sendValue: '',
        recordList: [] as { id: number; time: number; res: string }[],
        sendParams: {
          msg: {},
          type: '5',
          fromId: '',
          toId: '',
          boradFlag: '',
        },
        basicFormHeader: [
          {
            templateId: route.meta.id,
            label: '检测项目',
            inputs: [
              {
                type: 'add',
                value: '',
              },
            ],
          },
          {
            templateId: route.meta.id,
            label: '性能指标',
            inputs: [
              {
                type: 'add',
                value: '',
              },
            ],
          },
          {
            templateId: route.meta.id,
            label: '检测数据',
            inputs: [
              {
                type: 'add',
                value: '',
              },
            ],
          },
        ],
        dynamicFormHeader: [
          {
            templateId: route.meta.id,
            label: '是否合格',
            inputs: [
              {
                type: 'add',
                value: '',
              },
            ],
          },
        ],
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

      function changeInputeValue(e, input) {
        input.value = e.target.value;
        let msgObj = {
          type: '5',
          fromId: userStore.userInfo.userId,
          toId: '',
          boradFlag: '',
          msg: input,
        };
        send(JSON.stringify(msgObj));
      }

      function clickInputItem(e, input, form) {
        if (input.type !== 'add') return;
        form.inputs.splice(form.inputs.length - 1, 0, {
          type: 'input',
          value: '',
        });
      }

      state.currTempDetail = formStore.getCurrTemp
        ? formStore.getCurrTemp
        : { templateTitle: '暂无信息', templateDesc: '暂无描述' };
      // 获得所有的表单项
      formStore.setInputItems({ templateId: route.meta.id });
      const n = ref(1);
      // 进入页面获得回显的数据
      let inputItemsValues = {};
      formStore.getInputItems.map((i) => {
        inputItemsValues[i['field']] = i['inputValue'];
      });

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
        n.value--;
      }

      onMounted(() => {
        Object.keys(inputItemsValues).length && setFieldsValue(inputItemsValues);
        formStore.setTemplateEcho(route.meta.id).then((res) => {
          const defaultFormHeader = [
            {
              templateId: route.meta.id,
              label: '检测项目',
              inputs: [
                {
                  type: 'add',
                  value: '',
                },
              ],
            },
            {
              templateId: route.meta.id,
              label: '性能指标',
              inputs: [
                {
                  type: 'add',
                  value: '',
                },
              ],
            },
            {
              templateId: route.meta.id,
              label: '检测数据',
              inputs: [
                {
                  type: 'add',
                  value: '',
                },
              ],
            },
          ];
          if (!formStore.getTemplateEcho.length) {
            state.basicFormHeader = defaultFormHeader;
            state.dynamicFormHeader = [];
          } else {
            state.basicFormHeader = formStore.getTemplateEcho.slice(0, 3);
            state.dynamicFormHeader = formStore.getTemplateEcho.slice(3, formStore.getTemplateEcho.length);

            state.basicFormHeader.map((item) => {
              item.inputs.push({
                type: 'add',
                value: '',
              });
              return item;
            });
            state.dynamicFormHeader.map((item) => {
              item.inputs.push({
                type: 'add',
                value: '',
              });
              return item;
            });
          }
        });
      });
      return {
        ...toRefs(state),
        add,
        del,
        register,
        saveFormDatas: (inputs: any) => {
          // setFieldsValue(inputs);
          // formStore.setDefaultValues(schama);
          const _schama = [...state.basicFormHeader, ...state.dynamicFormHeader];
          formStore.saveForm(_schama).then((res) => {
            formStore.setTemplateEcho(route.meta.id);
            state.basicFormHeader = formStore.getTemplateEcho(0, 3);
            state.dynamicFormHeader = formStore.getTemplateEcho(3, formStore.getTemplateEcho.length);
          });
          createMessage.success('保存成功!');
        },
        handleSubmit: async (values: any) => {
          const a = document.createElement('a');
          a.target = '_blank';
          a.href = apiUrl + '/excel/downLoadExcelVertical?templateId=' + route.meta.id;
          document.body.appendChild(a);
          a.click(); //触发下载
          document.body.removeChild(a);
        },
        getList,
        toggle,
        getIsOpen,
        getTagColor,
        changeInputeValue,
        clickInputItem,
      };
    },
  });
</script>
<style lang="less">
  .form_wrap {
    display: flex;
    flex-direction: column;
    .form {
      margin-bottom: 30px;
      width: 100%;
      display: flex;
      flex-direction: row;
      .form_item {
        flex: 1;
        border: 1px solid #ddd;
        .row {
          padding: 8px 0;
          text-align: center;
          border-bottom: 1px solid #ddd;
          background: #4dc6cb;
          color: #085053;
          font-weight: bold;
          font-size: 16px;
        }
        .column {
          input {
            color: #626262;
            font-size: 14px;
            width: 100%;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            padding-left: 8px;
          }
        }
        .column:nth-child(odd) {
          input {
            background: #eee;
          }
        }
        .column.add_icon {
          width: 100%;
          height: 24px;

          display: flex;
          justify-content: center;
          align-items: center;

          &:hover {
            background: #eee;
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
