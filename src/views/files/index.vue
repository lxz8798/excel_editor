<template>
  <PageWrapper contentFullHeight class="page_wrap">
    <!--@change="handleChange"-->
    <!--:custom-request="handleChange"-->
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="true"
      accept=".doc, .docx, .xls, .xlsx, .pdf, .jpg, .png, .txt, .zip, .rar"
      :data="uploadParams"
      :action="userFileUpload"
      :headers="uploadHeaders"
      :showUploadList="false"
      @change="handleChange"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text">点击或拖拽上传</p>
      <p class="ant-upload-hint">支持单次或批量上传</p>
    </a-upload-dragger>
    <!--  文件检索  -->
    <div class="file_search">
      <a-input-search type="text" placeholder="文件名规范格式请参考：20230819_项目名称_完井_管理员，检索输入文件名称即可!" enter-button="检索" size="large" @search="searchFile"></a-input-search>
    </div>
    <!--  全选&删除  -->
    <div class="fun_wrap">
      <div class="select_all">
        <!--<Icon icon="tabler:folder-up" style="margin-right: 8px; cursor: pointer;" @click="uppageHandler"></Icon>-->
        <a-checkbox v-model:checked="allSelectFlag" class="checked_box" @change="selectAll"></a-checkbox>
        <label style="margin-left: 10px;">全选</label>
      </div>
      <p class="delete_but" @click="delMultiple">删除</p>
    </div>
    <!--  文件列表 item-layout="vertical"  -->
    <a-list :data-source="isDirFlag ? dirLists : fileDatas" :grid="{ gutter: 2, column: 2 }">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta :description="`上传时间：${uploadTime(item['createTime'])}`">
            <template #title>
              <span class="isDirFlag" :title="getFileName2(item['fileName'])" v-if="isDirFlag">{{ getFileName2(item['fileName']) }}</span>
              <span :title="getFileName2(item['fileOriginalName'])" v-else>{{ getFileName2(item['fileOriginalName']) }}</span>
            </template>
            <template #avatar>
              <a-checkbox v-model:checked="item['checked']" class="checked_box" v-if="!isDirFlag"></a-checkbox>
              <!--<Icon :icon="isWhatType(item['fileName'])" @dblclick="dblclickEnterDir(item)" v-if="isDirFlag"></Icon>
              <Icon :icon="isWhatType(item['fileName'])"></Icon>-->
              <Icon icon="typcn:delete-outline" class="del_icon" @click="deleteUserFile(item)"></Icon>
            </template>
          </a-list-item-meta>
          <!--<template #actions>
            <a-button class="down" type="primary" shape="round" size="small" @click="downloadHandler(item)">下载</a-button>
          </template>-->
        </a-list-item>
      </template>
    </a-list>
    <!--  分页器  -->
    <a-pagination v-model:current="pages.curr" :total="pages.total" pageSize="24" size="small" show-less-items show-total @change="turnThePage" />
  </PageWrapper>
