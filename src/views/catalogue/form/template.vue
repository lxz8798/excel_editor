<template>
  <PageWrapper
    :title="(currTempDetail && Object.keys(currTempDetail).length && currTempDetail.name) || ''"
    contentFullHeight
  >
    <!--<a-button type="primary" :size="size" style="margin-bottom: 20px;">上传EXCEL</a-button>-->
    <BasicUpload
      :maxSize="20"
      :maxNumber="1"
      style="margin-bottom: 20px"
      :api="uploadApi"
      :accept="['.xlsx']"
      :uploadParams="uploadParams"
      @change="handleChange"
    />
    <CollapseContainer
      class="form_wrap"
      v-if="currTempDetail && Object.keys(currTempDetail).length"
    >
      <template #title>
        <div class="form_title" v-if="currTempDetail.name">
          <!--<span class="project_name_wrap" v-if="addProjectNameFlag">
            <a-input
              size="small"
              placeholder="请输入项目名称"
              v-model:value="projectNameDefalutValue"
            >
            </a-input>
          </span>
          <span class="project_name_wrap" v-else>
            【<a-select v-model:value="projectOptionsValue" size="small" @change="changeShowProjectName">
              <a-select-option v-for="item in projectNames" :key="item.id">
                <div style="display: flex; align-items: center; justify-content: space-between">
                  <span>{{ item.name }}</span>
                </div>
              </a-select-option>
            </a-select>】
          </span>-->
          <span>表单名称：{{ currTempDetail['name'].split('-')[currTempDetail['name'].split('-').length - 1] }}</span>
          <!--<a-input size="large" v-model:value="titleValue" :placeholder="currTempDetail.name.split('-')[currTempDetail.name.split('-').length - 1]" style="padding-left: 5px;"></a-input>
          <Icon :icon="'material-symbols:edit-note-rounded'" :title="'修改标题'" size="18" style="margin-left: 5px;" @click="editTemplateTitle" />-->
          <span>所属项目：{{ projectInfo['examContract'] && projectInfo['examContract'].name }}</span>
          <!--<span>关联内容：{{ projectInfo['technologys'] && projectInfo['technologys'].map((i) => i['menuName']).toString() }}</span>-->
          <span>项目负责人：{{ projectInfo['leaderUser'] && projectInfo['leaderUser'].realName }}</span>
          <span>参与成员：{{ projectInfo['user'] && projectInfo['user'].map((i) => i['realName']).toString() }}</span>
          <span>入库状态：{{ currentRoute.query['confirm'] === '0' ? '临时保存状态' : '已入库' }}</span>
        </div>
        <div class="form_title" v-else>暂无名称</div>
      </template>
      <div class="container_wrap">
        <div class="left">
          <div class="form">
            <div
              v-if="mergeForm.length"
              class="form_item"
              v-for="(form, index) in mergeForm"
              :key="index"
            >
              <div class="row">{{ form.label }}</div>
              <!-- @click="clickInputItem($event, input, form, key, index)"-->
              <div
                class="column"
                v-for="(input, key) in form.inputs"
                :key="key"
                :class="input.type === 'add' && 'add_icon'"
                :data-input="JSON.stringify(input)"
              >
                <Input
                  size="large"
                  v-model:value="input.value"
                  :item="input"
                  v-if="input.type === 'input'"
                  :class="`input_cell` + `_${index}_${key}`"
                  @change="changeInputeValue($event, input, key, index)"
                />
                <div v-show="index == 4">
                  <Icon icon="icon-park-outline:view-grid-detail" title="详情" class="edit"  @click="clickDetailItem($event, input, form, key, index)"></Icon>
                  <Icon icon='material-symbols:delete-outline' title="删除这一行" class="del" @click="clickInputItem($event, input, form, key, index)"></Icon>
                </div>
                <!--<PlusSquareOutlined style="cursor: pointer" v-else-if="input.type === 'add'" />-->
              </div>
            </div>
          </div>
          <PlusSquareOutlined class="add_icon" style="cursor: pointer" @click="addInputRow" />
          <BasicForm
            @register="register"
            @submit="handleSubmit"
            style="margin-top: 25px"
          >
            <template #advanceAfter>
              <a-button type="primary" style="margin-right: 8px; background: #4fb818; border: #4fb818" @click="submitInclusionHandler" v-if="isLeader || isAdmin">{{currentRoute.query['confirm'] === '0' ? '提交入库' : '切换成缓存状态'}}</a-button>
              <a-button type="primary" danger @click="clearFormDatas" v-if="!currTempDetail['name'].includes('计算结果')">清空数据</a-button>
            </template>
          </BasicForm>
        </div>
        <div class="right">
          <div class="history_box">
            <template v-if="recordList.length">
              <Conversation v-for="item in recordList" :userMsg="item" />
            </template>
          </div>
        </div>
      </div>
    </CollapseContainer>
    <!--弹窗-->
    <Modal1
      @editDone="editDoneHandler"
      @register="registerModal"
      :minHeight="100"
      :options="modalOptions"
    />
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
    onMounted,
    h,
  } from 'vue';
  import { BasicForm, FormSchema, ApiSelect, useForm } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container';
  import { Conversation } from '/@/components/Conversation';
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
  import {
    changeInputValueApi,
    clearTemplate,
    addProjectItem,
    delProjectItem,
    submitInclusion,
    tempSave,
  } from '/@/api/demo/form';
  import Icon from '/@/components/Icon';
  import { useRouter } from 'vue-router';
  const formStore = useFormStore();
  const userStore = useUserStore();
  const { wsUrl, apiUrl, uploadUrl } = useGlobSetting();
  export default defineComponent({
    components: {
      Modal1,
      BasicForm,
      CollapseContainer,
      PageWrapper,
      Conversation,
      ApiSelect,
      ASelect: Select,
      ASelectOption: Select.Option,
      PlusSquareOutlined,
      DownloadOutlined,
      BasicUpload,
      Icon,
    },
    setup() {
      // 使用消息
      const { createMessage, createConfirm } = useMessage();
      const { currentRoute, replace } = useRouter();
      // 获得当前模板的详情
      // formStore.setCurrTemp(state.currTempDetail.id as string);
      // STATE
      const state = reactive({
        server: wsUrl + userStore.getUserInfo.userId,
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
        currTemp: {
          confirm: '0'
        },
        projectInfo: {},
        projectNameDefalutValue: '',
        projectNames: [],
        projectOptionsValue: '',
        addProjectNameFlag: true,
        isLeader: '',
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
      const isActive = computed(() => userStore.getUserInfo.activeFlag);
      const isAdmin = computed(() => userStore.getUserInfo['roles'].some((i) => i['roleCode'] === 'super_admin'));
      // const isLeader = computed(() => userStore.getUserInfo['id'] === state.projectInfo['leaderUser']['id']);
      const getIsOpen = computed(() => status.value === 'OPEN');
      const getTagColor = computed(() => (getIsOpen.value ? 'success' : 'red'));
      const mergeForm = computed(() => [...state.basicFormHeader, ...state.dynamicFormHeader]);
      state.projectNameValue = computed(() => formStore.getTemplateProjectName);
      state.projectNames = computed(() => (formStore.getProjectNamesList['records'] && formStore.getProjectNamesList['records'].length) && toRaw(formStore.getProjectNamesList['records']));
      // state.currTemp = computed(() => JSON.parse(localStorage.getItem('currTemp')));
      const getList = computed(() => {
        return [...state.recordList].reverse();
      });
      watch(
        uplpdaNum,
        () => {
          if (currentRoute.value.meta.hasOwnProperty('templateId')) {
            fillForm({
              id: currentRoute.value.meta.templateId,
              name: currentRoute.value.meta.title,
            });
            formStore.setTemplateProjectName({ contractId: currentRoute.value.meta.templateId })
              .then((res) => {
                if (!res) return;
                const { examContract, technologys, leaderUser, user } = toRaw(res);
                state.projectInfo = ({ examContract, technologys, leaderUser, user });
                state.isLeader = computed(() => userStore.getUserInfo['userId'] === leaderUser['id']);
                state.projectNameDefalutValue = examContract.name;
                formStore.setProjectNamesList().then((list) => {
                  if (list['records'].length) {
                    state.addProjectNameFlag = false;
                  } else {
                    state.addProjectNameFlag = true;
                  }
                  if (res !== '') {
                    state.projectNames = computed(() => list['records']);
                    if (state.projectNames && state.projectNames.length) {
                      state.projectOptionsValue = toRaw(state.projectNames).filter((i) => i.name == examContract.name)[0].id;
                    }
                  }
                });
              });
          }
        },
        { immediate: true, deep: true },
      );
      watchEffect(() => {
        if (data.value) {
          try {
            // state.recordList = [];
            // state.recordList.length = 0;
            // const res = JSON.parse(data.value);
            // state.recordList.push(res[0]);
            formStore.setFormHistory({templateId: currentRoute.value.meta.templateId}).then((res) => {
                const { records } = res;
                state.recordList = records;
              });
            let timer = null;
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
              fillForm({
                id: currentRoute.value.meta.templateId,
                name: currentRoute.value.meta.title,
              });
            }, 600);
          } catch (error) {
            state.recordList.push({
              res: data.value,
              id: Math.ceil(Math.random() * 1000),
              time: new Date().getTime(),
            });
          }
        }
      });

      formStore.setFormHistory({templateId: currentRoute.value.meta.templateId}).then((res) => {
        const { records } = res;
        state.recordList = records;
      });

      // if (currentRoute.value.query.hasOwnProperty('menuId')) {
      //   formStore.setProjectMembersInfo({ menuId: currentRoute.value.query.menuId }).then((res) => {
      //     console.log(res, 'res');
      //     state.isLeader = res;
      //   });
      // }

      function toggle() {
        if (getIsOpen.value) {
          close();
        } else {
          open();
        }
      }
      function changeInputeValue(e, input, key, index) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        input.value = e.target.value;
        let columnIndex = key + 1,
          _columnType = index - 1;
        let msgObj = {
          columnIndex: columnIndex,
          columnType: _columnType,
          type: '5',
          fromId: userStore.getUserInfo.userId,
          toId: '',
          boradFlag: '',
          delFlag: false,
          msg: input,
        };
        send(JSON.stringify(msgObj));
        if (index < 1) return;
        if (e.target.value !== '') {
          const params = {
            columnIndex: columnIndex,
            columnType: _columnType,
            templateId: input.templateId,
            value: e.target.value,
          };
          changeInputValueApi(params).then((res) => {
            formStore.saveForm(mergeForm.value.slice(1, 5)).then(() =>
              fillForm({
                id: currentRoute.value.meta.templateId,
                name: currentRoute.value.meta.title,
              }),
            );
            createMessage.success(res);
          });
        }
      }
      function changeProjectName(e) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        // state.projectNameValue = e.target.value;
        createConfirm({
          iconType: 'info',
          title: () => h('span', '添加项目名称'),
          content: () => h('span', '是否确认？'),
          onOk: async () => {
            formStore
              .setTemplateTitle({
                id: currentRoute.value.meta.templateId,
                projectName: state.projectNameDefalutValue,
              })
              .then(() => {
                formStore.setTemplateProjectName({
                  contractId: currentRoute.value.meta.templateId,
                });
                formStore
                  .addProjectNameToList({
                    name: state.projectNameDefalutValue,
                    templateId: currentRoute.value.meta.templateId,
                  })
                  .then(() => {
                    formStore
                      .setTemplateProjectName({ contractId: currentRoute.value.meta.templateId })
                      .then((res) => {
                        state.projectNameDefalutValue = res.projectName;
                        state.projectNames = computed(() => res.projectNames);
                        state.addProjectNameFlag = false;
                        state.projectOptionsValue = res.projectNames.filter((i) => i.name == res.projectName)[0].id;
                      });
                  });
              });
          },
        });
      }
      function changeShowProjectName(id) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        const item = state.projectNames.filter((i) => i.id == id)[0];
        const params = {
          id: currentRoute.value.meta.templateId,
          projectName: item.name,
        };
        formStore.setTemplateTitle(params);
        // state.projectNameDefalutValue = item.name;
      }
      function delProjectName(e, obj) {
        e.stopPropagation();
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '删除有风险!'),
          content: () => h('span', '是否确认删除？'),
          onOk: async () => {
            formStore.delProjectNameFormList({ id: obj.id }).then((res) => {
              createMessage.success(res);
              formStore.setTemplateProjectName({ contractId: currentRoute.value.meta.templateId }).then((res) => {
                  state.projectNames = computed(() => res.projectNames);
                  state.projectOptionsValue = '';
                  state.projectNameDefalutValue = '';
                });
            });
          },
        });
      }
      function changeAddProjectNameFlagState() {
        state.addProjectNameFlag = true;
        state.projectNameDefalutValue = '';
      }

      function clickDetailItem(e, input, form, key, columnType) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        let $dom = null;
        if (e.target.tagName !== 'DIV' && e.target.className !== 'column') {
          // $dom = e.target.parentNode.children[0];
          $dom = document.querySelector('.input_cell' + `_${columnType}_${key}`);
        }
        if ($dom.className.includes('input_cell')) {
          openModal1(true);
          let _columnIndex = columnType - 1;
          if (!input.hasOwnProperty('inputs')) {
            formStore.setTemplateEcho(formStore.getTemplateEcho[0].templateId);
            fillForm({
              id: currentRoute.value.meta.templateId,
              name: currentRoute.value.meta.title,
            });
          }
          if (formStore.getTemplateEcho) {
            const importCurrColumnIndex =
              formStore.getTemplateEcho[columnType - 1].inputs
                .filter((item) => item.importFlag === 1)
                .findIndex((idx) => idx.id === input.id) + 1;
            const params = {
              columnIndex: !input.importFlag ? key + 1 : importCurrColumnIndex,
              columnType: 1,
              importFlag: input.importFlag,
              templateId: form.templateId,
              value: input.value,
            };
            formStore.setColumnDetail(input);
            formStore.setColumnList(params);
          }
        }
      }
      function clickInputItem(e, input, form, key, columnType) {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        // let $dom = null;
        // if (e.target.tagName == 'path') {
        //   $dom = document.querySelector('.input_cell' + `_${columnType}_${key}`);
        //   console.log($dom, '$dom');
        // }
        // if (e.target.tagName === 'DIV' && e.target.className === 'column') {
        const { createConfirm } = useMessage();
        const _columnType = columnType - 1 < 1 ? '-1' : columnType - 1;
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '删除有风险!'),
          content: () => h('span', '是否确认删除？'),
          onOk: async () => {
            mergeForm.value.map((i) => {
              i.inputs.splice(key, 1);
              return i;
            });
            const params = {
              // importFlag: '0',
              templateId: currentRoute.value.meta.templateId,
              columnIndex: key,
              columnType: _columnType,
            };
            let msgObj = {
              columnIndex: key,
              columnType: _columnType,
              type: '5',
              fromId: userStore.getUserInfo.userId,
              toId: '',
              boradFlag: '',
              delFlag: true,
              msg: input,
            };
            send(JSON.stringify(msgObj));
            formStore.setDeleteTemplateRow(params);
            formStore
              .saveForm(mergeForm.value.slice(1, 5))
              .then((res) => createMessage.success('保存成功。'));
          },
        });
        // }
        if (input.type !== 'add') return;
        // if (!formStore.getTemplateEcho.map((i) => i.inputs).some((i) => i.length)) {
        //   createMessage.info('您需要先上传一个EXCEL!');
        //   return;
        // }
        form.inputs.splice(form.inputs.length - 1, 0, {
          type: 'input',
          value: '',
        });
      }
      function displayEnterHandler() {
        const style = document.createElement('style');
        document.head.appendChild(style);
        const sheet = style.sheet;
        sheet.addRule('.column:hover::before', 'display:none;');
        sheet.insertRule('.column:hover::before{display:none;}');
      }
      function displayLeaveHandler() {
        const style = document.createElement('style');
        document.head.appendChild(style);
        const sheet = style.sheet;
        sheet.addRule('.column:hover::before', 'display:block;');
        sheet.insertRule('.column:hover::before{display:block;}');
      }
      function addInputRow() {
        if (!isActive.value) {
          createMessage.info('当前账户末激活或者没有权限!');
          return;
        }
        formStore.setFormDataState({ templateId: currentRoute.value.meta.templateId }).then((res) => {
            mergeForm.value.map((i) => {
              i.inputs.push({
                type: 'input',
                value: '',
              });
              return i;
            });
            state.basicFormHeader[0].inputs[state.no].value = state.no++;
            formStore.saveForm(mergeForm.value.slice(1, 5)).then(() =>
              fillForm({
                id: currentRoute.value.meta.templateId,
                name: currentRoute.value.meta.title,
              }),
            );
            // if (!res) {
            //   createMessage.info('为统一格式，至少需要上传一个空数据的EXCEL模板才能继续!');
            //   console.log('删除成功');
            //   return;
            // } else {
            //   mergeForm.value.map((i) => {
            //     i.inputs.push({
            //       type: 'input',
            //       value: '',
            //     });
            //     return i;
            //   });
            //   state.basicFormHeader[0].inputs[state.no].value = state.no++;
            //   formStore.saveForm(mergeForm.value.slice(1, 5)).then(() =>
            //     fillForm({
            //       id: currentRoute.value.meta.templateId,
            //       name: currentRoute.value.meta.title,
            //     }),
            //   );
            // }
          });
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
        const _no = {
          id: '0',
          label: '序号',
          sort: 0,
          inputs: [],
          templateId: currentRoute.value.meta.templateId,
        };
        if (formStore.getTemplateEcho.length) {
          // 从接口返回的数据如果有值的情况下
          let _filter = formStore.getTemplateEcho.filter((i) => i.label !== '序号');
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
      function fillForm({ id, name }) {
        if (!id) return
        // formStore.setCurrTemp(item);
        state.currTempDetail = { id: id, name: name };
        // 获得所有的表单项
        state.uploadParams = { templateId: id };
        formStore.setBasicTemplate(id);
        userStore.setGotoDocID(id as number | string);
        formStore.setTemplateEcho(id).then(() => {
          if (!formStore.getTemplateEcho.length) {
            // 没值的情况下前端给默认
            const defaultBasicTemplate = [
              {
                templateId: id,
                label: '组分名称',
                inputs: [],
              },
              {
                templateId: id,
                label: '计量单位',
                inputs: [],
              },
              {
                templateId: id,
                label: '测量方法',
                inputs: [],
              },
              {
                templateId: id,
                label: '计量数量',
                inputs: [],
              },
            ];
            state.basicFormHeader = [noHandler()].concat(defaultBasicTemplate);
            state.dynamicFormHeader = [];
          } else {
            const _filter = formStore.getTemplateEcho.filter((i) => i.label !== '序号');
            state.basicFormHeader = [noHandler()].concat(_filter.slice(0, 4));
            state.dynamicFormHeader = _filter.slice(4, _filter.length);
            // formStore.saveForm(mergeForm.value.slice(1, 5));
          }
        });
      }
      function editTemplateTitle() {
        // state.editTitleFlag = !state.editTitleFlag;
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
      function clearFormDatas() {
        createConfirm({
          iconType: 'warning',
          title: () => h('span', '清空数据有风险!'),
          content: () => h('span', '是否确认清空？'),
          onOk: async () => {
            clearTemplate({ templateId: state.currTempDetail.id }).then((res) => {
              createMessage.success(res);
              fillForm({
                id: currentRoute.value.meta.templateId,
                name: currentRoute.value.meta.title,
              });
              window.location.reload();
            });
          },
        });
      }
      function editDoneHandler() {
        fillForm({ id: currentRoute.value.meta.templateId, name: currentRoute.value.meta.title });
      }
      function submitInclusionHandler() {
        const { path } = currentRoute.value;
        if (currentRoute.value.query.confirm === '0') {
          submitInclusion({ templateId: currentRoute.value.meta.templateId });
          replace(path + `?confirm=1`);
        } else {
          tempSave({ templateId: currentRoute.value.meta.templateId });
          replace(path + `?confirm=0`);
        }
      }

      console.log(history, 'route');
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
        clearFormDatas,
        saveFormDatas: (inputs: any) => {
          // 新需求，添加暂存功能，取消了CHANGE事件，在保存时调用
          formStore.saveForm(mergeForm.value.slice(1, 5)).then((res) => {
            fillForm({
              id: currentRoute.value.meta.templateId,
              name: currentRoute.value.meta.title,
            });
            createMessage.success('保存成功!');
          });
        },
        handleSubmit: async (values: any) => {
          if (!state.currTemp && !Object.keys(state.currTemp).length) {
            createMessage.info(
              '您正在空白模板进行手动输入的操作，可能需要重新进入一下页面才能生成表格!',
            );
            return;
          }
          const a = document.createElement('a');
          a.target = '_blank';
          // apiUrl +
          a.href =
            apiUrl +
            '/excel/downLoadExcelVertical?templateId=' +
            currentRoute.value.meta.templateId;
          console.log(a.href);
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
        changeProjectName,
        changeShowProjectName,
        delProjectName,
        changeAddProjectNameFlagState,
        clickDetailItem,
        clickInputItem,
        displayEnterHandler,
        displayLeaveHandler,
        uploadApi,
        editDoneHandler,
        handleChange: (list: string[]) => {
          createMessage.info(`已上传文件`);
        },
        addInputRow,
        editTemplateTitle,
        isAdmin,
        isActive,
        currentRoute,
        submitInclusionHandler,
      };
    },
  });
