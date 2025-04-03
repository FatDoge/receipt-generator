import { Store, Coffee, Building2, Stethoscope, Briefcase } from 'lucide-react';
import { ReceiptTemplate } from '../utils/receipt';

export const templates: ReceiptTemplate[] = [
  {
    id: 'retail',
    name: 'Retail',
    icon: <Store className="w-5 h-5" />,
    defaultStoreName: 'Fashion Boutique',
    thermalTexture: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?auto=format&fit=crop&q=80&w=500',
    showTip: false,
    showTax: true,
    itemLabel: 'Item',
    priceLabel: 'Price',
    quantityLabel: 'Qty',
    fields: {
      description: true,
    },
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: <Coffee className="w-5 h-5" />,
    defaultStoreName: 'Café & Restaurant',
    thermalTexture: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?auto=format&fit=crop&q=80&w=500',
    showTip: true,
    showTax: true,
    itemLabel: 'Item',
    priceLabel: 'Price',
    quantityLabel: 'Qty',
    fields: {
      description: true,
    },
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: <Building2 className="w-5 h-5" />,
    defaultStoreName: 'Grand Hotel',
    thermalTexture: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?auto=format&fit=crop&q=80&w=500',
    showTip: true,
    showTax: true,
    itemLabel: 'Service',
    priceLabel: 'Rate',
    quantityLabel: 'Nights',
    fields: {
      description: true,
      roomNumber: true,
    },
  },
  {
    id: 'medical',
    name: 'Medical',
    icon: <Stethoscope className="w-5 h-5" />,
    defaultStoreName: 'Medical Center',
    thermalTexture: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?auto=format&fit=crop&q=80&w=500',
    showTip: false,
    showTax: false,
    itemLabel: 'Service',
    priceLabel: 'Fee',
    quantityLabel: 'Units',
    fields: {
      description: true,
      patientId: true,
      serviceDate: true,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: <Briefcase className="w-5 h-5" />,
    defaultStoreName: 'Professional Services',
    thermalTexture: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?auto=format&fit=crop&q=80&w=500',
    showTip: false,
    showTax: true,
    itemLabel: 'Service',
    priceLabel: 'Rate',
    quantityLabel: 'Hours',
    fields: {
      description: true,
      invoiceNumber: true,
    },
  },
];