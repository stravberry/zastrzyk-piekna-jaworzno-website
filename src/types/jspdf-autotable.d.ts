
declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    theme?: string;
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    columnStyles?: any;
    styles?: any;
    margin?: any;
    didDrawPage?: Function;
    willDrawCell?: Function;
    didDrawCell?: Function;
    didParseCell?: Function;
    [key: string]: any;
  }
  
  function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  
  export default autoTable;
}
