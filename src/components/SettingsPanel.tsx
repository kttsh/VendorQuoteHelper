import React, { useState } from 'react';
// Tauri-specific imports commented out for web-only mode
// import { open } from '@tauri-apps/api/dialog';
// import { saveUserPreferences, loadUserPreferences } from '../utils/storage';
// import { templateExists, uploadTemplate } from '../utils/templateManager';

interface SettingsPanelProps {
  preferences: {
    outputDirectory: string;
    companyDetails: {
      name: string;
      contact: string;
      email: string;
      phone: string;
    };
    recentOutputs: string[];
  };
  setPreferences: React.Dispatch<React.SetStateAction<{
    outputDirectory: string;
    companyDetails: {
      name: string;
      contact: string;
      email: string;
      phone: string;
    };
    recentOutputs: string[];
  }>>;
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  preferences,
  setPreferences,
  setStatusMessage
}) => {
  const [companyDetails, setCompanyDetails] = useState({
    name: preferences.companyDetails.name,
    contact: preferences.companyDetails.contact,
    email: preferences.companyDetails.email,
    phone: preferences.companyDetails.phone,
  });
  const [templateType, setTemplateType] = useState<'excel-quote' | 'excel-spec' | 'word'>('excel-quote');
  const [templateStatus, setTemplateStatus] = useState({
    'excel-quote': false,
    'excel-spec': false,
    'word': false
  });

  // In web-only mode, we'll simulate template statuses
  React.useEffect(() => {
    // In a real desktop app, we would check if template files exist
    // Here we'll just simulate some templates being present
    setTemplateStatus({
      'excel-quote': true,
      'excel-spec': false,
      'word': true
    });
  }, []);

  // Web-only mode mock directory selection
  const handleSelectDefaultOutputDir = async () => {
    try {
      // In web-only mode, we just simulate a directory selection
      const mockSelectedDir = '/Users/user/Documents/見積依頼';
      
      setPreferences(prev => ({
        ...prev,
        outputDirectory: mockSelectedDir
      }));
      
      setStatusMessage('デフォルト出力先フォルダを設定しました。');
    } catch (error) {
      console.error('Failed to select directory:', error);
      setStatusMessage('フォルダの選択に失敗しました。');
    }
  };

  const handleCompanyDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Web-only mode mock company information save
  const saveCompanyDetails = async () => {
    try {
      // Just update the state in web-only mode
      setPreferences(prev => ({
        ...prev,
        companyDetails
      }));
      
      setStatusMessage('会社情報を保存しました。');
    } catch (error) {
      console.error('Failed to save company details:', error);
      setStatusMessage('会社情報の保存に失敗しました。');
    }
  };

  // Web-only mode mock template upload
  const handleUploadTemplate = async () => {
    try {
      // In web-only mode, we just simulate a file selection
      // and update the template status
      
      // Simulate file selection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update template status
      setTemplateStatus(prev => ({
        ...prev,
        [templateType]: true
      }));
      
      setStatusMessage(`${getTemplateTypeName(templateType)}テンプレートをアップロードしました。`);
    } catch (error) {
      console.error('Failed to upload template:', error);
      setStatusMessage('テンプレートのアップロードに失敗しました。');
    }
  };

  const getTemplateTypeName = (type: string) => {
    switch (type) {
      case 'excel-quote': return '見積依頼書';
      case 'excel-spec': return '仕様書';
      case 'word': return '依頼文書';
      default: return '';
    }
  };

  return (
    <div className="settings-panel">
      <h2>設定</h2>
      
      <div className="settings-section">
        <h3>デフォルト出力先フォルダ</h3>
        <div className="directory-selector">
          <input
            type="text"
            className="form-control"
            value={preferences.outputDirectory}
            readOnly
            placeholder="デフォルト出力先フォルダを選択してください"
          />
          <button 
            className="btn btn-outline-secondary" 
            onClick={handleSelectDefaultOutputDir}
          >
            <i className="fas fa-folder-open"></i> 参照
          </button>
        </div>
        
        {preferences.recentOutputs.length > 0 && (
          <div className="recent-directories">
            <h4>最近使用したフォルダ</h4>
            <ul className="recent-list">
              {preferences.recentOutputs.map((dir, index) => (
                <li key={index} className="recent-item">
                  <i className="fas fa-folder"></i>
                  <span className="directory-path">{dir}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="settings-section">
        <h3>会社情報</h3>
        <div className="form-group">
          <label htmlFor="name">会社名</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={companyDetails.name}
            onChange={handleCompanyDetailsChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contact">担当者名</label>
          <input
            type="text"
            id="contact"
            name="contact"
            className="form-control"
            value={companyDetails.contact}
            onChange={handleCompanyDetailsChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={companyDetails.email}
              onChange={handleCompanyDetailsChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">電話番号</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-control"
              value={companyDetails.phone}
              onChange={handleCompanyDetailsChange}
            />
          </div>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={saveCompanyDetails}
        >
          <i className="fas fa-save"></i> 会社情報を保存
        </button>
      </div>
      
      <div className="settings-section">
        <h3>テンプレート管理</h3>
        <div className="template-selector">
          <div className="template-tabs">
            <button 
              className={`template-tab ${templateType === 'excel-quote' ? 'active' : ''}`}
              onClick={() => setTemplateType('excel-quote')}
            >
              <i className="fas fa-file-excel"></i> 見積依頼書
            </button>
            <button 
              className={`template-tab ${templateType === 'excel-spec' ? 'active' : ''}`}
              onClick={() => setTemplateType('excel-spec')}
            >
              <i className="fas fa-file-excel"></i> 仕様書
            </button>
            <button 
              className={`template-tab ${templateType === 'word' ? 'active' : ''}`}
              onClick={() => setTemplateType('word')}
            >
              <i className="fas fa-file-word"></i> 依頼文書
            </button>
          </div>
          
          <div className="template-status">
            <p>
              <strong>ステータス:</strong> 
              {templateStatus[templateType] ? (
                <span className="status-active">テンプレート設定済み</span>
              ) : (
                <span className="status-inactive">テンプレート未設定</span>
              )}
            </p>
            <button 
              className="btn btn-outline-primary" 
              onClick={handleUploadTemplate}
            >
              <i className="fas fa-upload"></i> テンプレートをアップロード
            </button>
          </div>
          
          <div className="template-info">
            <h4>テンプレート情報</h4>
            <p>テンプレートファイルは以下の要素を含む必要があります:</p>
            {templateType === 'excel-quote' && (
              <ul>
                <li>プロジェクト名</li>
                <li>ベンダー名</li>
                <li>納期</li>
                <li>アイテムリスト</li>
                <li>依頼種別</li>
              </ul>
            )}
            {templateType === 'excel-spec' && (
              <ul>
                <li>プロジェクト名</li>
                <li>アイテム詳細表</li>
                <li>仕様詳細セクション</li>
                <li>数量情報</li>
              </ul>
            )}
            {templateType === 'word' && (
              <ul>
                <li>見積依頼文書のフォーマット</li>
                <li>会社情報プレースホルダー</li>
                <li>プロジェクト詳細セクション</li>
                <li>依頼条件セクション</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
