import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Camera, AlertCircle, RefreshCw,  
  CheckCircle2, XCircle
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { useScanTicket } from '../hooks/useScanTicket';

export default function CompanyScanTicket() {
  const {
    cameras,
    selectedCameraId,
    isScannerActive,
    cameraPermissionError,
    currentScanResult,
    isApiSubmitting,
    apiResponse,
    requestCameras,
    startScanner,
    toggleScanner,
    handleCameraChange,
    resetResponse
  } = useScanTicket();

  return (
    <CompanyLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto w-full rtl text-right flex flex-col justify-center min-h-[calc(100vh-90px)]" dir="rtl">
        
        {/* Header section with minimal title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2 mb-1">
            <QrCode className="text-orange-600" size={28} />
            مسح تذكرة الصعود
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            وجه كاميرا الجوال أو الكمبيوتر نحو كود تذكرة العميل للتأكد والتحقق الفوري.
          </p>
        </div>

        {/* Central Card with Camera Preview OR Results */}
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm flex flex-col relative min-h-[420px]">
          
          {/* Header Controls */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-full ${isScannerActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-[11px] font-bold text-gray-700">
                {isScannerActive ? 'الكاميرا نشطة الآن' : 'الكاميرا جاهزة للعمل'}
              </span>
            </div>

            {cameras.length > 1 && !apiResponse && !isApiSubmitting && (
              <select
                value={selectedCameraId}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="text-[11px] font-bold text-gray-650 bg-white border border-gray-200 rounded-lg px-2 py-1 pr-1 pl-4 outline-none cursor-pointer"
              >
                {cameras.map((cam, idx) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `كاميرا ${idx + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Core Viewer Area */}
          <div className="flex-1 min-h-[300px] bg-slate-950 relative flex items-center justify-center overflow-hidden">
            
            {/* 1. Camera element container */}
            <div id="reader-element" className="w-full h-full absolute inset-0 [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />

            {/* 2. HUD Scan Line Overlay (Only when scanning and no response is shown) */}
            {isScannerActive && !currentScanResult && (
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] border-2 border-orange-500 rounded-2xl relative">
                  {/* Glowing dynamic scan bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 animate-[bounce_3s_infinite] shadow-md shadow-orange-500/50" />
                </div>
              </div>
            )}

            {/* 3. Inactive/Empty camera cover */}
            {!isScannerActive && !isApiSubmitting && !apiResponse && (
              <div className="text-center z-10 px-6 space-y-4">
                <div className="p-3 bg-orange-600/10 text-orange-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto border border-orange-500/20">
                  <Camera size={26} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black">اضغط لتشغيل الكاميرا</h4>
                  <p className="text-[10px] text-gray-400 max-w-xs mx-auto mt-1">
                    يرجى السماح بصلاحيات الكاميرا بمتصفحك لبدء توجيه رموز تذاكر المسافرين.
                  </p>
                </div>
              </div>
            )}

            {/* 4. API Request Loader Overlay */}
            {isApiSubmitting && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-20 space-y-3">
                <RefreshCw className="text-orange-500 animate-spin" size={32} />
                <span className="text-xs text-white font-bold">جاري مراجعة الكود والتحقق من التذكرة...</span>
              </div>
            )}

            {/* 5. Camera Permission Error Cover */}
            {cameraPermissionError && !isScannerActive && !apiResponse && (
              <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center z-20 space-y-3">
                <AlertCircle className="text-red-500" size={32} />
                <p className="text-[11px] text-gray-300 max-w-xs">
                  {cameraPermissionError}
                </p>
                <button
                  onClick={requestCameras}
                  className="bg-white hover:bg-gray-150 text-gray-900 text-[10px] font-black px-4 py-2 rounded-xl transition"
                >
                  إعادة طلب الأذونات
                </button>
              </div>
            )}

            {/* 6. Success / Error result card screen overlay */}
            <AnimatePresence>
              {apiResponse && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`absolute inset-0 z-30 p-6 flex flex-col items-center justify-center text-center ${
                    apiResponse.success 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}
                >
                  <div className="p-4 bg-white/10 rounded-full mb-3 border border-white/20">
                    {apiResponse.success ? (
                      <CheckCircle2 size={48} className="text-white" />
                    ) : (
                      <XCircle size={48} className="text-white" />
                    )}
                  </div>

                  <h3 className="text-lg font-black tracking-tight mb-2">
                    {apiResponse.success ? 'تم قبول التذكرة بنجاح' : 'فشل التحقق من التذكرة'}
                  </h3>

                  <p className="text-xs font-medium max-w-sm leading-relaxed mb-6 bg-white/10 py-3 px-4 rounded-xl border border-white/10">
                    {apiResponse.message}
                  </p>

                  <button
                    onClick={() => {
                      resetResponse();
                      startScanner();
                    }}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    مسح تذكرة جديدة
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Bottom Action bar */}
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center">
            {!apiResponse && (
              <button
                onClick={toggleScanner}
                disabled={isApiSubmitting}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-2 max-w-xs ${
                  isScannerActive
                    ? 'bg-red-50 hover:bg-red-100/80 text-red-700 border border-red-150'
                    : 'bg-orange-600 hover:bg-orange-700 text-white font-black'
                }`}
              >
                <Camera size={15} />
                {isScannerActive ? 'إيقاف تشغيل الكاميرا' : 'بدء المسح المباشر'}
              </button>
            )}
          </div>

        </div>

      </div>
    </CompanyLayout>
  );
}
