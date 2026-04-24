import { useMemo, useState } from 'react';
import styles from './InvoiceGenerator.module.css';
import logo from '../assets/logo.png';

function money(value) {
  return Number(value || 0).toFixed(2);
}

export default function InvoiceGenerator() {
  const [invoiceNo, setInvoiceNo] = useState('INV-001');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [fromName, setFromName] = useState('Hype NA');
  const [toName, setToName] = useState('');
  const [notes, setNotes] = useState('Thank you for your business.');
  const [items, setItems] = useState([
    { description: 'Service item', qty: 1, rate: 0 },
  ]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0),
    [items]
  );

  function updateItem(idx, key, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { description: '', qty: 1, rate: 0 }]);
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function printInvoice() {
    window.print();
  }

  function downloadPdf() {
    window.print();
  }

  return (
    <main className={`${styles.main} page-enter`}>
      <div className={styles.header}>
        <h2>Invoice Generator</h2>
        <p>Create invoices quickly, then print or save as PDF.</p>
      </div>

      <div className={styles.layout}>
        <section className={styles.panel}>
          <h3 className={styles.sectionTitle}>Invoice Details</h3>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Invoice No</span>
              <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Issue Date</span>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Due Date</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>From</span>
              <input value={fromName} onChange={(e) => setFromName(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Bill To</span>
              <input value={toName} onChange={(e) => setToName(e.target.value)} />
            </label>
          </div>

          <h3 className={styles.sectionTitle}>Items</h3>
          <div className={styles.items}>
            {items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <input
                  className={styles.desc}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  className={styles.small}
                  value={item.qty}
                  onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={styles.small}
                  value={item.rate}
                  onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                />
                <div className={styles.amount}>N$ {money(Number(item.qty || 0) * Number(item.rate || 0))}</div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={addItem}>+ Add Item</button>
            <div className={styles.actionRight}>
              <button type="button" className={styles.secondaryBtn} onClick={printInvoice}>Print Preview</button>
              <button type="button" className={styles.primaryBtn} onClick={downloadPdf}>Download PDF</button>
            </div>
          </div>

          <label className={styles.field}>
            <span>Notes</span>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </section>

        <section className={styles.preview}>
          <div className={styles.invoiceCard}>
            <div className={styles.invoiceTop}>
              <div className={styles.invoiceBrand}>
                <img src={logo} alt="Hype NA logo" className={styles.invoiceLogo} />
                <div>
                  <h3>INVOICE</h3>
                  <p>{fromName || 'Hype NA'}</p>
                </div>
              </div>
              <p className={styles.invoiceNo}>{invoiceNo || 'INV-000'}</p>
            </div>
            <div className={styles.meta}>
              <p><strong>From:</strong> {fromName || '-'}</p>
              <p><strong>Bill To:</strong> {toName || '-'}</p>
              <p><strong>Issue:</strong> {issueDate || '-'}</p>
              <p><strong>Due:</strong> {dueDate || '-'}</p>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description || '-'}</td>
                    <td>{item.qty || 0}</td>
                    <td>N$ {money(item.rate)}</td>
                    <td>N$ {money(Number(item.qty || 0) * Number(item.rate || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.total}>Total: N$ {money(subtotal)}</div>
            <p className={styles.notes}><strong>Notes:</strong> {notes || '-'}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
