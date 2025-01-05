import React, { useState, useEffect } from 'react';
import { previewInvoicePDF, generateZUGFeRDInvoice } from '../utils/exportInvoice';
import defaultLogo from '../assets/default_logo.png';
import config from '../assets/config.json'; // Import der Skonto-Details

const InvoiceForm = () => {
  const [logo, setLogo] = useState(defaultLogo);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceDate: '',
    invoiceNumber: '',
  });
  const [formData, setFormData] = useState({
    sender: {
      name: '',
      street: '',
      postalCode: '',
      city: '',
      country: '',
    },
    receiver: {
      name: '',
      street: '',
      postalCode: '',
      city: '',
      country: '',
    },
    items: [{ description: '', quantity: 1, price: 0 }],
  });

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      sender: {
        name: config.companyInfo.name,
        street: config.companyInfo.street,
        postalCode: config.companyInfo.postalCode,
        city: config.companyInfo.city,
        country: config.companyInfo.country,
        phone: config.companyInfo.phone || '', // Optional: Telefonnummer
        homepage: config.companyInfo.homepage || '' // Optional: Homepage
      },
    }));
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (type, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [type]: { ...prevData[type], [field]: value },
    }));
  };

  const handleInvoiceDetailsChange = (field, value) => {
    setInvoiceDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      items: [...prevData.items, { description: '', quantity: 1, price: 0 }],
    }));
  };

  const removeLastItem = () => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.slice(0, -1);
      setFormData({ ...formData, items: updatedItems });
    } else {
      alert('Es muss mindestens eine Position vorhanden sein.');
    }
  };

  const handlePreview = () => {
    const isValid = formData.items.every((item) => {
      const price = parseFloat(item.price);
      const quantity = parseFloat(item.quantity);
      return !isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0;
    });

    if (!isValid) {
      alert('Bitte geben Sie gültige Werte für Menge und Preis ein.');
      return;
    }

    previewInvoicePDF({ ...formData, ...invoiceDetails}, logo, false);
  };

  return (
    <div className="container mt-4">
      <h1>Rechnung erstellen</h1>
      <form>
        <div className="mb-3">
          <label className="form-label">Firmenlogo</label>
          <input type="file" className="form-control" onChange={handleLogoUpload} />
          {logo && (
            <img
              src={logo}
              alt="Firmenlogo"
              className="mt-3"
              style={{ maxHeight: '100px', maxWidth: '100px', objectFit: 'contain' }}
            />
          )}
        </div>

        {/* Rechnungsdetails */}
        <h3>Rechnungsdetails</h3>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Rechnungsdatum</label>
            <input
              type="date"
              className="form-control"
              value={invoiceDetails.invoiceDate}
              onChange={(e) => handleInvoiceDetailsChange('invoiceDate', e.target.value)}
            />
          </div>
          <div className="col">
            <label className="form-label">Rechnungsnummer</label>
            <input
              type="text"
              className="form-control"
              placeholder="Rechnungsnummer"
              value={invoiceDetails.invoiceNumber}
              onChange={(e) => handleInvoiceDetailsChange('invoiceNumber', e.target.value)}
            />
          </div>
        </div>

        {/* Absenderdaten */}
<h3>Absender</h3>
<div className="row">
  <div className="col-12 col-md mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="Name"
      value={formData.sender.name}
      onChange={(e) => handleAddressChange('sender', 'name', e.target.value)}
    />
  </div>
  <div className="col-12 col-md mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="Straße"
      value={formData.sender.street}
      onChange={(e) => handleAddressChange('sender', 'street', e.target.value)}
    />
  </div>
  <div className="col-12 col-md mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="PLZ"
      value={formData.sender.postalCode}
      onChange={(e) => handleAddressChange('sender', 'postalCode', e.target.value)}
    />
  </div>
  <div className="col-12 col-md mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="Ort"
      value={formData.sender.city}
      onChange={(e) => handleAddressChange('sender', 'city', e.target.value)}
    />
  </div>
  <div className="col-12 col-md">
    <input
      type="text"
      className="form-control"
      placeholder="Land"
      value={formData.sender.country}
      onChange={(e) => handleAddressChange('sender', 'country', e.target.value)}
    />
  </div>
</div>

{/* Empfängerdaten */}
<h3 className="mt-4">Empfänger</h3>
<div className="row">
  <div className="col-12 col-md mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="Name"
      value={formData.receiver.name}
      onChange={(e) => handleAddressChange('receiver', 'name', e.target.value)}
    />
  </div>
  <div className="col-12 col-md mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="Straße"
      value={formData.receiver.street}
      onChange={(e) => handleAddressChange('receiver', 'street', e.target.value)}
    />
  </div>
  <div className="col-12 col-md mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="PLZ"
      value={formData.receiver.postalCode}
      onChange={(e) => handleAddressChange('receiver', 'postalCode', e.target.value)}
    />
  </div>
  <div className="col-12 col-md mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="Ort"
      value={formData.receiver.city}
      onChange={(e) => handleAddressChange('receiver', 'city', e.target.value)}
    />
  </div>
  <div className="col-12 col-md">
    <input
      type="text"
      className="form-control"
      placeholder="Land"
      value={formData.receiver.country}
      onChange={(e) => handleAddressChange('receiver', 'country', e.target.value)}
    />
  </div>
</div>

        {/* Rechnungspositionen */}
        <h3 className="mt-4">Rechnungspositionen</h3>
        <div className="row mb-3">
          <div className="col-8">
            Positionsbeschreibung
          </div>
          <div className="col-2">
            Menge
          </div>
          <div className="col-2">
            Preis in €
          </div>
        </div>
        {formData.items.map((item, index) => (
          <div className="row mb-3" key={index}>
            <div className="col-8">
              <input
                type="text"
                className="form-control"
                placeholder="Beschreibung"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
            </div>
            <div className="col-2">
              <input
                type="number"
                className="form-control"
                placeholder="Menge"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
            </div>
            <div className="col-2">
              <input
                type="number"
                className="form-control"
                placeholder="Preis"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              />
            </div>
          </div>
        ))}
        <div className="mt-3">
          <button type="button" className="btn btn-secondary me-2" onClick={addItem}>
            Position hinzufügen
          </button>
          <button type="button" className="btn btn-danger" onClick={removeLastItem}>
            Letzte Position entfernen
          </button>
        </div>
      </form>

      <div className="mt-4">
        <button className="btn btn-primary me-2" onClick={handlePreview}>
          Vorschau
        </button>
        <button className="btn btn-secondary" onClick={() => generateZUGFeRDInvoice({ ...formData, ...invoiceDetails }, logo)}>
          Rechnung erstellen
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