</template>
<script lang="ts">
  import { InboxOutlined } from '@ant-design/icons-vue';
  import {
    message,
    Upload,
    List,
    Checkbox,
    InputSearch,
    Pagination,
  } from 'ant-design-vue';
  import { reactive, toRefs, defineComponent, ref, computed, h } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useUserStore } from '/@/store/modules/user';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { defHttp } from '/@/utils/http/axios';

  const AUploadDragger = Upload.Dragger;
  const AList = List;
  const AListItem = List.Item;
  const AListItemMeta = List.Item.Meta;
  const ACheckbox = Checkbox;
  const AInputSearch = InputSearch;
  const APagination = Pagination;

  export default defineComponent({
    name: 'fileUpload',
    components: {
      InboxOutlined,
      AUploadDragger,
      AList,
      AListItem,
      AListItemMeta,
      Icon,
      ACheckbox,
      AInputSearch,
      APagination,
    },
    setup() {
      const { userFileUpload } = useGlobSetting();
      const userStore = useUserStore();
      const { createMessage, createConfirm } = useMessage();

      interface IDataItem {
        title: string;
      }
      interface IGetFileParams {
        userId: string | number;
        page: string | number;
        size: string | number;
      }
      interface IFileType {
        jpg: string;
        png: string;
        rar: string;
        zip: string;
        doc: string;
        docx: string;
        xls: string;
        xlsx: string;
        txt: string;
        pdf: string;
        dir: string;
      }
      // 获得当前模板的详情
      // formStore.setCurrTemp(state.currTempDetail.id as string);
      // STATE
      const state = reactive({
        fileDatas: computed(() => userStore['getUserFilesList']['records'] as IDataItem[]),
        uploadHeaders: {
          Authorization: userStore['getUserInfo']['token'].replace(/Bearer/, ''),
        },
        isType: {
          jpg: 'ph:file-jpg',
          png: 'ph:file-png',
          rar: 'solar:winrar-line-duotone',
          zip: 'ph:file-zip-duotone',
          doc: 'teenyicons:doc-outline',
          docx: 'teenyicons:doc-outline',
          xls: 'teenyicons:xls-outline',
          xlsx: 'teenyicons:xls-outline',
          txt: 'tabler:file-type-txt',
          pdf: 'teenyicons:pdf-outline',
          dir: 'octicon:file-directory-open-fill-16',
        } as IFileType,
        menuParams: computed(() => JSON.parse(sessionStorage.menuParams)),
        uploadParams: {
          menuId: computed(() => JSON.parse(sessionStorage.menuParams)['id']),
        },
        allSelectFlag: false,
        pages: {
          curr: 1,
          size: 24,
          total: 0,
        },
        dirLists: [],
        isDirFlag: false,
        dirZIndex: 2,
      });
      // created
      let paramsColl: Record<string, IGetFileParams> = {
        getFileListParams: {
          menuId: state['uploadParams']['menuId'],
          // userId: userStore['getUserInfo']['userId'],
          page: state.pages.curr,
          size: state.pages.size,
        },
      };
      userStore['setUserFilesList'](paramsColl['getFileListParams']).then((res) => {
        state.pages.curr = res['current'];
        state.pages.total = res['total'];
        state.pages = computed(() => userStore.getUserFilesPage['userFiles']);
      });

      const isSelf = computed(() => userStore.getUserInfo['userId']);

      const handleChange = (info) => {
        const reg = /^([0-9]+_)?.+_[\u4e00-\u9fa5]{2,4}$/g;
        const status = info.file.status;
        if (!reg.test(info.file.name.split('.')[0])) {
          message.warning(`${info.file.name} 文件名称不规范，请参考："20230819_项目名称_完井_管理员"`);
          return;
        }
        if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          message.success(`${info.file.name} 上传成功.`);
          userStore['setUserFilesList'](paramsColl['getFileListParams'])
        } else if (status === 'error') {
          message.error(`${info.file.name} 上传失败.`);
        }
      };

      const isWhatType = (name) => {
        if (!name) return;
        return state.isType[name.split('.')[1]];
      };

      const getFileName = (name) => {
        if (!name) return;
        return name.split('.')[0];
      };

      const getFileName2 = (name) => {
        if (!name) return;
        return `${name.split('_')[1]}_${name.split('_')[2]}_${name.split('_')[3]}`;
      };

      const uploadTime = (time) => {
        if (!time) return;
        return time.split(' ')[0];
      };

      const deleteUserFile = (file) => {
        if (isSelf.value != file.userId) {
          createMessage.warning('请注意，不是自己上传的文件不能删除!');
          return;
        }
        createConfirm({
          iconType: 'warning',
          okButtonProps: {
            style: {
              backgroundColor: "#ff417a",
              color: "#fff",
              borderColor: "#d00000",
            },
          },
          title: () => h('span', '是否确认删除!'),
          onOk: () => {
            const { id } = file;
            const params = {
              fileId: id,
            };
            userStore['delUserFileList'](params).then((res) => {
              if (res) createMessage.success('删除成功');
              userStore['setUserFilesList'](paramsColl['getFileListParams']);
            });
          },
        });
      };

      const searchFile = (txt) => {
        // 下面的代码是正常的，只不过只能在前端检索，也就是第一页查找
        // if (!txt) {
        //   state['fileDatas'] = computed(() => userStore['getUserFilesList']['records'] as IDataItem[]);
        // } else {
        //   const filter = state.fileDatas.filter((i) => i['fileOriginalName'].includes(txt));
        //   state['fileDatas'] = ref(filter);
        // }
        const params = {
          page: state.pages.curr,
          size: state.pages.size,
          // userId: userStore['getUserInfo']['userId'],
          menuId: paramsColl['getFileListParams']['menuId'],
          fileName: txt,
        };
        userStore['setUserFilesList'](params)
      };

      const turnThePage = (page) => {
        paramsColl['getFileListParams'].page = page;
        userStore['setUserFilesList'](paramsColl['getFileListParams']).then((res) => {
          state.pages.curr = res['current'];
          state.pages.total = res['total'];
        });
      };

      const delMultiple = () => {
        const filter = state.fileDatas.filter((i) => i['checked']);
        createConfirm({
          iconType: 'warning',
          okButtonProps: {
            style: {
              backgroundColor: "#ff417a",
              color: "#fff",
              borderColor: "#d00000",
            },
          },
          title: () => h('span', '是否确认删除以下文件!'),
          content: () => {
            return filter.map((i) => h('p', { style: { margin: 0 } } ,getFileName(i['fileOriginalName'])))
          },
          onOk: () => {
            filter.forEach((i) => {
              const { id } = i;
              const params = {
                fileId: id,
              };
              userStore['delUserFileList'](params).then((res) => {
                if (res) createMessage.success('删除成功');
                userStore['setUserFilesList'](paramsColl['getFileListParams']);
              });
            });
          },
        });
      };

      const selectAll = () => {
        state.fileDatas.slice(0, state.pages.size).forEach((item) => {
          item['checked'] = state.allSelectFlag;
        });
      };

      const uppageHandler = () => {
        state.dirZIndex--;

        const params = {
          page: state.pages.curr,
          size: state.pages.size,
          menuId: state['uploadParams']['menuId'],
        };

        if (state.dirZIndex == 1) {
          userStore.setAllUserFileList(params).then((res) => {
            console.log(res, 'res');
            state.dirLists = res.map((i) => ({...i, fileName: `${i.fileName}\.dir`}));
            state.isDirFlag = true;
            state.fileDatas.length = 0;
          });
        }

        if (state.dirZIndex <= 0) {
          userStore.setUserProjectDir(params).then((res) => {
            state.dirLists = res.map((i) => ({...i, fileName: `${i.fileName}\.dir`}));
            state.isDirFlag = true;
            state.fileDatas.length = 0;
          });
        }
      };

      const dblclickEnterDir = (item) => {
        if (state.dirZIndex == 0) {
          const params = {
            page: state.pages.curr,
            size: state.pages.size,
            menuId: state['uploadParams']['menuId'],
          };
          userStore.setAllUserFileList(params).then((res) => {
            state.dirLists = res.map((i) => ({...i, fileName: `${i.fileName}\.dir`}));
            state.isDirFlag = true;
            state.fileDatas.length = 0;
            state.dirZIndex = 2;
          });
        } else {
          state.isDirFlag = false;
          paramsColl['getFileListParams']['menuId'] = item['menuId'];
          paramsColl['getFileListParams']['parentId'] = item['id'];
          paramsColl['getFileListParams']['userId'] = item['userId'];
          userStore['setUserFilesList'](paramsColl['getFileListParams']);
        }
      };

      const downloadHandler = (item) => {
        const link = document.createElement('a');
        link.href = item.filePath;
        link.download = item.filePath;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      return {
        ...toRefs(state),
        handleChange,
        isWhatType,
        getFileName,
        getFileName2,
        uploadTime,
        deleteUserFile,
        searchFile,
        turnThePage,
        delMultiple,
        selectAll,
        uppageHandler,
        dblclickEnterDir,
        downloadHandler,
        fileList: ref([]),
        userFileUpload,
      };
    },
  });
