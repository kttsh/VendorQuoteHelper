import React from 'react';

interface FileGenerationStatusProps {
  isLoading: boolean;
  message: string;
}

const FileGenerationStatus: React.FC<FileGenerationStatusProps> = ({ isLoading, message }) => {
  if (!message && !isLoading) {
    return null;
  }
  
  let statusClass = '';
  
  if (isLoading) {
    statusClass = 'loading';
  } else if (message.includes('失敗') || message.includes('エラー')) {
    statusClass = 'error';
  } else if (message.includes('成功') || message.includes('設定しました') || message.includes('生成されました')) {
    statusClass = 'success';
  }
  
  return (
    <div className={`status-message ${statusClass}`} aria-live="polite">
      {isLoading && <div className="spinner"></div>}
      <span>{message}</span>
    </div>
  );
};

export default FileGenerationStatus;