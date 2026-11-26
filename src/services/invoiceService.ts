import { getMerchantsApi } from '../api/MerchantsApiClient';

const INVOICE_MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  xml: 'application/xml',
};

export const openInvoiceFile = async (initiativeId: string, transaction: any): Promise<void> => {
  const response = await getMerchantsApi().downloadInvoiceFile(
    initiativeId,
    transaction?.pointOfSaleId,
    transaction?.trxId
  );

  const res = await fetch(response.invoiceUrl, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Errore nel recupero del file');
  }

  const filename: string = transaction?.invoiceData?.filename ?? '';
  const ext = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
  const mimeType = INVOICE_MIME_TYPES[ext];
  if (!mimeType) {
    throw new Error('Errore nel recupero del file');
  }

  const blob = await res.blob();
  const file = new Blob([blob], { type: mimeType });

  const url = URL.createObjectURL(file);

  const pdfWindow = window.open(url, '_blank');
  if (pdfWindow) {
    setTimeout(() => {
      // eslint-disable-next-line functional/immutable-data
      pdfWindow.document.title = filename;
    }, 100);
  }
};
