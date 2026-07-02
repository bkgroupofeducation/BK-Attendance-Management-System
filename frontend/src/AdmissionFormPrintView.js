import React from 'react';

const AdmissionFormPrintView = ({ student }) => {
  if (!student) return null;

  const today = new Date().toLocaleDateString('en-GB');

  const borderStyle = '1px solid #000';

  return (
    <div className="admission-print-container" style={{ pageBreakAfter: 'always', paddingBottom: '20px' }}>
      <div style={{ width: '100%', fontFamily: 'Arial, sans-serif', color: '#000', boxSizing: 'border-box' }}>
        <div style={{ border: '2px solid #000', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header Info */}
          <div style={{ display: 'flex', borderBottom: borderStyle }}>
            {/* Left Side: Company Info */}
            <div style={{ flex: '1', display: 'flex', gap: '15px', alignItems: 'flex-start', padding: '8px', boxSizing: 'border-box' }}>
              <img src="/image.png" alt="Logo" style={{ width: '60px', height: 'auto', objectFit: 'contain', marginTop: '5px' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px', textTransform: 'uppercase' }}>BK Educational & Welfare Society</div>
                <div style={{ fontSize: '12px', color: '#333' }}>1st Floor, Woodland tower 'A' wing, Old Gangapur naka,</div>
                <div style={{ fontSize: '12px', color: '#333' }}>Gangapur road. Nashik - 422013.</div>
                <div style={{ fontSize: '12px', color: '#333' }}>Email : bkgroupofeducation1@gmail.com | Contact No. : 8888301363</div>
                <div style={{ fontSize: '12px', color: '#333' }}>Website : https://www.bkeducation.co.in/</div>
              </div>
            </div>
            
            {/* Right Side: Photo */}
            <div style={{ width: '120px', borderLeft: borderStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
              {student.photo ? (
                <img src={student.photo.startsWith('http') || student.photo.startsWith('data:') ? student.photo : `http://${window.location.hostname}:8080${student.photo}`} alt="Student" style={{ width: '100%', height: '120px', objectFit: 'cover', border: '1px solid #ccc' }} />
              ) : (
                <div style={{ width: '100px', height: '120px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888', textAlign: 'center' }}>
                  Paste<br/>Recent<br/>Photo<br/>Here
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', borderBottom: borderStyle, padding: '8px 0', background: '#f5f5f5', textTransform: 'uppercase' }}>
            ADMISSION FORM
          </div>

          {/* Section: Basic Details */}
          <div style={{ padding: '4px 8px', background: '#eee', borderBottom: borderStyle, fontSize: '12px', fontWeight: 'bold' }}>1. Basic Details</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Student Name :</strong> {student.name || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}><strong>Enquiry Date :</strong> {student.enquiryDate || today}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Father's Name :</strong> {student.fatherName || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}><strong>Mother's Name :</strong> {student.motherName || ''}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Date of Birth :</strong> {student.dob || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}><strong>Gender :</strong> {student.gender || ''}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Aadhar Number :</strong> {student.aadhar || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}><strong>Biometric Reg No :</strong> {student.fingerprint_id || ''}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Email Id :</strong> {student.email || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}><strong>Student Ph:</strong> {student.studentContact || ''}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Father Ph:</strong> {student.fatherContact || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}><strong>Mother Ph:</strong> {student.motherContact || ''}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Residential Address :</strong> {student.address || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}></div>
          </div>

          {/* Section: Class Details */}
          <div style={{ padding: '4px 8px', background: '#eee', borderBottom: borderStyle, fontSize: '12px', fontWeight: 'bold' }}>2. Class Details</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Branch :</strong> {student.branch || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}><strong>Course :</strong> {student.course || ''}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Batch Timing :</strong> {student.batchTiming || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}></div>
          </div>

          {/* Section: Academic Details */}
          <div style={{ padding: '4px 8px', background: '#eee', borderBottom: borderStyle, fontSize: '12px', fontWeight: 'bold' }}>3. Academic Details</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>10th Percentage :</strong> {student.tenthPercent || ''} %</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}><strong>12th Percentage :</strong> {student.twelfthPercent || ''} %</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: borderStyle }}>
            <div style={{ padding: '6px 8px', borderRight: borderStyle, fontSize: '12px' }}><strong>Previous School/College Name :</strong> {student.previousSchool || ''}</div>
            <div style={{ padding: '6px 8px', fontSize: '12px' }}></div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '50px 20px 20px 20px', marginTop: '20px' }}>
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', width: '200px', borderTop: '1px solid #000', paddingTop: '5px' }}>
              Student Signature
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', width: '200px', borderTop: '1px solid #000', paddingTop: '5px' }}>
              Parent/Guardian Signature
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', width: '200px', borderTop: '1px solid #000', paddingTop: '5px' }}>
              Authorized Signatory
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .admission-print-container {
          display: none;
        }
        @media print {
          body.print-receipt .admission-print-container {
            display: none !important;
          }
          body.print-admission * {
            visibility: hidden;
          }
          body.print-admission .admission-print-container, body.print-admission .admission-print-container * {
            visibility: visible;
          }
          .admission-print-container {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            margin: 0;
            padding: 0;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default AdmissionFormPrintView;
