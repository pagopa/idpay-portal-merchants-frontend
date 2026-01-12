import { TYPE_TEXT } from "../../utils/constants";


const getDetailFieldList: any = () => [
    { label: "Data e ora", id: "trxChargeDate", type: TYPE_TEXT.Text }, // modificare
    { label: "Elettrodomestico", id: "additionalProperties.productName", type: TYPE_TEXT.Text },
    { label: "Codice Fiscale", id: "fiscalCode", type: TYPE_TEXT.Text },
    { label: "Totale della spesa", id: "effectiveAmountCents", type: TYPE_TEXT.Currency },
    { label: "Sconto applicato", id: "rewardAmountCents", type: TYPE_TEXT.Currency },
    { label: "Importo autorizzato", id: "authorizedAmountCents", type: TYPE_TEXT.Currency },
    { label: "ID transazione", id: "id", type: TYPE_TEXT.Text },
    { label: "Codice sconto", id: "trxCode", type: TYPE_TEXT.Text },

];


export default getDetailFieldList;