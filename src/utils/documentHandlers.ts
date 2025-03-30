import { writeTextFile, readTextFile, readBinaryFile, writeBinaryFile } from '@tauri-apps/api/fs';
import { join, appDataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri';
import * as ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle } from 'docx';

// Load template or create default one for Excel Quote Request
const getQuoteRequestTemplate = async () => {
  try {
    const templatesDir = await invoke('ensure_templates_dir') as string;
    const templatePath = await join(templatesDir, 'excel-quote-template.xlsx');
    
    try {
      const fileData = await readBinaryFile(templatePath);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileData.buffer);
      return workbook;
    } catch (err) {
      // If template doesn't exist, create a default one
      console.log('Creating default quote request template');
      return createDefaultQuoteRequestWorkbook();
    }
  } catch (error) {
    console.error('Error getting quote request template:', error);
    return createDefaultQuoteRequestWorkbook();
  }
};

// Load template or create default one for Excel Spec Sheet
const getSpecSheetTemplate = async () => {
  try {
    const templatesDir = await invoke('ensure_templates_dir') as string;
    const templatePath = await join(templatesDir, 'excel-spec-template.xlsx');
    
    try {
      const fileData = await readBinaryFile(templatePath);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileData.buffer);
      return workbook;
    } catch (err) {
      // If template doesn't exist, create a default one
      console.log('Creating default spec sheet template');
      return createDefaultSpecSheetWorkbook();
    }
  } catch (error) {
    console.error('Error getting spec sheet template:', error);
    return createDefaultSpecSheetWorkbook();
  }
};

// Create a default workbook for quote requests
const createDefaultQuoteRequestWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('見積依頼');
  
  // Add headers
  worksheet.columns = [
    { header: '項目', key: 'item', width: 20 },
    { header: '詳細', key: 'details', width: 50 }
  ];
  
  // Style headers
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Add basic rows
  worksheet.addRow({ item: 'プロジェクト名', details: '' });
  worksheet.addRow({ item: 'プロジェクトID', details: '' });
  worksheet.addRow({ item: 'ベンダー名', details: '' });
  worksheet.addRow({ item: '納期', details: '' });
  worksheet.addRow({ item: '依頼種別', details: '' });
  
  // Empty row
  worksheet.addRow({});
  
  // Items section
  worksheet.addRow({ item: '依頼アイテム', details: '' });
  worksheet.getRow(7).font = { bold: true };
  
  // Item headers
  worksheet.getCell('A8').value = 'アイテム名';
  worksheet.getCell('B8').value = '数量';
  worksheet.getCell('C8').value = '仕様';
  
  // Style item headers
  ['A8', 'B8', 'C8'].forEach(cell => {
    worksheet.getCell(cell).font = { bold: true };
    worksheet.getCell(cell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };
  });
  
  return workbook;
};

// Create a default workbook for spec sheets
const createDefaultSpecSheetWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('仕様書');
  
  // Add headers
  worksheet.columns = [
    { header: 'アイテム', key: 'item', width: 20 },
    { header: '数量', key: 'quantity', width: 10 },
    { header: '仕様詳細', key: 'specifications', width: 50 }
  ];
  
  // Style headers
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Project header
  worksheet.addRow([]);
  worksheet.getCell('A2').value = 'プロジェクト名:';
  worksheet.getCell('A2').font = { bold: true };
  worksheet.getCell('B2').value = '';
  
  // Vendor header
  worksheet.getCell('A3').value = 'ベンダー名:';
  worksheet.getCell('A3').font = { bold: true };
  worksheet.getCell('B3').value = '';
  
  // Deadline header
  worksheet.getCell('A4').value = '納期:';
  worksheet.getCell('A4').font = { bold: true };
  worksheet.getCell('B4').value = '';
  
  // Empty row
  worksheet.addRow([]);
  
  // Items header
  worksheet.getCell('A6').value = '依頼アイテム詳細';
  worksheet.getCell('A6').font = { bold: true, size: 14 };
  
  // Items table headers
  worksheet.getCell('A7').value = 'アイテム名';
  worksheet.getCell('B7').value = '数量';
  worksheet.getCell('C7').value = '仕様詳細';
  
  // Style items table headers
  ['A7', 'B7', 'C7'].forEach(cell => {
    worksheet.getCell(cell).font = { bold: true };
    worksheet.getCell(cell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };
  });
  
  return workbook;
};

