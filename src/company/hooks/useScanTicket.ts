import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { BookingService } from '../../shared/api/services/booking.service';

/**
 * Custom state and process manager for camera-based ticket scanning
 * Separates barcode decryption and API verification logic from the presentational layout.
 */
export function useScanTicket() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  
  // SCANNER PROCESS STATES
  const [currentScanResult, setCurrentScanResult] = useState<string | null>(null);
  const [isApiSubmitting, setIsApiSubmitting] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  // Camera container refs
  const qrInstanceRef = useRef<Html5Qrcode | null>(null);

  // Initialize and list cameras
  useEffect(() => {
    requestCameras();
    return () => {
      cleanupScanner();
    };
  }, []);

  const requestCameras = async () => {
    setCameraPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') || 
          d.label.toLowerCase().includes('environment')
        );
        setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
      } else {
        setCameraPermissionError('لم يتم العثور على كاميرات نشطة في جهازك.');
      }
    } catch (err: any) {
      console.error('Error listing cameras:', err);
      setCameraPermissionError(
        'يرجى تفعيل صلاحية استخدام الكاميرا من المتصفح لمسح تذاكر الصعود.'
      );
    }
  };

  const startScanner = async (cameraIdToUse?: string) => {
    await cleanupScanner();
    setCameraPermissionError(null);
    setApiResponse(null);
    setCurrentScanResult(null);
    
    const id = cameraIdToUse || selectedCameraId;
    
    try {
      const html5Qrcode = new Html5Qrcode('reader-element');
      qrInstanceRef.current = html5Qrcode;

      const config = {
        fps: 20,
        qrbox: (width: number, height: number) => {
          const size = Math.min(width, height) * 0.75;
          return { width: size, height: size };
        }
      };

      await html5Qrcode.start(
        id ? id : { facingMode: 'environment' },
        config,
        (decodedText) => {
          playBeep();
          handleScannedCode(decodedText);
        },
        () => {}
      );

      setIsScannerActive(true);
    } catch (err: any) {
      console.error('Failed to start reader:', err);
      try {
        if (qrInstanceRef.current) {
          await qrInstanceRef.current.start(
            { facingMode: 'environment' },
            { fps: 20, qrbox: 250 },
            (text) => {
              playBeep();
              handleScannedCode(text);
            },
            () => {}
          );
          setIsScannerActive(true);
        }
      } catch (innerErr: any) {
        setCameraPermissionError('فصلت الكاميرا. يرجى التحقق من الأذونات وإعادة المحاولة.');
      }
    }
  };

  const cleanupScanner = async () => {
    if (qrInstanceRef.current) {
      if (qrInstanceRef.current.isScanning) {
        try {
          await qrInstanceRef.current.stop();
        } catch (e) {
          console.error('Error stopping scanner:', e);
        }
      }
      qrInstanceRef.current = null;
    }
    setIsScannerActive(false);
  };

  const toggleScanner = async () => {
    if (isScannerActive) {
      await cleanupScanner();
    } else {
      await startScanner();
    }
  };

  const handleCameraChange = (newId: string) => {
    setSelectedCameraId(newId);
    if (isScannerActive) {
      startScanner(newId);
    }
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
  };

  const handleScannedCode = async (code: string) => {
    if (!code) return;
    
    await cleanupScanner();
    setCurrentScanResult(code);
    setIsApiSubmitting(true);
    setApiResponse(null);

    try {
      let response;
      try {
        response = await BookingService.scanTicket(code, 'POST');
      } catch (postErr: any) {
        if (postErr.response?.status === 405 || postErr.response?.status === 404) {
          response = await BookingService.scanTicket(code, 'GET');
        } else {
          throw postErr;
        }
      }

      const resData = response.data;
      if (resData && (resData.success || resData.statusCode === 200)) {
        setApiResponse({
          success: true,
          message: resData.message || 'تم قبول التذكرة وتأكيد صعود الراكب بنجاح!'
        });
      } else {
        setApiResponse({
          success: false,
          message: resData.message || 'عذراً، التذكرة الممسوحة غير صالحة أو منتهية.'
        });
      }
    } catch (error: any) {
      console.error('Scan Ticket error:', error);
      const serverMessage = error.response?.data?.message || 'عذراً، لا تملك الصلاحية لاستعراض تفاصيل هذا الحجز أو حدث خطأ بالخادم.';
      setApiResponse({
        success: false,
        message: serverMessage
      });
    } finally {
      setIsApiSubmitting(false);
    }
  };

  return {
    cameras,
    selectedCameraId,
    isScannerActive,
    cameraPermissionError,
    currentScanResult,
    isApiSubmitting,
    apiResponse,
    requestCameras,
    startScanner,
    cleanupScanner,
    toggleScanner,
    handleCameraChange,
    resetResponse: () => {
      setApiResponse(null);
      setCurrentScanResult(null);
    }
  };
}
