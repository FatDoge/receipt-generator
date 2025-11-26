import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import Barcode from 'react-barcode';
import { useTranslation } from 'react-i18next';
import { renderFormatCurrency, TAX_RATE } from '../utils/receipt';

interface ReceiptPreviewProps {
  data: {
    storeName: string;
    footerText: string;
    date: string;
    time: string;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      description?: string;
    }>;
    template: {
      name: string;
      defaultStoreName: string;
      thermalTexture: string;
      showTip: boolean;
      showTax: boolean;
      showTransactionId: boolean;
      itemLabel: string;
      priceLabel: string;
      quantityLabel: string;
      fields: {
        description: boolean;
        roomNumber?: boolean;
        patientId?: boolean;
        serviceDate?: boolean;
        invoiceNumber?: boolean;
      };
    };
    receiptNumber: string;
    roomNumber?: string;
    patientId?: string;
    serviceDate?: string;
    invoiceNumber?: string;
    paymentInfo: {
      method: string;
      cardLastFour?: string;
      transactionId: string;
    };
  };
  isPrinting: boolean;
  total: number;
  receiptRef: React.RefObject<HTMLDivElement>;
  onReset: () => void;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ data, isPrinting, total, receiptRef, onReset }) => {
  const subtotal = total;
  const tax = data.template.showTax ? subtotal * TAX_RATE : 0;
  const grandTotal = subtotal + tax;
  const { t, i18n } = useTranslation();
  const [isRipping, setIsRipping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isNewReceiptVisible, setIsNewReceiptVisible] = useState(true);

  const formatCurrency = renderFormatCurrency(i18n.language);

  const handleRipReceipt = () => {
    if (!isAnimating) {
      setIsRipping(true);
      setIsAnimating(true);
      setIsNewReceiptVisible(false);
      setTimeout(() => {
        setIsRipping(false);
        setTimeout(() => {
          setIsAnimating(false);
          setIsNewReceiptVisible(true);
          onReset();
        }, 500);
      }, 500);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    const { point, offset } = info;
    const { x, y } = point;
    const receiptElement = receiptRef.current;
    
    if (receiptElement) {
      const rect = receiptElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 增加拖拽距离阈值(100px)，只有当拖拽超出边界一定距离时才触发
      const threshold = 100;
      if (Math.abs(offset.x) > threshold || Math.abs(offset.y) > threshold) {
        if (Math.abs(x) > rect.width/2 || Math.abs(x - viewportWidth) > rect.width/2 ||
            Math.abs(y) > rect.height/2 || Math.abs(y - viewportHeight) > rect.height/2) {
          handleRipReceipt();
        }
      }
    }
  };


  return (
    <div id='receipt-preview' className="sticky top-8">
      <motion.div
        ref={receiptRef}
        initial={{ y: -200, opacity: 0 }}
        animate={isRipping ? { y: 1000, rotate: 15, opacity: 0 } : isNewReceiptVisible ? { y: 0, opacity: 1, rotate: 0 } : { y: -200, opacity: 0 }}
        dragSnapToOrigin
        transition={{ duration: 0.5, ease: "easeInOut" }}
        drag
        dragConstraints={{ top: -100, left: -100, right: 100, bottom: 100 }}
        dragElastic={0.3}
        whileDrag={{ scale: 1.02, boxShadow: "0 20px 40px -20px rgba(0,0,0,0.3),0 8px 12px -4px rgba(0,0,0,0.05)" }}
        onDragEnd={handleDragEnd}
        className="bg-transparent cursor-pointer shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.05)] p-4 overflow-hidden max-w-lg relative"
        style={{
          backgroundImage: `url(${data.template.thermalTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          clipPath: 'polygon(0% 0.5%, 0.5% 0%, 1% 0.5%, 1.5% 0%, 2% 0.5%, 2.5% 0%, 3% 0.5%, 3.5% 0%, 4% 0.5%, 4.5% 0%, 5% 0.5%, 5.5% 0%, 6% 0.5%, 6.5% 0%, 7% 0.5%, 7.5% 0%, 8% 0.5%, 8.5% 0%, 9% 0.5%, 9.5% 0%, 10% 0.5%, 10.5% 0%, 11% 0.5%, 11.5% 0%, 12% 0.5%, 12.5% 0%, 13% 0.5%, 13.5% 0%, 14% 0.5%, 14.5% 0%, 15% 0.5%, 15.5% 0%, 16% 0.5%, 16.5% 0%, 17% 0.5%, 17.5% 0%, 18% 0.5%, 18.5% 0%, 19% 0.5%, 19.5% 0%, 20% 0.5%, 20.5% 0%, 21% 0.5%, 21.5% 0%, 22% 0.5%, 22.5% 0%, 23% 0.5%, 23.5% 0%, 24% 0.5%, 24.5% 0%, 25% 0.5%, 25.5% 0%, 26% 0.5%, 26.5% 0%, 27% 0.5%, 27.5% 0%, 28% 0.5%, 28.5% 0%, 29% 0.5%, 29.5% 0%, 30% 0.5%, 30.5% 0%, 31% 0.5%, 31.5% 0%, 32% 0.5%, 32.5% 0%, 33% 0.5%, 33.5% 0%, 34% 0.5%, 34.5% 0%, 35% 0.5%, 35.5% 0%, 36% 0.5%, 36.5% 0%, 37% 0.5%, 37.5% 0%, 38% 0.5%, 38.5% 0%, 39% 0.5%, 39.5% 0%, 40% 0.5%, 40.5% 0%, 41% 0.5%, 41.5% 0%, 42% 0.5%, 42.5% 0%, 43% 0.5%, 43.5% 0%, 44% 0.5%, 44.5% 0%, 45% 0.5%, 45.5% 0%, 46% 0.5%, 46.5% 0%, 47% 0.5%, 47.5% 0%, 48% 0.5%, 48.5% 0%, 49% 0.5%, 49.5% 0%, 50% 0.5%, 50.5% 0%, 51% 0.5%, 51.5% 0%, 52% 0.5%, 52.5% 0%, 53% 0.5%, 53.5% 0%, 54% 0.5%, 54.5% 0%, 55% 0.5%, 55.5% 0%, 56% 0.5%, 56.5% 0%, 57% 0.5%, 57.5% 0%, 58% 0.5%, 58.5% 0%, 59% 0.5%, 59.5% 0%, 60% 0.5%, 60.5% 0%, 61% 0.5%, 61.5% 0%, 62% 0.5%, 62.5% 0%, 63% 0.5%, 63.5% 0%, 64% 0.5%, 64.5% 0%, 65% 0.5%, 65.5% 0%, 66% 0.5%, 66.5% 0%, 67% 0.5%, 67.5% 0%, 68% 0.5%, 68.5% 0%, 69% 0.5%, 69.5% 0%, 70% 0.5%, 70.5% 0%, 71% 0.5%, 71.5% 0%, 72% 0.5%, 72.5% 0%, 73% 0.5%, 73.5% 0%, 74% 0.5%, 74.5% 0%, 75% 0.5%, 75.5% 0%, 76% 0.5%, 76.5% 0%, 77% 0.5%, 77.5% 0%, 78% 0.5%, 78.5% 0%, 79% 0.5%, 79.5% 0%, 80% 0.5%, 80.5% 0%, 81% 0.5%, 81.5% 0%, 82% 0.5%, 82.5% 0%, 83% 0.5%, 83.5% 0%, 84% 0.5%, 84.5% 0%, 85% 0.5%, 85.5% 0%, 86% 0.5%, 86.5% 0%, 87% 0.5%, 87.5% 0%, 88% 0.5%, 88.5% 0%, 89% 0.5%, 89.5% 0%, 90% 0.5%, 90.5% 0%, 91% 0.5%, 91.5% 0%, 92% 0.5%, 92.5% 0%, 93% 0.5%, 93.5% 0%, 94% 0.5%, 94.5% 0%, 95% 0.5%, 95.5% 0%, 96% 0.5%, 96.5% 0%, 97% 0.5%, 97.5% 0%, 98% 0.5%, 98.5% 0%, 99% 0.5%, 99.5% 0%, 100% 0.5%, 100% 99.5%, 99.5% 100%, 99% 99.5%, 98.5% 100%, 98% 99.5%, 97.5% 100%, 97% 99.5%, 96.5% 100%, 96% 99.5%, 95.5% 100%, 95% 99.5%, 94.5% 100%, 94% 99.5%, 93.5% 100%, 93% 99.5%, 92.5% 100%, 92% 99.5%, 91.5% 100%, 91% 99.5%, 90.5% 100%, 90% 99.5%, 89.5% 100%, 89% 99.5%, 88.5% 100%, 88% 99.5%, 87.5% 100%, 87% 99.5%, 86.5% 100%, 86% 99.5%, 85.5% 100%, 85% 99.5%, 84.5% 100%, 84% 99.5%, 83.5% 100%, 83% 99.5%, 82.5% 100%, 82% 99.5%, 81.5% 100%, 81% 99.5%, 80.5% 100%, 80% 99.5%, 79.5% 100%, 79% 99.5%, 78.5% 100%, 78% 99.5%, 77.5% 100%, 77% 99.5%, 76.5% 100%, 76% 99.5%, 75.5% 100%, 75% 99.5%, 74.5% 100%, 74% 99.5%, 73.5% 100%, 73% 99.5%, 72.5% 100%, 72% 99.5%, 71.5% 100%, 71% 99.5%, 70.5% 100%, 70% 99.5%, 69.5% 100%, 69% 99.5%, 68.5% 100%, 68% 99.5%, 67.5% 100%, 67% 99.5%, 66.5% 100%, 66% 99.5%, 65.5% 100%, 65% 99.5%, 64.5% 100%, 64% 99.5%, 63.5% 100%, 63% 99.5%, 62.5% 100%, 62% 99.5%, 61.5% 100%, 61% 99.5%, 60.5% 100%, 60% 99.5%, 59.5% 100%, 59% 99.5%, 58.5% 100%, 58% 99.5%, 57.5% 100%, 57% 99.5%, 56.5% 100%, 56% 99.5%, 55.5% 100%, 55% 99.5%, 54.5% 100%, 54% 99.5%, 53.5% 100%, 53% 99.5%, 52.5% 100%, 52% 99.5%, 51.5% 100%, 51% 99.5%, 50.5% 100%, 50% 99.5%, 49.5% 100%, 49% 99.5%, 48.5% 100%, 48% 99.5%, 47.5% 100%, 47% 99.5%, 46.5% 100%, 46% 99.5%, 45.5% 100%, 45% 99.5%, 44.5% 100%, 44% 99.5%, 43.5% 100%, 43% 99.5%, 42.5% 100%, 42% 99.5%, 41.5% 100%, 41% 99.5%, 40.5% 100%, 40% 99.5%, 39.5% 100%, 39% 99.5%, 38.5% 100%, 38% 99.5%, 37.5% 100%, 37% 99.5%, 36.5% 100%, 36% 99.5%, 35.5% 100%, 35% 99.5%, 34.5% 100%, 34% 99.5%, 33.5% 100%, 33% 99.5%, 32.5% 100%, 32% 99.5%, 31.5% 100%, 31% 99.5%, 30.5% 100%, 30% 99.5%, 29.5% 100%, 29% 99.5%, 28.5% 100%, 28% 99.5%, 27.5% 100%, 27% 99.5%, 26.5% 100%, 26% 99.5%, 25.5% 100%, 25% 99.5%, 24.5% 100%, 24% 99.5%, 23.5% 100%, 23% 99.5%, 22.5% 100%, 22% 99.5%, 21.5% 100%, 21% 99.5%, 20.5% 100%, 20% 99.5%, 19.5% 100%, 19% 99.5%, 18.5% 100%, 18% 99.5%, 17.5% 100%, 17% 99.5%, 16.5% 100%, 16% 99.5%, 15.5% 100%, 15% 99.5%, 14.5% 100%, 14% 99.5%, 13.5% 100%, 13% 99.5%, 12.5% 100%, 12% 99.5%, 11.5% 100%, 11% 99.5%, 10.5% 100%, 10% 99.5%, 9.5% 100%, 9% 99.5%, 8.5% 100%, 8% 99.5%, 7.5% 100%, 7% 99.5%, 6.5% 100%, 6% 99.5%, 5% 100%, 4% 99.5%, 3% 100%, 2% 99.5%, 1% 100%, 0% 99%)',
        }}
      >
        <div className="relative">
          <div className="font-mono space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t(data.storeName) || t(data.template.defaultStoreName)}</h2>
              <p className="text-sm text-gray-600">
                {data.date} {data.time}
              </p>
              {data.template.showTransactionId && (
                <p className="text-sm text-gray-600">{t('receipt')} #{data.receiptNumber}</p>
              )}
              
              {/* Template-specific fields */}
              {data.template.fields.roomNumber && data.roomNumber && (
                <p className="text-sm text-gray-600">{t('roomNumber')} #{data.roomNumber}</p>
              )}
              {data.template.fields.patientId && data.patientId && (
                <p className="text-sm text-gray-600">{t('patientId')}: {data.patientId}</p>
              )}
              {data.template.fields.serviceDate && data.serviceDate && (
                <p className="text-sm text-gray-600">{t('serviceDate')}: {data.serviceDate}</p>
              )}
              {data.template.fields.invoiceNumber && data.invoiceNumber && (
                <p className="text-sm text-gray-600">{t('invoiceNumber')}: {data.invoiceNumber}</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-b border-dashed border-gray-300 my-4" />

            {/* Items */}
            <AnimatePresence>
              {data.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={isPrinting ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Totals */}
            <div className="border-t border-dashed border-gray-300 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('subtotal')}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {data.template.showTax && (
                <div className="flex justify-between text-sm">
                  <span>{t('tax')} ({(TAX_RATE * 100).toFixed(2)}%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed border-gray-300">
                <span>{t('total')}</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>

              {/* Payment Info */}
              <div className="pt-4 text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 self-center" />
                  <span>{t(data.paymentInfo.method)}</span>
                  {(data.paymentInfo.method === 'Credit Card' || data.paymentInfo.method === 'Debit Card') && data.paymentInfo.cardLastFour && (
                    <span className="text-gray-500">(**** {data.paymentInfo.cardLastFour})</span>
                  )}
                </div>
                {data.template.showTransactionId && (
                  <p className="text-xs text-gray-500">
                    {t('transactionId')}: {data.paymentInfo.transactionId}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-4 mt-8">
              {data.template.showTransactionId && (
                <div className="flex justify-center">
                  <Barcode
                    value={data.receiptNumber}
                    width={1.5}
                    height={50}
                    fontSize={12}
                    margin={0}
                    background="transparent"
                  />
                </div>
              )}
              <p className="text-sm text-gray-600">{t(data.footerText) || t('thankYou')}</p>
              <p className="text-xs text-gray-400 mt-2">{t('generatedBy')}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReceiptPreview;