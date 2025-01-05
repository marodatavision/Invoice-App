import jsPDF from 'jspdf';
import config from '../assets/config.json';
import { PDFDocument } from 'pdf-lib';


const addFooter = (doc, config, secondaryColor) => {
  const footerY = 280; // Standardposition für die Fußzeile
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor);
  doc.text(
    `Bankverbindung: ${config.bankDetails.accountHolder}, IBAN: ${config.bankDetails.iban}, BIC: ${config.bankDetails.bic}, ${config.bankDetails.bankName}`,
    10,
    footerY
  );
  doc.text(
    `Steuerinformationen: USt-IdNr: ${config.taxDetails.vatId}, Steuer-Nr: ${config.taxDetails.taxNumber}`,
    10,
    footerY + 5
  );
};

export const previewInvoicePDF = (formData, logo, zugferd) => {
  const { sender, receiver, items, invoiceDate, invoiceNumber } = formData;

  // Farben gemäß modernen Designrichtlinien
  const primaryColor = '#007bff'; // Blau
  const secondaryColor = '#6c757d'; // Grau
  const borderColor = '#d1d1d1';

  const doc = new jsPDF();
  let yPosition = 10;

  // Kopfzeile
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 16, 'F'); // Blaue Kopfzeile
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255); // Weißer Text
  doc.text('Rechnung', 10, 13);

  // Firmenlogo verzerrungsfrei einfügen
  if (logo) {
    const img = new Image();
    img.src = logo;

    const imgWidth = 50;
    const imgHeight = 30;

    let displayWidth = imgWidth;
    let displayHeight = imgHeight;

    const aspectRatio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;

    if (aspectRatio > 1) {
      displayHeight = imgWidth / aspectRatio;
    } else {
      displayWidth = imgHeight * aspectRatio;
    }

    // Debug-Ausgabe für die Konsole
    console.log(`displayWidth before: ${imgWidth}`);
    console.log(`displayHeight before: ${imgHeight}`);
    console.log(`displayWidth: ${displayWidth}`);
    console.log(`displayHeight: ${displayHeight}`);

    if (!isNaN(displayWidth) && !isNaN(displayHeight)) {
      doc.addImage(img, 'PNG', 10, 18, displayWidth, displayHeight);
    } else {
      console.error('Logo-Berechnung fehlgeschlagen: Ungültige Breite oder Höhe.');
    }
  }
  yPosition += 20;

  // Rechnungsinformationen
  const startRightBlock = 130;
  doc.setTextColor(0, 0, 0); // Schwarzer Text
  doc.setFontSize(10);
  doc.text(`Rechnungsdatum: ${invoiceDate}`, startRightBlock, 80);
  doc.text(`Rechnungsdatum = Lieferdatum`, startRightBlock, 86);
  doc.text(`Rechnungsnummer: ${invoiceNumber}`, startRightBlock, 92);
  yPosition += 10;

  // Absenderadresse (Einzeiler für Briefumschlag)
  yPosition += 14; // Zusätzlicher Abstand für 4-5 Leerzeilen
  doc.setFontSize(8);
  doc.text(
    `${sender.name}, ${sender.street}, ${sender.postalCode} ${sender.city}, ${sender.country}`,
    10,
    yPosition
  );
  yPosition += 6;

  // Faltmarkierungen
  doc.setDrawColor(secondaryColor);
  doc.line(10, 55, 100, 55); // Zeile unterhalb des Einzeilers für Absender
  doc.line(10, 105, 15, 105); // Erste Faltmarkierung
  doc.line(10, 210, 15, 210); // Zweite Faltmarkierung

  // Empfängerinformationen
  doc.setFontSize(10);
  doc.text('Empfänger:', 10, yPosition);
  yPosition += 6;
  doc.text(`${receiver.name}`, 10, yPosition);
  doc.text(`${receiver.street}`, 10, yPosition + 6);
  doc.text(`${receiver.postalCode} ${receiver.city}`, 10, yPosition + 12);
  doc.text(`${receiver.country}`, 10, yPosition + 18);
  yPosition += 30;

  // Absenderinformationen rechtsbündig
  doc.text('Absender:', startRightBlock, 32);
  doc.text(`${sender.name}`, startRightBlock, 38, { align: 'left' });
  doc.text(`${sender.street}`, startRightBlock, 44, { align: 'left' });
  doc.text(`${sender.postalCode} ${sender.city}`, startRightBlock, 50, { align: 'left' });
  doc.text(`${sender.country}`, startRightBlock, 56, { align: 'left' });
  if (sender.phone) {
    doc.text(`Tel: ${sender.phone}`, startRightBlock, 62, { align: 'left' });
  }
  
  if (sender.homepage) {
    doc.text(`Web: ${sender.homepage}`, startRightBlock, 68, { align: 'left' });
  }

  // Setze yPosition nach der ersten Faltmarkierung
  yPosition = 110; // Erste Faltmarkierung ist bei 105, Tabelle startet etwas darunter

  // Rechnungsdetails (Tabellenüberschrift)
  doc.setFillColor(secondaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(10, yPosition, 190, 8, 'F'); // Graue Zeile
  doc.text('Beschreibung', 12, yPosition + 6);
  doc.text('Menge', 100, yPosition + 6);
  doc.text('Preis', 140, yPosition + 6);
  doc.text('Gesamt', 170, yPosition + 6);
  yPosition += 10;

  // Rechnungspositionen
  doc.setTextColor(0, 0, 0);
  let totalNet = 0;
  items.forEach((item) => {
    const description = item.description || '';
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const lineTotal = quantity * price;

    totalNet += lineTotal;

    // Prüfe, ob die aktuelle yPosition die Fußzeile überlagern würde
    if (yPosition > 250) {
      // Füge die Fußzeile hinzu
      addFooter(doc, config, secondaryColor);

      // Erstelle eine neue Seite und setze die yPosition zurück
      doc.addPage();
      yPosition = 20;

      // Füge die Tabellenüberschrift auf der neuen Seite hinzu
      doc.setFillColor(secondaryColor);
      doc.setTextColor(255, 255, 255);
      doc.rect(10, yPosition, 190, 8, 'F'); // Graue Zeile
      doc.text('Beschreibung', 12, yPosition + 6);
      doc.text('Menge', 100, yPosition + 6);
      doc.text('Preis', 140, yPosition + 6);
      doc.text('Gesamt', 170, yPosition + 6);
      yPosition += 10;
    }

    // Zeichne die aktuelle Position
    doc.setDrawColor(borderColor);
    doc.line(10, yPosition, 200, yPosition); // Horizontale Trennlinie

    doc.text(description, 12, yPosition + 6);
    doc.text(quantity.toString(), 100, yPosition + 6, { align: 'right' });
    doc.text(price.toFixed(2) + ' €', 140, yPosition + 6, { align: 'right' });
    doc.text(lineTotal.toFixed(2) + ' €', 170, yPosition + 6, { align: 'right' });
    yPosition += 10;
  });

  // Mehrwertsteuer-Berechnung (Herausrechnen aus dem Bruttobetrag)
  const vatRate = parseFloat(config.vatRate) || 0; // Mehrwertsteuersatz aus der config.json
  const totalGross = totalNet; // Da die Preise bereits Brutto sind
  const totalNetCalculated = totalGross / (1 + vatRate / 100); // Netto-Betrag aus Brutto berechnen
  const vatAmount = totalGross - totalNetCalculated; // Differenz ergibt die MwSt.

  // Gesamtsummenblock mit Prüfung der Skonto-Zeile
  if (yPosition > 250) {
    // Füge die Fußzeile hinzu
    addFooter(doc, config, secondaryColor);

    // Erstelle eine neue Seite
    doc.addPage();
    yPosition = 20;

    // Füge die Tabellenüberschrift auf der neuen Seite hinzu
    doc.setFillColor(secondaryColor);
    doc.setTextColor(255, 255, 255);
    doc.rect(10, yPosition, 190, 8, 'F'); // Graue Zeile
    doc.text('Beschreibung', 12, yPosition + 6);
    doc.text('Menge', 100, yPosition + 6);
    doc.text('Preis', 140, yPosition + 6);
    doc.text('Gesamt', 170, yPosition + 6);
    yPosition += 10;
  }

  // Skonto-Zeile
  yPosition += 10;
  if (config.discountDetails) {

    // Prüfe, ob die Skonto-Zeile die Fußzeile überlagert
    if (yPosition > 250) {
      addFooter(doc, config, secondaryColor); // Füge die Fußzeile hinzu
      doc.addPage(); // Erstelle eine neue Seite
      yPosition = 20; // Setze yPosition zurück
    }
  }

  // Gesamtsummenbereich
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nettobetrag:`, 140, yPosition, { align: 'right' });
  doc.text(`${totalNetCalculated.toFixed(2)} €`, 200, yPosition, { align: 'right' });

  yPosition += 6;
  doc.text(`MwSt. (${vatRate.toFixed(2)} %):`, 140, yPosition, { align: 'right' });
  doc.text(`${vatAmount.toFixed(2)} €`, 200, yPosition, { align: 'right' });

  yPosition += 6;
  doc.setFontSize(12);
  doc.text(`Gesamtbetrag (Brutto):`, 140, yPosition, { align: 'right' });
  doc.text(`${totalGross.toFixed(2)} €`, 200, yPosition, { align: 'right' });

  // Zahlungsbedingungen
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Zahlungsbedingungen: ${config.paymentTerms}`, 10, yPosition);

  // Skonto-Details
  yPosition += 10;
  if (config.discountDetails) {
    doc.setTextColor(secondaryColor);
    doc.text(`Skonto: ${config.discountDetails}`, 10, yPosition);
  }

  // Fußzeile mit Bank- und Steuerinformationen
  const footerY = 280;
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor);
  doc.text(`Bankverbindung: ${config.bankDetails.accountHolder}, IBAN: ${config.bankDetails.iban}, BIC: ${config.bankDetails.bic}, ${config.bankDetails.bankName}`, 10, footerY);
  if (config.taxDetails.vatId)
  {
    doc.text(`Steuerinformationen: USt-IdNr: ${config.taxDetails.vatId}, Steuer-Nr: ${config.taxDetails.taxNumber}`, 10, footerY + 5);
  }
  else {
    doc.text(`Steuerinformationen: Steuer-Nr: ${config.taxDetails.taxNumber}`, 10, footerY + 5);
  }

  if (zugferd) {
    return {doc, totalNetCalculated, vatAmount, totalGross}
  }
  else {
    window.open(doc.output('bloburl'), '_blank');
  }
};

export const addXMLToPDF = async (jsPDFData, xmlContent, invoiceNumber) => {
  // Lade das jsPDF generierte PDF in pdf-lib
  const pdfDoc = await PDFDocument.load(jsPDFData);

  // Konvertiere XML-Daten in ein ArrayBuffer-ähnliches Format
  const xmlBuffer = new TextEncoder().encode(xmlContent);

  // Füge XML als Anhang hinzu
  pdfDoc.attach(xmlBuffer, 'zugferd-invoice.xml', 'ZUGFeRD XML Invoice');

  // Speichere das aktualisierte PDF
  const pdfBytes = await pdfDoc.save();

  // Lade das PDF im Browser herunter
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Rechnung_${invoiceNumber}.pdf`;
  link.click();
};
  
export const generateZUGFeRDInvoice = (formData, logo) => {
  const { sender, receiver, items, invoiceDate, invoiceNumber } = formData;
  const {doc, totalNetCalculated, vatAmount, totalGross} = previewInvoicePDF(formData, logo, true);
  
  // Generiere XML für ZUGFeRD
  const xmlContent = `
<rsm:CrossIndustryDocument xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:12" xmlns:rsm="urn:ferd:CrossIndustryDocument:invoice:1p0" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:15">
  <rsm:SpecifiedExchangedDocumentContext>
    <ram:TestIndicator>
      <udt:Indicator>false</udt:Indicator>
    </ram:TestIndicator>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:ferd:CrossIndustryDocument:invoice:1p0:basic</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:SpecifiedExchangedDocumentContext>
  <rsm:HeaderExchangedDocument>
    <ram:ID>${invoiceNumber}</ram:ID>
    <ram:Name>Rechnung</ram:Name>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${invoiceDate.replace(/-/g, '')}</udt:DateTimeString>
    </ram:IssueDateTime>
    <ram:LanguageID>de</ram:LanguageID>
  </rsm:HeaderExchangedDocument>
  <rsm:SpecifiedSupplyChainTradeTransaction>
    <ram:ApplicableSupplyChainTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${sender.name}</ram:Name>
        <ram:DefinedTradeContact>
          <ram:PersonName>${config.companyInfo.contact || ''}</ram:PersonName>
        </ram:DefinedTradeContact>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${sender.postalCode}</ram:PostcodeCode>
          <ram:LineOne>${sender.street}</ram:LineOne>
          <ram:CityName>${sender.city}</ram:CityName>
          <ram:CountryID>${sender.country}</ram:CountryID>
        </ram:PostalTradeAddress>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${receiver.name}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${receiver.postalCode}</ram:PostcodeCode>
          <ram:LineOne>${receiver.street}</ram:LineOne>
          <ram:CityName>${receiver.city}</ram:CityName>
          <ram:CountryID>${receiver.country}</ram:CountryID>
        </ram:PostalTradeAddress>
      </ram:BuyerTradeParty>
    </ram:ApplicableSupplyChainTradeAgreement>
    <ram:ApplicableSupplyChainTradeSettlement>
      <ram:PaymentReference>${invoiceNumber}</ram:PaymentReference>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:Information>${config.paymentTerms}</ram:Information>
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${config.bankDetails.iban}</ram:IBANID>
        </ram:PayeePartyCreditorFinancialAccount>
        <ram:PayeeSpecifiedCreditorFinancialInstitution>
          <ram:BICID>${config.bankDetails.bic}</ram:BICID>
          <ram:Name>${config.bankDetails.bankName}</ram:Name>
        </ram:PayeeSpecifiedCreditorFinancialInstitution>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:SpecifiedTradeSettlementMonetarySummation>
        <ram:LineTotalAmount currencyID="EUR">${totalNetCalculated.toFixed(2)}</ram:LineTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${vatAmount.toFixed(2)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount currencyID="EUR">${totalGross.toFixed(2)}</ram:GrandTotalAmount>
      </ram:SpecifiedTradeSettlementMonetarySummation>
    </ram:ApplicableSupplyChainTradeSettlement>
    ${items
      .map(
        (item, index) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${index + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedSupplyChainTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount currencyID="EUR">${(item.price / (1 + config.vatRate / 100)).toFixed(
            2
          )}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedSupplyChainTradeAgreement>
      <ram:SpecifiedSupplyChainTradeDelivery>
        <ram:BilledQuantity unitCode="C62">${item.quantity}</ram:BilledQuantity>
      </ram:SpecifiedSupplyChainTradeDelivery>
      <ram:SpecifiedSupplyChainTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:ApplicablePercent>${config.vatRate}</ram:ApplicablePercent>
        </ram:ApplicableTradeTax>
      </ram:SpecifiedSupplyChainTradeSettlement>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${item.description}</ram:Name>
      </ram:SpecifiedTradeProduct>
    </ram:IncludedSupplyChainTradeLineItem>`
      )
      .join('')}
  </rsm:SpecifiedSupplyChainTradeTransaction>
</rsm:CrossIndustryDocument>`;

  const docFromJspdf = doc.output('arraybuffer');

  addXMLToPDF(docFromJspdf, xmlContent, invoiceNumber);
};
