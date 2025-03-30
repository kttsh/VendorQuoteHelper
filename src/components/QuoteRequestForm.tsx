import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

interface CompanyDetails {
  name: string;
  contact: string;
  email: string;
  phone: string;
}

interface QuoteRequestFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
  companyDetails: CompanyDetails;
}

interface FormData {
  projectName: string;
  projectId: string;
  vendorName: string;
  deadline: string;
  itemsRequested: Array<{
    name: string;
    quantity: number;
    specifications: string;
  }>;
  projectDetails: string;
  requestType: 'standard' | 'urgent' | 'special';
  additionalNotes: string;
  includeCompanyDetails: boolean;
}

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({ 
  initialData, 
  onSubmit,
  companyDetails
}) => {
  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      projectName: initialData.projectName || '',
      projectId: initialData.projectId || generateProjectId(),
      vendorName: initialData.vendorName || '',
      deadline: initialData.deadline || getDefaultDeadline(),
      itemsRequested: initialData.itemsRequested?.length > 0 
        ? initialData.itemsRequested 
        : [{ name: '', quantity: 1, specifications: '' }],
      projectDetails: initialData.projectDetails || '',
      requestType: initialData.requestType || 'standard',
      additionalNotes: initialData.additionalNotes || '',
      includeCompanyDetails: initialData.includeCompanyDetails !== undefined ? initialData.includeCompanyDetails : true
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itemsRequested"
  });
  
  const includeCompanyDetails = watch('includeCompanyDetails');

  function generateProjectId() {
    const date = new Date();
    return `PRJ-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  function getDefaultDeadline() {
    const date = new Date();
    date.setDate(date.getDate() + 14); // Default deadline is 2 weeks from now
    return date.toISOString().split('T')[0];
  }

  return (
    <div className="quote-request-form">
      <h2>見積依頼情報入力</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <h3>基本情報</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectName">プロジェクト名</label>
              <input
                id="projectName"
                type="text"
                className={`form-control ${errors.projectName ? 'is-invalid' : ''}`}
                {...register('projectName', { required: 'プロジェクト名は必須です' })}
              />
              {errors.projectName && <div className="invalid-feedback">{errors.projectName.message}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="projectId">プロジェクトID</label>
              <input
                id="projectId"
                type="text"
                className="form-control"
                {...register('projectId')}
                readOnly
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vendorName">ベンダー名</label>
              <input
                id="vendorName"
                type="text"
                className={`form-control ${errors.vendorName ? 'is-invalid' : ''}`}
                {...register('vendorName', { required: 'ベンダー名は必須です' })}
              />
              {errors.vendorName && <div className="invalid-feedback">{errors.vendorName.message}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="deadline">納期</label>
              <input
                id="deadline"
                type="date"
                className={`form-control ${errors.deadline ? 'is-invalid' : ''}`}
                {...register('deadline', { required: '納期は必須です' })}
              />
              {errors.deadline && <div className="invalid-feedback">{errors.deadline.message}</div>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>依頼アイテム</h3>
          
          {fields.map((field, index) => (
            <div className="item-row" key={field.id}>
              <div className="form-row">
                <div className="form-group item-name">
                  <label htmlFor={`itemsRequested.${index}.name`}>アイテム名</label>
                  <input
                    id={`itemsRequested.${index}.name`}
                    type="text"
                    className={`form-control ${errors.itemsRequested?.[index]?.name ? 'is-invalid' : ''}`}
                    {...register(`itemsRequested.${index}.name` as const, { required: 'アイテム名は必須です' })}
                  />
                  {errors.itemsRequested?.[index]?.name && <div className="invalid-feedback">{errors.itemsRequested[index].name?.message}</div>}
                </div>
                
                <div className="form-group item-quantity">
                  <label htmlFor={`itemsRequested.${index}.quantity`}>数量</label>
                  <input
                    id={`itemsRequested.${index}.quantity`}
                    type="number"
                    min="1"
                    className={`form-control ${errors.itemsRequested?.[index]?.quantity ? 'is-invalid' : ''}`}
                    {...register(`itemsRequested.${index}.quantity` as const, { 
                      required: '数量は必須です',
                      min: { value: 1, message: '数量は1以上である必要があります' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.itemsRequested?.[index]?.quantity && <div className="invalid-feedback">{errors.itemsRequested[index].quantity?.message}</div>}
                </div>
                
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    className="btn btn-danger remove-item"
                    onClick={() => remove(index)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor={`itemsRequested.${index}.specifications`}>仕様</label>
                <textarea
                  id={`itemsRequested.${index}.specifications`}
                  className="form-control"
                  rows={2}
                  {...register(`itemsRequested.${index}.specifications` as const)}
                ></textarea>
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            className="btn btn-secondary add-item"
            onClick={() => append({ name: '', quantity: 1, specifications: '' })}
          >
            <i className="fas fa-plus"></i> アイテムを追加
          </button>
        </div>
        
        <div className="form-section">
          <h3>追加情報</h3>
          
          <div className="form-group">
            <label htmlFor="projectDetails">プロジェクト詳細</label>
            <textarea
              id="projectDetails"
              className="form-control"
              rows={4}
              {...register('projectDetails')}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>依頼種別</label>
            <div className="request-type-options">
              <label className="radio-label">
                <input
                  type="radio"
                  value="standard"
                  {...register('requestType')}
                /> 標準
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="urgent"
                  {...register('requestType')}
                /> 緊急
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="special"
                  {...register('requestType')}
                /> 特別
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="additionalNotes">備考</label>
            <textarea
              id="additionalNotes"
              className="form-control"
              rows={3}
              {...register('additionalNotes')}
            ></textarea>
          </div>
        </div>
        
        {companyDetails.name && (
          <div className="form-section">
            <h3>会社情報</h3>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="includeCompanyDetails"
                className="form-check-input"
                {...register('includeCompanyDetails')}
              />
              <label className="form-check-label" htmlFor="includeCompanyDetails">
                会社情報を含める
              </label>
            </div>
            
            {includeCompanyDetails && (
              <div className="company-details-preview">
                <p><strong>会社名:</strong> {companyDetails.name}</p>
                <p><strong>担当者:</strong> {companyDetails.contact}</p>
                <p><strong>メール:</strong> {companyDetails.email}</p>
                <p><strong>電話番号:</strong> {companyDetails.phone}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-file-export"></i> 文書を生成
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteRequestForm;
