import React, { useState, useEffect } from 'react';
// Tauri-specific imports commented out for web-only mode
// import { open } from '@tauri-apps/api/dialog';
// import { invoke } from '@tauri-apps/api/tauri';
// import { save } from '@tauri-apps/api/dialog';
// import { generateExcelQuoteRequest, generateExcelSpecSheet, generateWordDocument } from '../utils/documentHandlers';
// import { saveUserPreferences, loadUserPreferences } from '../utils/storage';

interface PreviewPanelProps {
  formData: any;
  generatedFiles: {
    excel1: string | null;
    excel2: string | null;
    word: string | null;
  };
  outputDirectory: string;
  setGeneratedFiles: React.Dispatch<React.SetStateAction<{
    excel1: string | null;
    excel2: string | null;
    word: string | null;
  }>>;
  resetForm: () => void;
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  formData,
  generatedFiles,
  outputDirectory,
  setGeneratedFiles,
  resetForm,
  setStatusMessage,
  setIsLoading
}) => {
  const [previewType, setPreviewType] = useState<'excel1' | 'excel2' | 'word'>('excel1');
  const [outputDir, setOutputDir] = useState(outputDirectory);
  const [generationStatus, setGenerationStatus] = useState({
    excel1: false,
    excel2: false,
    word: false
  });

  // Load user preferences on component mount - using props in web-only mode
  useEffect(() => {
    // We rely on the props passed from App component in web-only mode
    setOutputDir(outputDirectory);
  }, [outputDirectory]);

  // Generate filenames based on project details
  const getFilenames = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const projectNameSlug = formData.projectName.replace(/\s+/g, '_').replace(/[^\w]/g, '');
    const vendorSlug = formData.vendorName.replace(/\s+/g, '_').replace(/[^\w]/g, '');
    
    return {
      excel1: `見積依頼_${projectNameSlug}_${vendorSlug}_${date}.xlsx`,
      excel2: `仕様書_${projectNameSlug}_${vendorSlug}_${date}.xlsx`,
      word: `見積依頼書_${projectNameSlug}_${vendorSlug}_${date}.docx`
    };
  };

  // Web-only mode mock directory selection
  const handleSelectOutputDirectory = async () => {
    try {
      // In web-only mode, we just simulate a directory selection
      // with a mock path that would be valid on the user's system
      const mockSelectedDir = '/Users/user/Documents/見積依頼';
      setOutputDir(mockSelectedDir);
      setStatusMessage('出力先フォルダを設定しました。');
    } catch (error) {
      console.error('Failed to select directory:', error);
      setStatusMessage('フォルダの選択に失敗しました。');
    }
  };

  // Web-only mode simulate document generation
  const generateAllDocuments = async () => {
    if (!outputDir) {
      setStatusMessage('出力先フォルダを先に選択してください。');
      return;
    }

    setIsLoading(true);
    setStatusMessage('文書を生成中...');
    
    const filenames = getFilenames();
    
    try {
      // In web-only mode, we'll simulate document generation with short timeouts
      // This would actually create files in the Tauri desktop app
      
      // Simulate Excel Quote Request generation
      await new Promise(resolve => setTimeout(resolve, 500));
      const excel1Path = `${outputDir}/${filenames.excel1}`;
      setGeneratedFiles(prev => ({ ...prev, excel1: excel1Path }));
      setGenerationStatus(prev => ({ ...prev, excel1: true }));
      
      // Simulate Excel Spec Sheet generation
      await new Promise(resolve => setTimeout(resolve, 700));
      const excel2Path = `${outputDir}/${filenames.excel2}`;
      setGeneratedFiles(prev => ({ ...prev, excel2: excel2Path }));
      setGenerationStatus(prev => ({ ...prev, excel2: true }));
      
      // Simulate Word Document generation
      await new Promise(resolve => setTimeout(resolve, 800));
      const wordPath = `${outputDir}/${filenames.word}`;
      setGeneratedFiles(prev => ({ ...prev, word: wordPath }));
      setGenerationStatus(prev => ({ ...prev, word: true }));
      
      setStatusMessage('すべての文書が生成されました！');
    } catch (error) {
      console.error('Failed to generate documents:', error);
      setStatusMessage(`文書の生成に失敗しました: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Web-only mode simulated file open
  const handleOpenFile = async (filePath: string | null) => {
    if (!filePath) {
      setStatusMessage('ファイルが生成されていません。');
      return;
    }

    // In web-only mode, just show a message that this would open the file in a desktop app
    console.log(`Would open file: ${filePath}`);
    setStatusMessage(`Web版では${filePath.split('/').pop()}をプレビューできません。実際のデスクトップアプリではファイルを開くことができます。`);
  };

  return (
    <div className="preview-panel">
      <h2>文書プレビュー</h2>
      
      <div className="output-directory-section">
        <h3>出力先フォルダ</h3>
        <div className="directory-selector">
          <input
            type="text"
            className="form-control"
            value={outputDir}
            readOnly
            placeholder="出力先フォルダを選択してください"
          />
          <button 
            className="btn btn-outline-secondary" 
            onClick={handleSelectOutputDirectory}
          >
            <i className="fas fa-folder-open"></i> 参照
          </button>
        </div>
      </div>
      
      <div className="preview-controls">
        <h3>文書タイプ</h3>
        <div className="preview-tabs">
          <button 
            className={`preview-tab ${previewType === 'excel1' ? 'active' : ''}`}
            onClick={() => setPreviewType('excel1')}
          >
            <i className="fas fa-file-excel"></i> 見積依頼書
          </button>
          <button 
            className={`preview-tab ${previewType === 'excel2' ? 'active' : ''}`}
            onClick={() => setPreviewType('excel2')}
          >
            <i className="fas fa-file-excel"></i> 仕様書
          </button>
          <button 
            className={`preview-tab ${previewType === 'word' ? 'active' : ''}`}
            onClick={() => setPreviewType('word')}
          >
            <i className="fas fa-file-word"></i> 依頼文書
          </button>
        </div>
      </div>
      
      <div className="preview-content">
        {previewType === 'excel1' && (
          <div className="excel-preview">
            <h4>見積依頼書</h4>
            <div className="preview-info">
              <p><strong>ファイル名:</strong> {getFilenames().excel1}</p>
              <p><strong>内容:</strong> ベンダーへの見積もり依頼の概要情報を含むExcelファイル</p>
              <p><strong>ステータス:</strong> {generationStatus.excel1 ? '生成済み' : '未生成'}</p>
              {generatedFiles.excel1 && (
                <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={() => handleOpenFile(generatedFiles.excel1)}
                >
                  <i className="fas fa-external-link-alt"></i> 開く
                </button>
              )}
            </div>
          </div>
        )}
        
        {previewType === 'excel2' && (
          <div className="excel-preview">
            <h4>仕様書</h4>
            <div className="preview-info">
              <p><strong>ファイル名:</strong> {getFilenames().excel2}</p>
              <p><strong>内容:</strong> 依頼アイテムの詳細仕様を含むExcelファイル</p>
              <p><strong>ステータス:</strong> {generationStatus.excel2 ? '生成済み' : '未生成'}</p>
              {generatedFiles.excel2 && (
                <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={() => handleOpenFile(generatedFiles.excel2)}
                >
                  <i className="fas fa-external-link-alt"></i> 開く
                </button>
              )}
            </div>
          </div>
        )}
        
        {previewType === 'word' && (
          <div className="word-preview">
            <h4>依頼文書</h4>
            <div className="preview-info">
              <p><strong>ファイル名:</strong> {getFilenames().word}</p>
              <p><strong>内容:</strong> 見積もり依頼の正式文書（Word形式）</p>
              <p><strong>ステータス:</strong> {generationStatus.word ? '生成済み' : '未生成'}</p>
              {generatedFiles.word && (
                <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={() => handleOpenFile(generatedFiles.word)}
                >
                  <i className="fas fa-external-link-alt"></i> 開く
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="preview-actions">
        <button 
          className="btn btn-secondary" 
          onClick={resetForm}
        >
          <i className="fas fa-arrow-left"></i> フォームに戻る
        </button>
        <button 
          className="btn btn-primary" 
          onClick={generateAllDocuments}
          disabled={!outputDir}
        >
          <i className="fas fa-file-export"></i> すべての文書を生成
        </button>
      </div>
    </div>
  );
};

export default PreviewPanel;
