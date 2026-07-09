import AppInfoParser from 'app-info-parser';

/**
 * 解析APK文件，提取包名、版本号和应用名
 * @param {File} file - 用户上传的APK文件对象
 * @returns {Promise<{packageName: string, versionName: string, appName: string, fileName: string}>}
 */
export async function parseApk(file) {
  const parser = new AppInfoParser(file);
  const result = await parser.parse();

  const packageName = result.package || result.application?.package || '';
  const versionName = result.versionName || result.application?.versionName || '';
  const appName = result.application?.label || result.label || '';

  if (!packageName) {
    throw new Error('无法解析包名，请确认上传的是有效的APK文件');
  }

  return {
    packageName,
    versionName: versionName || '未知',
    appName: appName || '未知',
    fileName: file.name,
  };
}
