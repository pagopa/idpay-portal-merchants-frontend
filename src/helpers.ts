/* eslint-disable functional/immutable-data */
export const copyTextToClipboard = (magicLink: string | undefined) => {
  if (typeof magicLink === 'string') {
    void navigator.clipboard.writeText(magicLink);
  }
};

export const downloadQRCode = (selector: string, trxCode: string | undefined) => {
  const content = document.getElementById(selector);
  if (content !== null) {
    content.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = content.outerHTML;
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    const fileName = `${trxCode}_qr_code.svg`;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
};

export const formattedCurrency = (number: number | undefined, symbol: string = '-') => {
  if (number) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number);
  }
  return symbol;
};

export const formatIban = (iban: string | undefined) => {
  if (iban) {
    return `${iban.slice(0, 2)} ${iban.slice(2, 4)} ${iban.slice(4, 5)} ${iban.slice(
      5,
      10
    )} ${iban.slice(10, 15)} ${iban.slice(15, 32)}`;
  }
  return '';
};
