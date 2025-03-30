import { readBinaryFile, writeBinaryFile, exists } from '@tauri-apps/api/fs';
import { join } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri';

// Type for template
type TemplateType = 'excel-quote' | 'excel-spec' | 'word';

// Template filename mapping
const templateFilenames: Record<TemplateType, string> = {
  'excel-quote': 'excel-quote-template.xlsx',
  'excel-spec': 'excel-spec-template.xlsx',
  'word': 'word-template.docx'
};

// Check if a template exists
export const templateExists = async (templateType: TemplateType): Promise<boolean> => {
  try {
    const templatesDir = await invoke('ensure_templates_dir') as string;
    const templatePath = await join(templatesDir, templateFilenames[templateType]);
    return await exists(templatePath);
  } catch (error) {
    console.error(`Error checking if template ${templateType} exists:`, error);
    return false;
  }
};

// Upload a template
export const uploadTemplate = async (templateType: TemplateType, sourcePath: string): Promise<boolean> => {
  try {
    const templatesDir = await invoke('ensure_templates_dir') as string;
    const templatePath = await join(templatesDir, templateFilenames[templateType]);
    
    // Read the source file
    const fileData = await readBinaryFile(sourcePath);
    
    // Write to the template location
    await writeBinaryFile(templatePath, fileData);
    
    return true;
  } catch (error) {
    console.error(`Error uploading template ${templateType}:`, error);
    throw new Error(`テンプレートのアップロードに失敗しました: ${error}`);
  }
};

// Get the path to a template
export const getTemplatePath = async (templateType: TemplateType): Promise<string> => {
  try {
    const templatesDir = await invoke('ensure_templates_dir') as string;
    return await join(templatesDir, templateFilenames[templateType]);
  } catch (error) {
    console.error(`Error getting template path for ${templateType}:`, error);
    throw new Error(`テンプレートパスの取得に失敗しました: ${error}`);
  }
};
