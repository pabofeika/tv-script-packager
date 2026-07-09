import { useState, useCallback } from 'react';
import ApkUploader from './components/ApkUploader';
import ApkInfoCard from './components/ApkInfoCard';
import DownloadButton from './components/DownloadButton';
import { parseApk } from './lib/parseApk';
import { generateScript } from './lib/generateScript';
import { buildAndDownloadZip } from './lib/buildZip';

export default function App() {
  const [apkFile, setApkFile] = useState(null);
  const [apkInfo, setApkInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [generateError, setGenerateError] = useState('');

  const handleFileSelected = useCallback(async (file) => {
    setApkFile(file);
    setApkInfo(null);
    setError('');
    setDownloaded(false);
    setGenerateError('');
    setLoading(true);

    try {
      const info = await parseApk(file);
      setApkInfo(info);
    } catch (err) {
      setError(err.message || 'APK解析失败，请确认文件有效');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!apkFile || !apkInfo) return;

    setGenerating(true);
    setGenerateError('');
    try {
      const script = generateScript({
        packageName: apkInfo.packageName,
        versionName: apkInfo.versionName,
        apkFileName: apkInfo.fileName,
      });
      await buildAndDownloadZip(apkFile, apkInfo, script);
      setDownloaded(true);
    } catch (err) {
      setGenerateError(err.message || '生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">TV 脚本打包工具</h1>
          <p className="text-gray-400 mt-2 text-sm">
            上传APK，自动生成电视安装脚本包
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <ApkUploader onFileSelected={handleFileSelected} />
        </div>

        {/* APK Info */}
        {apkFile && (
          <div className="mb-6">
            <ApkInfoCard apkInfo={apkInfo} loading={loading} error={error} />
          </div>
        )}

        {/* Generate Button */}
        {apkInfo && !error && (
          <DownloadButton
            onClick={handleGenerate}
            disabled={!apkInfo}
            loading={generating}
            downloaded={downloaded}
          />
        )}

        {/* Generate Error */}
        {generateError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 font-medium">❌ {generateError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
