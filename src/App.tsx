import React, { useState, useEffect } from 'react';
// Commented out Tauri-specific imports to make the app work in web-only mode
// import { invoke } from '@tauri-apps/api/tauri';
// import { appWindow } from '@tauri-apps/api/window';
import QuoteRequestForm from './components/QuoteRequestForm';
import PreviewPanel from './components/PreviewPanel';
import SettingsPanel from './components/SettingsPanel';
import FileGenerationStatus from './components/FileGenerationStatus';
// import { loadUserPreferences } from './utils/storage';

type AppTab = 'form' | 'preview' | 'settings';

interface UserPreferences {
  outputDirectory: string;
  companyDetails: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  recentOutputs: string[];
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('form');
  const [formData, setFormData] = useState({
    projectName: '',
    vendorName: '',
    deadline: '',
    itemsRequested: [],
    projectDetails: '',
    requestType: 'standard',
  });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    outputDirectory: '',
    companyDetails: {
      name: '',
      contact: '',
      email: '',
      phone: '',
    },
    recentOutputs: [],
  });
  const [generatedFiles, setGeneratedFiles] = useState<{
    excel1: string | null;
    excel2: string | null;
    word: string | null;
  }>({
    excel1: null,
    excel2: null,
    word: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Initialize app data on start
  useEffect(() => {
    const initApp = async () => {
      try {
        // In web-only mode, we'll use mock data instead of loading from Tauri storage
        const mockUserPreferences = {
          outputDirectory: '/example/path/to/documents',
          companyDetails: {
            name: 'サンプル株式会社',
            contact: '山田太郎',
            email: 'yamada@example.com',
            phone: '03-1234-5678',
          },
          recentOutputs: [
            '/example/path/to/documents',
            '/example/path/to/other/documents',
          ],
        };
        
        setUserPreferences(mockUserPreferences);
        setStatusMessage('アプリの初期化が完了しました。');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setStatusMessage('アプリの初期化に失敗しました。');
      }
    };

    initApp();
  }, []);

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    // When form is submitted, switch to preview tab
    setActiveTab('preview');
  };

  const resetForm = () => {
    setFormData({
      projectName: '',
      vendorName: '',
      deadline: '',
      itemsRequested: [],
      projectDetails: '',
      requestType: 'standard',
    });
    setGeneratedFiles({
      excel1: null,
      excel2: null,
      word: null,
    });
    setActiveTab('form');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>見積依頼文書ジェネレーター</h1>
        {/* Window controls disabled in web version */}
        <div className="window-controls">
          <button 
            className="minimize-btn" 
            onClick={() => console.log('minimize clicked')}
          >
            <i className="fas fa-window-minimize"></i>
          </button>
          <button 
            className="close-btn" 
            onClick={() => console.log('close clicked')}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <ul>
          <li 
            className={activeTab === 'form' ? 'active' : ''}
            onClick={() => setActiveTab('form')}
          >
            <i className="fas fa-file-alt"></i> フォーム
          </li>
          <li 
            className={activeTab === 'preview' ? 'active' : ''}
            onClick={() => setActiveTab('preview')}
          >
            <i className="fas fa-eye"></i> プレビュー
          </li>
          <li 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i> 設定
          </li>
        </ul>
      </nav>

      <main className="app-content">
        {activeTab === 'form' && (
          <QuoteRequestForm 
            initialData={formData} 
            onSubmit={handleFormSubmit} 
            companyDetails={userPreferences.companyDetails}
          />
        )}
        
        {activeTab === 'preview' && (
          <PreviewPanel 
            formData={formData}
            generatedFiles={generatedFiles}
            outputDirectory={userPreferences.outputDirectory}
            setGeneratedFiles={setGeneratedFiles}
            resetForm={resetForm}
            setStatusMessage={setStatusMessage}
            setIsLoading={setIsLoading}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsPanel 
            preferences={userPreferences}
            setPreferences={setUserPreferences}
            setStatusMessage={setStatusMessage}
          />
        )}
      </main>

      <footer className="app-footer">
        <FileGenerationStatus 
          isLoading={isLoading} 
          message={statusMessage} 
        />
      </footer>
    </div>
  );
};

export default App;
