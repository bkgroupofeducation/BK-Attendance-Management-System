import React, { useState, useRef } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

const QuickEnrollPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        fingerprint_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [photoData, setPhotoData] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const startCamera = async () => {
        setCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera. Make sure you are using localhost or HTTPS.");
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setPhotoData(dataUrl);
            stopCamera();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoData(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.fingerprint_id.trim()) {
            alert('Please provide both the Student Name and Biometric Registration No.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                fingerprint_id: formData.fingerprint_id,
                photo: photoData,
                role: 'student'
            };
            await api.post('/users/enroll', payload);
            alert(`✅ Successfully enrolled ${formData.name}!`);
            navigate('/admissions');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
        setLoading(false);
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', minHeight: '600px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0284c7', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '40px' }}>
                <span style={{ marginRight: '8px' }}>⚡</span> Quick Biometric Enrollment
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Student Full Name*</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInput} 
                        placeholder="E.g. John Doe" 
                        style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555', fontSize: '16px' }} 
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Biometric Registration No.*</label>
                    <input 
                        type="text" 
                        name="fingerprint_id" 
                        value={formData.fingerprint_id} 
                        onChange={handleInput} 
                        placeholder="E.g. 101" 
                        style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555', fontSize: '16px' }} 
                    />
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#555' }}>Student Photo (Optional but Recommended)</label>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ marginBottom: '10px', fontSize: '13px', color: '#666' }}>Option 1: Upload Photo</div>
                            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ marginBottom: '10px', fontSize: '13px', color: '#666' }}>Option 2: Live Webcam</div>
                            {!cameraActive && !photoData && (
                                <button onClick={startCamera} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>📷 Start Webcam</button>
                            )}
                            {cameraActive && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: '8px', background: '#000' }}></video>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={capturePhoto} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>📸 Capture</button>
                                        <button onClick={stopCamera} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Cancel</button>
                                    </div>
                                </div>
                            )}
                            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                        </div>
                        {photoData && (
                            <div style={{ width: '100%', textAlign: 'center', marginTop: '15px' }}>
                                <img src={photoData} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #0284c7', marginBottom: '8px' }} />
                                <div>
                                    <button onClick={() => setPhotoData(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Remove Photo</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading} 
                        style={{ width: '100%', padding: '16px', background: '#0284c7', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(2, 132, 199, 0.2)' }}
                    >
                        {loading ? 'Enrolling...' : '⚡ Quick Enroll Student'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickEnrollPage;
