export default function ApkInfoCard({ apkInfo, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600 font-medium">❌ {error}</p>
      </div>
    );
  }

  if (!apkInfo) return null;

  const rows = [
    { icon: '📱', label: '应用名称', value: apkInfo.appName },
    { icon: '📦', label: '包名', value: apkInfo.packageName },
    { icon: '🔢', label: '版本号', value: apkInfo.versionName },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        APK 信息
      </h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="text-xl">{row.icon}</span>
            <div>
              <p className="text-xs text-gray-400">{row.label}</p>
              <p className="text-sm font-medium text-gray-800 break-all">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
