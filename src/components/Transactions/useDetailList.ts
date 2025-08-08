import { TYPE_TEXT } from "../../utils/constants";


const getDetailFieldList: any = () => [
    { label: "Data e ora", id: "trxDate", type: TYPE_TEXT.Text },
    { label: "Categoria", id: "none", type: TYPE_TEXT.Text },
    { label: "Modello", id: "none", type: TYPE_TEXT.Text },
    { label: "Codice Fiscale", id: "fiscalCode", type: TYPE_TEXT.Text },
    { label: "Totale della spesa", id: "trxExpirationSeconds", type: TYPE_TEXT.Currency },
    { label: "Importo autorizzato", id: "rewardAmountCents", type: TYPE_TEXT.Currency },
];


export default getDetailFieldList; 