</script>
<style lang="less">
  .form_wrap {
    display: flex;
    flex-direction: column;

    min-height: 720px;

    .vben-collapse-container__header {
      height: 160px !important;
    }

    .container_wrap {
      display: flex;
      height: 60%;

      .left {
        flex: 3;

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
              width: 100%;
              //position: relative;
              display: flex;
              flex-direction: row;
              align-items: center;
              > input {
                flex: 1;
                color: #626262;
                font-size: 14px;
                border-top: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
                padding-left: 8px;
                cursor: pointer;
                box-sizing: border-box;
                transition: 0.3s;
                background: none;
              }
              span {
                cursor: pointer;
                font-size: 12px;
                transition: 1s;
              }
              .edit {
                color: #0a6cd5;
                &:hover {
                  color: darken(#0a6cd5, 30);
                }
              }
              .del {
                color: #faa19d;
                &:hover {
                  color: darken(#faa19d, 30);
                }
              }
              //&:hover {
              //  &:before {
              //    position: absolute;
              //    top: 0;
              //    right: 0;
              //    content: '删除这一行';
              //    width: 80px;
              //    height: 100%;
              //    line-height: 24px;
              //    cursor: pointer;
              //    text-align: center;
              //    color: rgba(255, 0, 0, 0.86);
              //    font-size: 12px;
              //    transition: 0.3s;
              //  }
              //}
            }
            .column:nth-child(odd) {
              background: #eee;
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
          transition: 0.3s;
          &:hover {
            background: rgba(0, 0, 0, 0.1);
          }
        }
      }
      .right {
        flex: 1;
        max-height: 660px;
        margin-left: 8px;
        border-radius: 5px;
        padding-bottom: 8px;

        ::v-deep(.p-2) {
          background: #000;
          height: 800px !important;
          height: 100%;
        }

        .history_box {
          height: 660px;
          overflow-x: hidden;
          overflow-y: auto;
          .conversation_wrap {
            padding: 8px;
            margin-bottom: 8px;
            margin-top: 8px;
            background: #eee;
            border-radius: 5px;
          }
          .conversation_wrap:first-child {
            margin-top: 0;
          }
          .conversation_wrap:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
    .form_title {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;

      > span {
        padding: 2px 0;
        font-size: 14px;
        align-self: flex-start;
      }
      .ant-select-arrow {
        display: flex;
        align-items: center;
      }
      > .ant-input-lg {
        border: none;
        background: none;
        outline: none;
        height: 100%;
      }
      > .project_name_wrap {
        min-width: 160px;
        .ant-select {
          min-width: 160px;
          .ant-select-selector {
            border: none;
            background: none;
          }
        }
      }
    }
  }
</style>
