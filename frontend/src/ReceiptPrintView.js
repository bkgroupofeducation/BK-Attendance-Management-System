import React from 'react';

const ReceiptPrintView = ({ student }) => {
  if (!student) return null;

  const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
  const receiptNo = student.receiptNo || 'NA';
  
  // Calculate due fees safely, defaulting to 0 for old records without this field
  const safeDueFees = student.dueFees !== undefined ? Number(student.dueFees) : 0;
  
  let dueDate = 'NA';
  if (safeDueFees > 0) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    dueDate = d.toLocaleDateString('en-GB');
  }

  const ReceiptSection = ({ title }) => (
    <div style={{ width: '100%', fontFamily: 'sans-serif', fontSize: '12px', color: '#000', marginBottom: '10px' }}>
      <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '5px' }}>{title}</div>
      
      <div style={{ border: '2px solid #000', padding: '10px' }}>
        {/* Header Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '5px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* Logo */}
            <img src="/image.png" alt="BK Group Logo" style={{ width: '60px', height: 'auto', objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: '900', fontSize: '16px', marginBottom: '4px' }}>BK GROUP OF EDUCATION</div>
              <div style={{ fontSize: '11px' }}>1st Floor, Woodland tower ‘A’ wing, Old Gangapur naka,</div>
              <div style={{ fontSize: '11px' }}>Gangapur road. Nashik - 422013.</div>
              <div style={{ fontSize: '11px' }}>Email : bkgroupofeducation1@gmail.com</div>
              <div style={{ fontSize: '11px' }}>Contact No. : 8888301363</div>
            </div>
          </div>
          <div style={{ borderLeft: '2px solid #000', paddingLeft: '15px', maxWidth: '40%' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{student.name}</div>
            <div style={{ fontSize: '11px' }}>Address : {student.address || 'NA'}</div>
            <div style={{ fontSize: '11px' }}>Email : {student.email || 'NA'}</div>
            <div style={{ fontSize: '11px' }}>Contact No. : {student.studentPhone || 'NA'}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '5px' }}>
          FEES RECEIPT
        </div>

        {/* Date & Receipt No */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '5px', fontWeight: 'bold' }}>
          <div>Receipt Date : {student.enquiryDate || today}</div>
          <div>Receipt No. : {receiptNo}</div>
        </div>

        {/* Course & Amount */}
        <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '3px', marginBottom: '3px' }}>
          <strong>Courses :</strong> {student.courses && student.courses.length > 0 ? student.courses.join(', ') : 'NA'}
        </div>
        <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '3px', marginBottom: '3px' }}>
          <strong>Amount received :</strong> ₹ {student.amountReceived || student.fee || '0'}
        </div>
        <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '3px', marginBottom: '3px' }}>
          <strong>Amount received (in words) :</strong> {student.amountReceivedWords || 'NA'}
        </div>

        {/* Payment Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '5px' }}>
          <div><strong>Payment mode :</strong> {student.paymentMode || 'NA'}</div>
          <div><strong>Cheque No. :</strong> NA</div>
          
          <div><strong>Total Fees :</strong> {student.fee ? `₹ ${student.fee}` : 'NA'}</div>
          <div><strong>Bank Name :</strong> {student.bankName || 'NA'}</div>
          
          <div><strong>Installment (Yes/No) :</strong> {student.installment || 'NA'}</div>
          <div><strong>IFSC Code :</strong> {student.ifscCode || 'NA'}</div>
          
          <div><strong>Due Date :</strong> {dueDate}</div>
          <div><strong>Due Fees :</strong> ₹ {safeDueFees}</div>
        </div>

        {/* Terms */}
        <div>
          <strong style={{ fontSize: '11px' }}>Terms & Conditions :</strong>
          <ol style={{ margin: '5px 0 0 15px', padding: 0, fontSize: '10px', lineHeight: '1.4' }}>
            <li>All above mentioned Amount once paid are non refundable in any case whatsoever.</li>
            <li>Late payment will attract extra charges.</li>
            <li>Fees are non-transferable to another student/course.</li>
          </ol>
        </div>
      </div>
    </div>
  );

  return (
    <div className="receipt-print-container">
      <ReceiptSection title="Student's Copy" />
      
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', opacity: 0.5 }}>
        <div style={{ flex: 1, borderTop: '1px dashed #000' }}></div>
        <div style={{ padding: '0 10px', fontSize: '10px' }}>✂ Fold or Cut along this line</div>
        <div style={{ flex: 1, borderTop: '1px dashed #000' }}></div>
      </div>
      
      <ReceiptSection title="Office Copy" />
      
      <style>{`
        .receipt-print-container {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-print-container, .receipt-print-container * {
            visibility: visible;
          }
          .receipt-print-container {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPrintView;