// Generate Excel Quote Request document
export const generateExcelQuoteRequest = async (formData: any, outputDir: string, filename: string) => {
  try {
    const workbook = await getQuoteRequestTemplate();
    const worksheet = workbook.getWorksheet('見積依頼');
    
    if (!worksheet) {
      throw new Error('見積依頼ワークシートが見つかりません');
    }
    
    // Fill in the basic information
    worksheet.getCell('B2').value = formData.projectName;
    worksheet.getCell('B3').value = formData.projectId;
    worksheet.getCell('B4').value = formData.vendorName;
    worksheet.getCell('B5').value = formData.deadline;
    worksheet.getCell('B6').value = getRequestTypeText(formData.requestType);
    
    // Calculate the starting row for items
    const startRow = 9;
    
    // Clear any existing item rows
    for (let i = 0; i < 20; i++) {
      const rowIndex = startRow + i;
      const row = worksheet.getRow(rowIndex);
      row.getCell(1).value = null;
      row.getCell(2).value = null;
      row.getCell(3).value = null;
    }
    
    // Fill in items
    formData.itemsRequested.forEach((item: any, index: number) => {
      const rowIndex = startRow + index;
      worksheet.getCell(`A${rowIndex}`).value = item.name;
      worksheet.getCell(`B${rowIndex}`).value = item.quantity;
      worksheet.getCell(`C${rowIndex}`).value = item.specifications;
    });
    
    // Add additional notes if any
    if (formData.additionalNotes) {
      const notesRowIndex = startRow + formData.itemsRequested.length + 2;
      worksheet.getCell(`A${notesRowIndex}`).value = '備考';
      worksheet.getCell(`A${notesRowIndex}`).font = { bold: true };
      worksheet.getCell(`B${notesRowIndex}`).value = formData.additionalNotes;
    }
    
    // Add company details if included
    if (formData.includeCompanyDetails && formData.companyDetails) {
      const companyRowIndex = startRow + formData.itemsRequested.length + 4;
      worksheet.getCell(`A${companyRowIndex}`).value = '依頼会社情報';
      worksheet.getCell(`A${companyRowIndex}`).font = { bold: true };
      worksheet.getCell(`A${companyRowIndex + 1}`).value = '会社名';
      worksheet.getCell(`B${companyRowIndex + 1}`).value = formData.companyDetails.name;
      worksheet.getCell(`A${companyRowIndex + 2}`).value = '担当者';
      worksheet.getCell(`B${companyRowIndex + 2}`).value = formData.companyDetails.contact;
      worksheet.getCell(`A${companyRowIndex + 3}`).value = '連絡先';
      worksheet.getCell(`B${companyRowIndex + 3}`).value = 
        `${formData.companyDetails.email || ''}\n${formData.companyDetails.phone || ''}`;
    }
    
    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const filePath = await join(outputDir, filename);
    await writeBinaryFile(filePath, new Uint8Array(buffer));
    
    return filePath;
  } catch (error) {
    console.error('Error generating Excel quote request:', error);
    throw new Error(`Excel見積依頼書の生成に失敗しました: ${error}`);
  }
};

// Generate Excel Spec Sheet document
export const generateExcelSpecSheet = async (formData: any, outputDir: string, filename: string) => {
  try {
    const workbook = await getSpecSheetTemplate();
    const worksheet = workbook.getWorksheet('仕様書');
    
    if (!worksheet) {
      throw new Error('仕様書ワークシートが見つかりません');
    }
    
    // Fill in the basic information
    worksheet.getCell('B2').value = formData.projectName;
    worksheet.getCell('B3').value = formData.vendorName;
    worksheet.getCell('B4').value = formData.deadline;
    
    // Calculate the starting row for items
    const startRow = 8;
    
    // Clear any existing item rows
    for (let i = 0; i < 20; i++) {
      const rowIndex = startRow + i;
      const row = worksheet.getRow(rowIndex);
      row.getCell(1).value = null;
      row.getCell(2).value = null;
      row.getCell(3).value = null;
    }
    
    // Fill in items with detailed specifications
    formData.itemsRequested.forEach((item: any, index: number) => {
      const rowIndex = startRow + index;
      worksheet.getCell(`A${rowIndex}`).value = item.name;
      worksheet.getCell(`B${rowIndex}`).value = item.quantity;
      
      // Add detailed specifications with formatting
      let specs = item.specifications || '';
      if (formData.projectDetails) {
        if (specs) specs += '\n\n';
        specs += `関連プロジェクト詳細: ${formData.projectDetails}`;
      }
      
      worksheet.getCell(`C${rowIndex}`).value = specs;
      worksheet.getCell(`C${rowIndex}`).alignment = { wrapText: true };
    });
    
    // Add request type information
    const typeRowIndex = startRow + formData.itemsRequested.length + 2;
    worksheet.getCell(`A${typeRowIndex}`).value = '依頼種別';
    worksheet.getCell(`A${typeRowIndex}`).font = { bold: true };
    worksheet.getCell(`B${typeRowIndex}`).value = getRequestTypeText(formData.requestType);
    
    // Add additional notes if any
    if (formData.additionalNotes) {
      const notesRowIndex = typeRowIndex + 2;
      worksheet.getCell(`A${notesRowIndex}`).value = '備考';
      worksheet.getCell(`A${notesRowIndex}`).font = { bold: true };
      worksheet.getCell(`B${notesRowIndex}`).value = formData.additionalNotes;
      worksheet.mergeCells(`B${notesRowIndex}:C${notesRowIndex}`);
    }
    
    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const filePath = await join(outputDir, filename);
    await writeBinaryFile(filePath, new Uint8Array(buffer));
    
    return filePath;
  } catch (error) {
    console.error('Error generating Excel spec sheet:', error);
    throw new Error(`Excel仕様書の生成に失敗しました: ${error}`);
  }
};