</script>
<style lang="less" scoped>
  .page_wrap {
    display: block;
    height: 100%;
  }
  ::v-deep(.ant-upload-drag) {
    height: auto;
  }
  ::v-deep(.ant-list) {
    min-height: 486px;
  }
  ::v-deep(.ant-list-item-action) {
    margin-top: 0;
    li {
      width: 89%;
      display: inline-block;
      text-align: right;
      .ant-btn {
        font-size: 12px;
      }
    }
  }
  ::v-deep(.ant-list-item) {
    margin-bottom: 5px !important;
    .ant-list-item-meta {
      position: relative;
      padding: 5px;
      margin: 5px;

      display: flex;
      flex-direction: row;

      //width: 160px;

      border: 1px dashed rgba(229, 231, 235, 1);
      border-radius: 5px;
      transition: 1s;
      cursor: pointer;

      .ant-list-item-meta-avatar,
      .ant-list-item-meta-content {
        width: 100%;
      }

      .ant-list-item-meta-avatar {
        margin-right: unset;
        width: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
        .app-iconify {
          font-size: 25px !important;
        }
        .del_icon,
        .checked_box {
          transition: .6s;
        }
        .del_icon {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 25px !important;
          color: rgba(0, 0, 0, .3);
        }
      }

      .ant-list-item-meta-content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .ant-list-item-meta-title {
          max-height: 40px;
          overflow: hidden;
          > span {
            word-wrap: break-word;
          }
          > .isDirFlag {
            width: 100%;
            display: inline-block;
            text-align: center;
          }
        }
      }

      .ant-list-item-meta-description {
        padding-right: 28px;
      }

      &:hover {
        border: 1px dashed dodgerblue;
        background: rgba(42, 125, 201, .1);

        .ant-list-item-meta-avatar {
          .del_icon {
            color: rgba(255, 0, 0, 1);
          }
          .checked_box {
            opacity: 1;
          }
        }
      }
    }
  }
  .file_search {
    width: 100%;
    margin: 15px 0;

    display: flex;
    justify-content: center;
    align-items: center;
    > ::v-deep(.ant-input-search) {
      width: 65%;
      border-radius: 5px;
      background: #000;
    }
  }
  .fun_wrap {
    width: 100%;
    height: 30px;

    display: flex;

    padding: 5px;

    display: flex;
    justify-content: space-between;
    .select_all {

    }
    .delete_but {
      margin-right: 30px;
      cursor: pointer;
      transition: .3s;

      &:hover {
        color: red;
      }
    }
  }
  ::v-deep(.ant-pagination) {
    width: 100%;
    padding: 10px 0;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
</style>
