import JSZip from 'jszip';

/**
 * 解析APK文件中的AndroidManifest.xml（二进制AXML格式）
 * 纯浏览器端实现，零Node.js依赖
 */

function readU32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function readU16(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8)) >>> 0;
}

// 解析字符串池
function parseStringPool(bytes, offset) {
  const chunkType = readU32(bytes, offset);
  if (chunkType !== 0x001C0001) throw new Error('Invalid string pool');

  const chunkSize = readU32(bytes, offset + 4);
  const stringCount = readU32(bytes, offset + 8);
  const flags = readU32(bytes, offset + 16);
  const stringsStart = readU32(bytes, offset + 20);
  const isUtf8 = (flags & 0x100) !== 0;
  const strings = [];

  for (let i = 0; i < stringCount; i++) {
    const strOff = readU32(bytes, offset + 28 + i * 4);
    if (strOff < 0) { strings.push(''); continue; }
    const addr = offset + stringsStart + strOff;

    if (isUtf8) {
      const b0 = bytes[addr], b1 = bytes[addr + 1];
      const charLen = ((b0 | (b1 << 8)) & 0x7FFF);
      const byteLen = (b0 & 0x80) ? charLen * 4 : charLen;
      strings.push(new TextDecoder().decode(bytes.slice(addr + 2, addr + 2 + byteLen)));
    } else {
      const charLen = readU16(bytes, addr);
      strings.push(new TextDecoder('utf-16le').decode(bytes.slice(addr + 2, addr + 2 + charLen * 2)));
    }
  }

  return { strings, chunkSize };
}

// 遍历XML提取关键字段
function extractFields(bytes, strings) {
  let off = 8;
  const pool = parseStringPool(bytes, off);
  off += pool.chunkSize;

  const result = { packageName: '', versionName: '', appName: '' };

  while (off + 8 <= bytes.length) {
    const chunkType = readU32(bytes, off);
    const chunkSize = readU32(bytes, off + 4);
    if (chunkSize <= 0 || off + chunkSize > bytes.length) break;

    if (chunkType === 0x00100102) {
      // StartElement: name在off+20(uint32), attrCount在off+28(uint16)
      const nameIdx = readU32(bytes, off + 20);
      const elName = (nameIdx >= 0 && nameIdx < strings.length) ? strings[nameIdx] : '';
      const attrCount = readU16(bytes, off + 28);

      // 属性从off+36开始，每个20字节
      let aOff = off + 36;
      const attrs = {};

      for (let i = 0; i < attrCount; i++) {
        if (aOff + 20 > bytes.length) break;
        aOff += 4; // nsIndex (skip)
        const nameIdx2 = readU32(bytes, aOff); aOff += 4;
        const valueIdx = readU32(bytes, aOff); aOff += 4;
        aOff += 2; // typedValue.size (skip)
        aOff += 1; // typedValue.res0 (skip)
        const dataType = bytes[aOff]; aOff += 1;
        const data = readU32(bytes, aOff); aOff += 4;

        const attrName = (nameIdx2 >= 0 && nameIdx2 < strings.length) ? strings[nameIdx2] : '';
        let attrValue = '';
        if (dataType === 3) { // TYPE_STRING
          attrValue = (valueIdx >= 0 && valueIdx < strings.length) ? strings[valueIdx] : '';
        } else if (dataType === 1) { // TYPE_REFERENCE
          attrValue = `@0x${data.toString(16)}`;
        } else {
          attrValue = String(data);
        }
        attrs[attrName] = attrValue;
      }

      if (elName === 'manifest') {
        result.packageName = attrs['package'] || '';
        result.versionName = attrs['versionName'] || '';
      } else if (elName === 'application') {
        result.appName = attrs['label'] || '';
      }

      if (result.packageName && result.versionName && result.appName) break;
    }

    off += chunkSize;
  }

  return result;
}

/**
 * 解析APK文件，提取包名、版本号和应用名
 * @param {File} file - 浏览器File对象
 * @returns {Promise<{packageName: string, versionName: string, appName: string, fileName: string}>}
 */
export async function parseApk(file) {
  const zip = await JSZip.loadAsync(file);
  const manifest = zip.file('AndroidManifest.xml');

  if (!manifest) {
    throw new Error('未找到 AndroidManifest.xml，请确认上传的是有效的APK文件');
  }

  const bytes = await manifest.async('uint8array');
  const pool = parseStringPool(bytes, 8);
  const fields = extractFields(bytes, pool.strings);

  if (!fields.packageName) {
    throw new Error('无法解析包名，请确认上传的是有效的APK文件');
  }

  return {
    packageName: fields.packageName,
    versionName: fields.versionName || '未知',
    appName: fields.appName || '未知',
    fileName: file.name,
  };
}
