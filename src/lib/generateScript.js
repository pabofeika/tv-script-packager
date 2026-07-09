// 通过 Vite ?raw 导入脚本模板（构建时内联为字符串）
import TEMPLATE from '../templates/SkyBusiness.sh.txt?raw';

/**
 * 生成替换变量后的SkyBusiness.sh脚本内容
 * @param {{packageName: string, versionName: string, apkFileName: string}} params
 * @returns {string} 替换后的完整脚本
 */
export function generateScript({ packageName, versionName, apkFileName }) {
  return TEMPLATE
    .replace(/\{\{PACKAGE_NAME\}\}/g, packageName)
    .replace(/\{\{VERSION_NAME\}\}/g, versionName)
    .replace(/\{\{APK_FILENAME\}\}/g, apkFileName);
}