// Generate Word Document
export const generateWordDocument = async (formData: any, outputDir: string, filename: string) => {
  try {
    // Create a new document
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            run: {
              font: 'メイリオ',
              size: 24,
            },
            paragraph: {
              spacing: {
                line: 276,
              },
            },
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              font: 'メイリオ',
              size: 32,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 240,
                after: 120,
              },
            },
          },
        ],
      },
    });
    
    const today = new Date();
    const formattedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    
    // Add document title
    doc.addSection({
      children: [
        new Paragraph({
          text: '見積依頼書',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `文書作成日: ${formattedDate}`,
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: `${formData.vendorName} 御中`,
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'プロジェクト名: ', bold: true }),
            new TextRun(formData.projectName),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'プロジェクトID: ', bold: true }),
            new TextRun(formData.projectId),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '納期: ', bold: true }),
            new TextRun(formData.deadline),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '依頼種別: ', bold: true }),
            new TextRun(getRequestTypeText(formData.requestType)),
          ],
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '以下の通り、見積もりのご依頼を申し上げます。',
        }),
        new Paragraph({
          text: '',
        }),
      ],
    });
    
    // Create a table for requested items
    const tableRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 30,
              type: 'percentage',
            },
            children: [new Paragraph({ text: 'アイテム名', alignment: AlignmentType.CENTER })],
            shading: {
              fill: 'E6E6E6',
            },
          }),
          new TableCell({
            width: {
              size: 15,
              type: 'percentage',
            },
            children: [new Paragraph({ text: '数量', alignment: AlignmentType.CENTER })],
            shading: {
              fill: 'E6E6E6',
            },
          }),
          new TableCell({
            width: {
              size: 55,
              type: 'percentage',
            },
            children: [new Paragraph({ text: '仕様', alignment: AlignmentType.CENTER })],
            shading: {
              fill: 'E6E6E6',
            },
          }),
        ],
      }),
    ];
    
    // Add rows for each item
    formData.itemsRequested.forEach((item: any) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(item.name)],
            }),
            new TableCell({
              children: [new Paragraph({ text: item.quantity.toString(), alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph(item.specifications || '')],
            }),
          ],
        })
      );
    });
    
    // Add the table to the document
    doc.addSection({
      children: [
        new Table({
          rows: tableRows,
          width: {
            size: 100,
            type: 'percentage',
          },
          borders: {
            top: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
            bottom: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
            left: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
            right: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
            insideHorizontal: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
            insideVertical: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
          },
        }),
      ],
    });
    
    // Add project details
    if (formData.projectDetails) {
      doc.addSection({
        children: [
          new Paragraph({
            text: '',
          }),
          new Paragraph({
            text: '【プロジェクト詳細】',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: formData.projectDetails,
          }),
        ],
      });
    }
    
    // Add additional notes
    if (formData.additionalNotes) {
      doc.addSection({
        children: [
          new Paragraph({
            text: '',
          }),
          new Paragraph({
            text: '【備考】',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: formData.additionalNotes,
          }),
        ],
      });
    }
    
    // Add company information if included
    if (formData.includeCompanyDetails && formData.companyDetails) {
      doc.addSection({
        children: [
          new Paragraph({
            text: '',
          }),
          new Paragraph({
            text: '【依頼会社情報】',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '会社名: ', bold: true }),
              new TextRun(formData.companyDetails.name),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '担当者: ', bold: true }),
              new TextRun(formData.companyDetails.contact),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'メール: ', bold: true }),
              new TextRun(formData.companyDetails.email),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '電話番号: ', bold: true }),
              new TextRun(formData.companyDetails.phone),
            ],
          }),
        ],
      });
    }
    
    // Save the document
    const buffer = await Packer.toBuffer(doc);
    const filePath = await join(outputDir, filename);
    await writeBinaryFile(filePath, new Uint8Array(buffer));
    
    return filePath;
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error(`Word文書の生成に失敗しました: ${error}`);
  }
};

// Helper function to get request type text
const getRequestTypeText = (type: string) => {
  switch (type) {
    case 'urgent':
      return '緊急';
    case 'special':
      return '特別';
    default:
      return '標準';
  }
};
