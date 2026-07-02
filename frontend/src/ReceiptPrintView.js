import React from 'react';

const ReceiptPrintView = ({ student }) => {
  if (!student) return null;

  const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
  const receiptNo = student.receiptNo || '';
  
  const safeDueFees = student.dueFees !== undefined ? Number(student.dueFees) : 0;
  
  let dueDate = '';
  if (safeDueFees > 0) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    dueDate = d.toLocaleDateString('en-GB');
  }

  const borderStyle = '1px solid #000';

  const ReceiptSection = ({ title }) => (
    <div style={{ width: '100%', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '10px', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>{title}</div>
      
      <div style={{ border: '2px solid #000', display: 'flex', flexDirection: 'column' }}>
        {/* Header Info */}
        <div style={{ display: 'flex', borderBottom: borderStyle }}>
          {/* Left Side: Company Info */}
          <div style={{ flex: '0 0 50%', display: 'flex', gap: '15px', alignItems: 'flex-start', padding: '8px', boxSizing: 'border-box' }}>
            {/* Logo */}
            <img src="/image.png" alt="Logo" style={{ width: '45px', height: 'auto', objectFit: 'contain', marginTop: '5px' }} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>BK Educational & Welfare Society</div>
              <div style={{ fontSize: '10px', color: '#333' }}>1st Floor, Woodland tower 'A' wing, Old Gangapur naka,</div>
              <div style={{ fontSize: '10px', color: '#333' }}>Gangapur road. Nashik - 422013.</div>
              <div style={{ fontSize: '10px', color: '#333' }}>Email : bkgroupofeducation1@gmail.com</div>
              <div style={{ fontSize: '10px', color: '#333' }}>Contact No. : 8888301363</div>
              <div style={{ fontSize: '10px', color: '#333' }}>Website : https://www.bkeducation.co.in/</div>
            </div>
          </div>
          {/* Right Side: Student Info */}
          <div style={{ flex: '0 0 50%', borderLeft: borderStyle, padding: '8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '6px' }}>{student.name}</div>
            <div style={{ fontSize: '10px', color: '#333', marginBottom: '2px' }}>Address : {student.address || ''}</div>
            <div style={{ fontSize: '10px', color: '#333', marginBottom: '2px' }}>Email : {student.email || ''}</div>
            <div style={{ fontSize: '10px', color: '#333' }}>Contact No. : {student.studentPhone || ''}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderBottom: borderStyle, padding: '4px 0', background: '#f5f5f5', textTransform: 'uppercase' }}>
          FEES RECEIPT
        </div>

        {/* Date & Receipt No */}
        <div style={{ display: 'flex', borderBottom: borderStyle, fontSize: '11px', fontWeight: 'bold' }}>
          <div style={{ flex: '0 0 50%', padding: '4px 8px', boxSizing: 'border-box' }}>Receipt Date : {student.enquiryDate || today}</div>
          <div style={{ flex: '0 0 50%', padding: '4px 8px', borderLeft: borderStyle, boxSizing: 'border-box' }}>Receipt No. : {receiptNo}</div>
        </div>

        {/* Course & Amount */}
        <div style={{ borderBottom: borderStyle, padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
          Courses : <span style={{fontWeight: 'normal'}}>{student.courses && student.courses.length > 0 ? student.courses.join(', ') : ''}</span>
        </div>
        <div style={{ borderBottom: borderStyle, padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
          Amount received : <span style={{fontWeight: 'normal'}}>₹ {student.amountReceived || student.fee || '0'}</span>
        </div>
        <div style={{ borderBottom: borderStyle, padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
          Amount received (in words) : <span style={{fontWeight: 'normal'}}>{student.amountReceivedWords || ''}</span>
        </div>

        {/* Payment Details Grid */}
        <div style={{ display: 'flex' }}>
          {/* Left Column */}
          <div style={{ flex: '0 0 50%', borderRight: borderStyle, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: borderStyle }}><strong>Payment mode :</strong> {student.paymentMode || ''}</div>
            <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: borderStyle }}><strong>Total Fees :</strong> {student.fee ? `₹ ${student.fee}` : ''}</div>
            <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: borderStyle }}><strong>Installment (Yes/No) :</strong> {student.installment || 'No'}</div>
            <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: borderStyle }}><strong>Due Date :</strong> {dueDate}</div>
            <div style={{ padding: '4px 8px', fontSize: '11px' }}><strong>Due Fees :</strong> ₹ {safeDueFees}</div>
          </div>
          {/* Right Column */}
          <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: borderStyle }}><strong>Cheque/Txn No. :</strong> {student.receiptNo || ''}</div>
            <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: borderStyle }}><strong>Bank Name :</strong> {student.bankName || ''}</div>
            <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: borderStyle }}><strong>Account No :</strong> {student.accountNumber || ''}</div>
            <div style={{ padding: '4px 8px', fontSize: '11px' }}><strong>IFSC Code :</strong> {student.ifscCode || ''}</div>
          </div>
        </div>

        {/* Terms */}
        <div style={{ borderTop: borderStyle, padding: '6px 8px' }}>
          <strong style={{ fontSize: '10px', display: 'block', marginBottom: '2px' }}>Terms & Conditions :</strong>
          <div style={{ fontSize: '9px', color: '#444', lineHeight: '1.4' }}>
            <div>1. All above mentioned Amount once paid are non refundable in any case whatsoever.</div>
            <div>2. Late payment will attract extra charges.</div>
            <div>3. Fees are non-transferable to another student/course.</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '9px', fontStyle: 'italic', marginTop: '6px', color: '#333', fontWeight: 'bold' }}>
            This is computer-generated receipt. No signature is required for validation.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="receipt-print-container">
      <ReceiptSection title="Student's Copy" />
      
      <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0', opacity: 0.6 }}>
        <div style={{ flex: 1, borderTop: '1px dashed #000' }}></div>
        <div style={{ padding: '0 15px', fontSize: '10px', fontStyle: 'italic', color: '#555' }}>✂ Fold or Cut along this line</div>
        <div style={{ flex: 1, borderTop: '1px dashed #000' }}></div>
      </div>
      
      <ReceiptSection title="Office Copy" />
      
      <style>{`
        .receipt-print-container {
          display: none;
        }
        @media print {
          body.print-admission .receipt-print-container {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }
          body.print-receipt * {
            visibility: hidden;
          }
          body.print-receipt .receipt-print-container, body.print-receipt .receipt-print-container * {
            visibility: visible;
          }
          .receipt-print-container {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPrintView;
