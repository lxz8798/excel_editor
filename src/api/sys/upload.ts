import { UploadApiResult } from './model/uploadModel';
import { defHttp } from '/@/utils/http/axios';
import { UploadFileParams } from '/#/axios';
import { useGlobSetting } from '/@/hooks/setting';

enum Api {
  UPLOAD_AVATAR = '/files/upload',
  UPDATE_AVATAR = '/user/updateHead',
}

const { uploadUrl } = useGlobSetting();
/**
 * @description: Upload interface
 */
export function uploadApi(
  params: UploadFileParams,
  onUploadProgress: (progressEvent: ProgressEvent) => void,
) {
  return defHttp.uploadFile<UploadApiResult>(
    {
      url: uploadUrl,
      onUploadProgress,
      timeout: 1000 * 60 * 30,
    },
    params,
  );
}

export function uploadAvatar(params: Promise<unknown>) {
  return defHttp.post<UploadApiResult>({
    url: Api.UPLOAD_AVATAR,
    params,
    timeout: 1000 * 60 * 30,
  });
}

export function updateAvatar(params: Promise<unknown>) {
  return defHttp.put<UploadApiResult>({
    url: Api.UPDATE_AVATAR,
    params,
  });
}
