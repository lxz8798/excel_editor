<template>
  <PageWrapper :title="currTempDetail.name" contentFullHeight>
    <!--<a-button type="primary" :size="size" style="margin-bottom: 20px;">上传EXCEL</a-button>-->
    <BasicUpload :maxSize="20" :maxNumber="1" style="margin-bottom: 20px;" :api="uploadApi" :accept="['.xlsx']" :uploadParams="uploadParams" @change="handleChange" />
    <CollapseContainer class="form_wrap">
      <template #title>
        <div class="form_title">
          <a-input v-if="currTempDetail && Object.keys(currTempDetail).length" size="large" v-model:value="titleValue" :placeholder="currTempDetail.name.split('-')[1]" style="padding-left: 5px;"></a-input>
          <Icon :icon="'material-symbols:edit-note-rounded'" :title="'修改标题'" size="18" style="margin-left: 5px;" @click="editTemplateTitle" />
        </div>
      </template>
      <div class="form">
        <div
          v-if="mergeForm.length"
          class="form_item"
          v-for="(form, index) in mergeForm"
          :key="index"
        >
          <div class="row">{{ form.label }}</div>
          <div
            class="column"
            v-for="(input, key) in form.inputs"
            :key="key"
            :class="input.type === 'add' && 'add_icon'"
            :data-input="JSON.stringify(input)"
            @click="clickInputItem($event, input, form, key)"
          >
            <Input
              size="large"
              v-model:value="input.value"
              :item="input"
              v-if="input.type === 'input'"
              @change="changeInputeValue($event, input, key)"
            />
            <!--<PlusSquareOutlined style="cursor: pointer" v-else-if="input.type === 'add'" />-->
          </div>
        </div>
      </div>
      <PlusSquareOutlined class="add_icon" style="cursor: pointer" @click="addInputRow" />
      <BasicForm @register="register" @submit="handleSubmit" @save="saveFormDatas" style="margin-top: 25px;">
        <!--<template #add="{ field }">
          <div class="roll">
            <ul>
              <li v-for="msg in recordList">{{msg.value}}</li>
            </ul>
          </div>
          <Button v-if="Number(field) === 0" @click="add">+</Button>
          <Button v-if="field > 0" @click="del(field)">-</Button>
        </template>-->
      </BasicForm>
    </CollapseContainer>
    <!--弹窗-->
    <Modal1 @register="registerModal" :minHeight="100" :options="modalOptions" />
  </PageWrapper>
