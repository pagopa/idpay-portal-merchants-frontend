/* eslint-disable functional/no-let */
/* eslint-disable functional/immutable-data */
import { matchPath } from 'react-router-dom';
import { MISSING_DATA_PLACEHOLDER, MISSING_EURO_PLACEHOLDER } from './utils/constants';


export const copyTextToClipboard = (magicLink: string | undefined) => {
  if (typeof magicLink === 'string') {
    void navigator.clipboard.writeText(magicLink);
  }
};
/*
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
*/
export const downloadQRCodeFromURL = (url: string | undefined) => {
  if (typeof url === 'string') {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = link;
        const fileName = 'qrcode.png';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((error) => console.log(error));
  }
};

export const mapDataForDiscoutTimeRecap = (
  trxExpirationSeconds: number | undefined,
  trxDate: Date | undefined
) => {
  let expirationDays;
  let expirationDate;
  let expirationTime;
  if (typeof trxExpirationSeconds === 'number' && typeof trxDate === 'object') {
    const initialTimestamp = trxDate.getTime();
    trxDate.setSeconds(trxDate.getSeconds() + trxExpirationSeconds);
    const finalTimestamp = trxDate.getTime();
    expirationDays = Math.trunc((finalTimestamp - initialTimestamp) / (1000 * 60 * 60 * 24));
    const expDateStrArr = trxDate
      .toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Europe/Rome',
        hour: 'numeric',
        minute: 'numeric',
      })
      .split(', ');
    expirationDate = expDateStrArr[0];
    expirationTime = expDateStrArr[1];
  }
  return { expirationDays, expirationDate, expirationTime };
};

export const formattedCurrency = (
  number: number | undefined,
  symbol: string = MISSING_EURO_PLACEHOLDER,
  cents: boolean = false
) => {
  if (number && cents === false) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number);
  } else if (number && cents === true) {
    const roundedNumberStr = number.toFixed(2);
    const roundedNumber = parseFloat(roundedNumberStr) / 100;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
      roundedNumber
    );
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
  return MISSING_DATA_PLACEHOLDER;
};

export const formatDate = (date: Date | undefined) => {
  if (date) {
    return date.toLocaleString('fr-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Rome',
    });
  }
  return '';
};

export const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidUrl = (urlToCheck: string) => {
  const allowedDomain = ['it', 'com', 'info', 'io', 'net', 'eu', 'google'];
  try {
    const url = new URL(urlToCheck);
    const domain = url.hostname.split('.').pop();
    if (domain && !allowedDomain.includes(domain.toLowerCase())) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
};

export const generateUniqueId = () =>
  Date.now().toString() + Math.random().toString(36).substring(2, 9);

export const handlePromptMessage = (location: { pathname: string }, targetPage: string) => {


  const match = matchPath(location.pathname, {
    path: targetPage, 
    exact: true 
});

if (!match) { 
    sessionStorage.removeItem('storesPagination');
}

return true;
};

export function formatEuro(value: number) {
    return (value / 100).toLocaleString('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
}

export const truncateString = (str?: string, maxLength: number = 40): string => {
  if (!str) {
    return "-";
  } else {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }
};