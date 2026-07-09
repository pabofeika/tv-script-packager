import { useState, useRef } from 'react';

export default function ApkUploader({ onFileSelected }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file.name.endsWith('.apk')) {
      alert('请上传 .apk 格式的文件');
      return;
    }
    setFileName(file.name);
    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
        transition-all duration-200
        ${dragOver
          ? 'border-blue-400 bg-blue-50 scale-[1.02]'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".apk"
        onChange={handleChange}
        className="hidden"
      />

      {fileName ? (
        <div>
          <p className="text-4xl mb-3">📱</p>
          <p className="text-lg font-medium text-gray-700">{fileName}</p>
          <p className="text-sm text-gray-400 mt-1">点击或拖拽重新选择</p>
        </div>
      ) : (
        <div>
          <p className="text-4xl mb-3">📤</p>
          <p className="text-lg font-medium text-gray-600">点击或拖拽上传 APK 文件</p>
          <p className="text-sm text-gray-400 mt-1">支持 .apk 格式</p>
        </div>
      )}
    </div>
  );
}