</template>
<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
    reactive,
    toRefs,
    toRaw,
    watchEffect,
    watch,
    h,
  } from 'vue';
  import { BasicForm, FormSchema, ApiSelect, useForm } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { PageWrapper } from '/@/components/Page';
  import { BasicUpload } from '/@/components/Upload';
  import { Select } from 'ant-design-vue';
  import { PlusSquareOutlined, DownloadOutlined } from '@ant-design/icons-vue';
  import { useFormStore } from '/@/store/modules/form';
  import { useUserStore } from '/@/store/modules/user';
  import { useWebSocket } from '@vueuse/core';
  import { useGlobSetting } from '/@/hooks/setting';
  import { uploadApi } from '/@/api/sys/upload';
  import { useModal } from '/@/components/Modal';
  import Modal1 from './Modal1.vue';
  import { changeInputValueApi } from '/@/api/demo/form';
  import Icon from '/@/components/Icon';
  const formStore = useFormStore();
  const userStore = useUserStore();
  const { wsUrl, apiUrl, uploadUrl } = useGlobSetting();
  export default defineComponent({
    components: {
      Modal1,
      BasicForm,
      CollapseContainer,
      PageWrapper,
      ApiSelect,
      ASelect: Select,
      PlusSquareOutlined,
      DownloadOutlined,
      BasicUpload,
      Icon,
    },
    setup() {
      // 使用消息
      const { createMessage, createConfirm } = useMessage();
      // 获得当前模板的详情
      // formStore.setCurrTemp(state.currTempDetail.id as string);
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
        basicFormHeader: [],
        dynamicFormHeader: [],
        currTempDetail: {},
        schemas: [] as FormSchema[],
        defaultValues: null,
        uploadParams: {},
        no: 0,
        modalOptions: {},
        editTitleFlag: true,
        titleValue: '',
        currTemp: {},
      });
      const [registerModal, { openModal: openModal1 }] = useModal();
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

      const uplpdaNum = computed(() => userStore.getTemplateUpdate);
      watch(
        uplpdaNum,
        () => {
          state.currTemp = computed(() => JSON.parse(sessionStorage.getItem('currTemp')));
          fillForm(state.currTemp);
        },
        { immediate: true, deep: true },
      );
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
      const mergeForm = computed(() => [...state.basicFormHeader, ...state.dynamicFormHeader]);

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

      function changeInputeValue(e, input, index) {
        input.value = e.target.value;
        if (e.target.value !== '') {
          const params = {
            columnIndex: index + 1,
            templateId: input.templateId,
            value: e.target.value,
          };
          changeInputValueApi(params).then((res) => {
            formStore.saveForm(mergeForm.value.slice(1, 5)).then(() => fillForm());
            createMessage.success(res);
          });
        }
      }

      function clickInputItem(e, input, form, key) {
        if (e.target.tagName === 'DIV' && e.target.className === 'column') {
          const { createConfirm } = useMessage();
          createConfirm({
            iconType: 'warning',
            title: () => h('span', '删除有风险!'),
            content: () => h('span', '是否确认删除？'),
            onOk: async () => {
              mergeForm.value.map((i) => {
                i.inputs.splice(key, 1);
                return i;
              });
            },
          });
        }

        if (e.target.tagName === 'INPUT' && e.target.value !== '') {
          openModal1(true);
          const params = {
            columnIndex: key + 1,
            templateId: form.templateId,
          };
          formStore.setColumnDetail(input);
          formStore.setColumnList(params);
        }

        if (input.type !== 'add') return;
        form.inputs.splice(form.inputs.length - 1, 0, {
          type: 'input',
          value: '',
        });
      }

      function addInputRow() {
        mergeForm.value.map((i) => {
          i.inputs.push({
            type: 'input',
            value: '',
          });
          return i;
        });
        state.basicFormHeader[0].inputs[state.no].value = state.no++;
      }

      const n = ref(1);
      // 进入页面获得回显的数据
      // let inputItemsValues = {};
      // formStore.getInputItems.map((i) => {
      //   inputItemsValues[i['field']] = i['inputValue'];
      // });

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

      function noHandler() {
        const _no = { id: '0', label: '序号', sort: 0, inputs: [], templateId: state.currTempDetail.id };
        if (formStore.getTemplateEcho.length) {
          // 从接口返回的数据如果有值的情况下
          let _filter = formStore.getTemplateEcho.filter(((i) => i.label !== '序号'));
          if (_filter[0].inputs.length) {
            for (let i = 0; i < _filter[0].inputs.length; i++) {
              _no.inputs.push({
                type: 'input',
                value: i + '',
              });
            }
          }
          return _no;
        } else {
          // 没值前端就给默认
          return _no;
        }
      }

      function fillForm(currTemp) {
        // formStore.setCurrTemp(item);
        // 获得所有的表单项
        state.currTempDetail = currTemp;
        if (state.currTempDetail && Object.keys(state.currTempDetail).length) {
          const _id = state.currTempDetail.id;
          state.uploadParams = { templateId:  state.currTempDetail.id};
          formStore.setBasicTemplate(_id);
          userStore.setGotoDocID(_id as number | string);
          formStore.setTemplateEcho(_id).then(() => {
            if (!formStore.getTemplateEcho.length) {
              // 没值的情况下前端给默认
              const defaultBasicTemplate = [
                {
                  templateId: _id,
                  label: '组份名称',
                  inputs: [],
                },
                {
                  templateId: _id,
                  label: '计量单位',
                  inputs: [],
                },
                {
                  templateId: _id,
                  label: '计量数量',
                  inputs: [],
                },
                {
                  templateId: _id,
                  label: '测量方法',
                  inputs: [],
                },
              ];
              state.basicFormHeader = [noHandler()].concat(defaultBasicTemplate);
              state.dynamicFormHeader = [];
            } else {
              const _filter = formStore.getTemplateEcho.filter((i) => i.label !== '序号');
              state.basicFormHeader = [noHandler()].concat(_filter.slice(0,4));
              state.dynamicFormHeader = _filter.slice(4, _filter.length);
              formStore.saveForm(mergeForm.value.slice(1, 5));
            }
          });
        }
      }
      function editTemplateTitle() {
        state.editTitleFlag = !state.editTitleFlag;
        const params = {
          id: state.currTempDetail.id,
          templateTitle: state.titleValue,
        };
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '修改模板标题'),
          content: () => h('span', `是否把模板标题修改为${state.titleValue}`),
          onOk: () => {
            formStore.setTemplateTitle(params);
          },
        });
      }
      // onMounted(() => {
      //   fillForm();
      // });
      return {
        ...toRefs(state),
        add,
        del,
        registerModal,
        openModal1,
        register,
        saveFormDatas: (inputs: any) => {
          // setFieldsValue(inputs);
          // formStore.setDefaultValues(schama);
          formStore.saveForm(mergeForm.value.slice(1, 5)).then((res) => {
            fillForm();
            createMessage.success('保存成功!');
          });
        },
        handleSubmit: async (values: any) => {
          const a = document.createElement('a');
          a.target = '_blank';
          a.href = apiUrl + '/excel/downLoadExcelVertical?templateId=' + state.currTempDetail.id;
          document.body.appendChild(a);
          a.click(); //触发下载
          document.body.removeChild(a);
        },
        getList,
        toggle,
        getIsOpen,
        getTagColor,
        mergeForm,
        changeInputeValue,
        clickInputItem,
        uploadApi,
        handleChange: (list: string[]) => {
          createMessage.info(`已上传文件${JSON.stringify(list)}`);
        },
        addInputRow,
        editTemplateTitle,
      };
    },
  });
</script>
<style lang="less">
  .form_wrap {
    display: flex;
    flex-direction: column;
    .form {
      //margin-bottom: 30px;
      width: 100%;
      display: flex;
      flex-direction: row;
      .form_item {
        flex: 3;
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
          position: relative;
          input {
            color: #626262;
            font-size: 14px;
            width: 100%;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            padding-left: 8px;
            cursor: pointer;
            transition: .3s;
            &:hover {
              background: #eee;
            }
          }

          &:hover {
            &:before {
              position: absolute;
              top: 0;
              right: 0;
              content: '删除这一行';
              width: 80px;
              height: 100%;
              line-height: 24px;
              cursor: pointer;
              text-align: center;
              color: rgba(255, 0, 0, 0.86);
              font-size: 12px;
              transition: .3s;
            }
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
      .form_item:nth-child(1) {
        flex: 1;
        .column {
          input {
            text-align: center;
          }
        }
      }
    }
    .add_icon {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      padding: 8px 0;
      border: 1px solid #ddd;
      transition: .3s;
      &:hover {
        background: rgba(0, 0, 0, .1);
      }
    }
    .form_title {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      height: 28px;
      > .ant-input-lg {
        border: none;
        background: none;
        outline: none;
        height: 100%;
      }
    }
  }
</style>
