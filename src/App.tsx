import React, { useState, useRef, useEffect } from 'react';
import { Printer, Store, Package, Trash2, Save, Download, CreditCard, Languages, Edit } from 'lucide-react';
import UpdateNotification from './components/UpdateNotification';
import { useTranslation } from 'react-i18next';
import './i18n';
import { ReceiptTemplate, ReceiptItem, generateReceiptNumber, Receipt } from './utils/receipt';
import { getInitialReceiptData } from './data/initialData';
import { templates } from './data/templates';
import ReceiptPreview from './components/ReceiptPreview';
import ItemForm from './components/ItemForm';
import ThemeToggle from './components/ThemeToggle';
import GithubLink from './components/GithubLink';
import { snapdom } from '@zumer/snapdom';

function App() {
  const { t, i18n } = useTranslation();

  // Set initial language based on localStorage or browser preference
  useEffect(() => {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdatePrompt(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage('skipWaiting');
          // 添加延迟确保消息被处理
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          // 如果没有等待的worker，强制重新加载以获取更新
          window.location.reload();
        }
      });
    } else {
      // 如果不支持Service Worker，直接重新加载
      window.location.reload();
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('receiptLang');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    } else {
      const browserLang = navigator.language;
      const defaultLang = browserLang.startsWith('zh') ? 'zh' : 'en';
      i18n.changeLanguage(defaultLang);
    }
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('receiptLang', lng);
  };
  const [receiptData, setReceiptData] = useState<Receipt>(getInitialReceiptData());

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | undefined>();
  const [editingItem, setEditingItem] = useState<ReceiptItem | undefined>();
  const receiptRef = useRef<HTMLDivElement>(null);

  const calculateTotal = () => {
    return receiptData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleAddItem = (item: ReceiptItem) => {
    setReceiptData(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setReceiptData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    if (editingIndex === index) {
      setEditingIndex(undefined);
      setEditingItem(undefined);
    }
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setEditingItem(receiptData.items[index]);
  };

  const handleUpdateItem = (item: ReceiptItem, index: number) => {
    setReceiptData(prev => ({
      ...prev,
      items: prev.items.map((i, idx) => idx === index ? item : i),
    }));
    setEditingIndex(undefined);
    setEditingItem(undefined);
  };

  const handleTemplateChange = (template: ReceiptTemplate) => {
    setReceiptData(prev => ({
      ...prev,
      template,
      storeName: template.defaultStoreName,
      footerText: 'thankYou',
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsPrinting(true);
    
    // Update receipt number when regenerating
    setReceiptData(prev => ({
      ...prev,
      receiptNumber: generateReceiptNumber(),
      time: new Date().toLocaleTimeString(),
      paymentInfo: {
        ...prev.paymentInfo,
        transactionId: generateReceiptNumber()
      }
    }));
    
    // Ensure template with thermalTexture is preserved
    const currentTemplate = receiptData.template;
    
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update states in correct order
    setIsGenerating(false);
    setIsPrinting(false);
    
    // Restore template after printing
    setReceiptData(prev => ({
      ...prev,
      template: currentTemplate
    }));
  };

  const handleDownload = async () => {
    try {
      if (!receiptRef.current || isGenerating) return;

      const result = await snapdom(receiptRef.current, {
        scale: 1,
        embedFonts: true,
        compress: true,
        backgroundColor: 'transparent', // 设置透明背景，去除锯齿外的白色部分
      });

      // 直接使用snapdom的download方法下载图片
      await result.download({
        format: 'png',
        filename: `receipt-${receiptData.receiptNumber}`,
        backgroundColor: 'transparent' // 确保下载时也使用透明背景
      });
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  const handleReset = () => {
    setReceiptData(getInitialReceiptData());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {showUpdatePrompt && <UpdateNotification onUpdate={handleUpdate} />}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Input Form */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 dark:text-gray-100">

              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 w-full sm:w-auto">
                  <Printer className="w-5 sm:w-6 h-5 sm:h-6" />
                  {t('receiptGenerator')}
                </h1>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <GithubLink />
                  <ThemeToggle />
                  <Languages className="w-5 h-5 text-gray-500" />
                  <select 
                    onChange={(e) => changeLanguage(e.target.value)}
                    value={i18n.language}
                    className="rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm px-2 py-1"
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>

              {/* Template Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      receiptData.template.id === template.id
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-gray-700 dark:text-gray-100'
                        : 'border-gray-200 hover:border-blue-200 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {template.icon}
                      <span className="font-medium">{t(template.name)}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Store Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t('businessName')}
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={t(receiptData.storeName)}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, storeName: e.target.value }))}
                      className="pl-10 w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200"
                      placeholder={t('enterBusinessName')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t('footerText')}
                  </label>
                  <input
                    type="text"
                    value={t(receiptData.footerText)}
                    onChange={(e) => setReceiptData(prev => ({ ...prev, footerText: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200"
                    placeholder={t('enterFooterText')}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showTax"
                    checked={receiptData.template.showTax}
                    onChange={(e) => setReceiptData(prev => ({
                      ...prev,
                      template: {
                        ...prev.template,
                        showTax: e.target.checked
                      }
                    }))}
                    className="rounded border border-gray-300 text-blue-600 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 px-2 py-1 transition-colors duration-200"
                  />
                  <label htmlFor="showTax" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('showTax')}
                  </label>
                </div>

                <div className="grid grid-cols-2 w-full gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('date')}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={receiptData.date}
                        onChange={(e) => setReceiptData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('time')}
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={receiptData.time}
                        onChange={(e) => setReceiptData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200 dark:calendar-picker-indicator:text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Template-specific fields */}
                {receiptData.template.fields.roomNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t('roomNumber')}
                    </label>
                    <input
                      type="text"
                      value={receiptData.roomNumber}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200"
                      placeholder={t('enterRoomNumber')}
                    />
                  </div>
                )}

                {receiptData.template.fields.patientId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t('patientId')}
                    </label>
                    <input
                      type="text"
                      value={receiptData.patientId}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, patientId: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200"
                      placeholder={t('enterPatientId')}
                    />
                  </div>
                )}

                {receiptData.template.fields.serviceDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t('serviceDate')}
                    </label>
                    <input
                      type="date"
                      value={receiptData.serviceDate}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, serviceDate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200"
                    />
                  </div>
                )}

                {receiptData.template.fields.invoiceNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t('invoiceNumber')}
                    </label>
                    <input
                      type="text"
                      value={receiptData.invoiceNumber}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200"
                      placeholder={t('enterInvoiceNumber')}
                    />
                  </div>
                )}

                {/* Payment Information */}
                <div className="space-y-4 pt-4 border-t dark:border-gray-600">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {t('paymentInformation')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        {t('paymentMethod')}
                      </label>
                      <select
                        value={receiptData.paymentInfo.method}
                        onChange={(e) => setReceiptData(prev => ({
                          ...prev,
                          paymentInfo: { ...prev.paymentInfo, method: e.target.value }
                        }))}
                        className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200 h-[34px] "
                      >
                        <option value="Credit Card">{t('creditCard')}</option>
                        <option value="Debit Card">{t('debitCard')}</option>
                        <option value="Cash">{t('cash')}</option>
                        <option value="Bank Transfer">{t('bankTransfer')}</option>
                      </select>
                    </div>
                    {(receiptData.paymentInfo.method === 'Credit Card' || receiptData.paymentInfo.method === 'Debit Card') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          {t('last4Digits')}
                        </label>
                        <input
                          type="text"
                          value={receiptData.paymentInfo.cardLastFour}
                          onChange={(e) => setReceiptData(prev => ({
                            ...prev,
                            paymentInfo: { ...prev.paymentInfo, cardLastFour: e.target.value }
                          }))}
                          maxLength={4}
                          className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none px-2 py-1 transition-colors duration-200"
                          placeholder="1234"
                        />
                      </div>
                    )}
                  </div>
                  {/* 新增：是否显示交易单号 */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showTransactionId"
                      checked={receiptData.template.showTransactionId}
                      onChange={(e) => setReceiptData(prev => ({
                        ...prev,
                        template: { ...prev.template, showTransactionId: e.target.checked }
                      }))}
                      className="rounded border border-gray-300 text-blue-600 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 px-2 py-1 transition-colors duration-200"
                    />
                    <label htmlFor="showTransactionId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('showTransactionId')}
                    </label>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {i18n.language === 'en' ? `${t(receiptData.template.itemLabel)}s` : t(receiptData.template.itemLabel)}
                </h2>

                <ItemForm 
                onAdd={handleAddItem} 
                onEdit={handleUpdateItem}
                template={receiptData.template}
                editingItem={editingItem}
                editingIndex={editingIndex}
              />

                <div className="space-y-2">
                  {receiptData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg dark:text-gray-100"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditItem(index)}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center py-4 border-t dark:border-gray-600">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || receiptData.items.length === 0}
                  className="w-full sm:flex-1 bg-blue-500 dark:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t('generateReceipt')}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!isGenerating && isPrinting}
                  className="w-full sm:flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t('download')}
                </button>
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="w-full lg:w-1/2">
            <ReceiptPreview
              data={receiptData}
              isPrinting={isPrinting}
              total={calculateTotal()}
              receiptRef={receiptRef}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;