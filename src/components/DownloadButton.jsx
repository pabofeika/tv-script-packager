export default function DownloadButton({ onClick, disabled, loading, downloaded }) {
  if (downloaded) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 font-medium">✅ 生成成功！下载已开始</p>
        <p className="text-green-500 text-sm mt-1">如未自动下载请检查浏览器设置</p>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-4 rounded-xl font-semibold text-lg
        transition-all duration-200
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : loading
            ? 'bg-blue-400 text-white cursor-wait'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200'
        }
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          正在打包...
        </span>
      ) : (
        '📦 一键生成脚本包'
      )}
    </button>
  );
}
