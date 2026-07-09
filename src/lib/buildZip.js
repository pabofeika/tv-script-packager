import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * 构建最终zip包并触发浏览器下载
 * @param {File} apkFile - 用户上传的APK文件
 * @param {{packageName: string, versionName: string, appName: string, fileName: string}} apkInfo - APK解析信息
 * @param {string} scriptContent - 替换后的脚本内容
 * @returns {Promise<void>}
 */
export async function buildAndDownloadZip(apkFile, apkInfo, scriptContent) {
  const zip = new JSZip();

  // 1. 添加USB标记文件（从public/目录加载）
  const [skydebugshellRes, skydebugtoolRes] = await Promise.all([
    fetch('/skydebugshell'),
    fetch('/skydebugtool'),
  ]);
  const skydebugshellBlob = await skydebugshellRes.blob();
  const skydebugtoolBlob = await skydebugtoolRes.blob();
  zip.file('skydebugshell', skydebugshellBlob);
  zip.file('skydebugtool', skydebugtoolBlob);

  // 2. 添加SkyBusinessFile目录下的文件
  const businessFolder = zip.folder('SkyBusinessFile');
  businessFolder.file('SkyBusiness.sh', scriptContent);
  businessFolder.file(apkInfo.fileName, apkFile);

  // 3. 生成zip并触发下载
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const safeName = (apkInfo.appName || 'app').replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_');
  const downloadName = `${safeName}_${apkInfo.versionName}.zip`;
  saveAs(zipBlob, downloadName);
}
