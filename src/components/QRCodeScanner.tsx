'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { accessControlAPI } from '@/lib/api';
import { Camera, X, AlertCircle, CheckCircle, Scan } from 'lucide-react';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  token: string;
  onClose: () => void;
}

export default function QRCodeScanner({ token, onClose }: QRCodeScannerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [processingQR, setProcessingQR] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [scanAttempts, setScanAttempts] = useState(0);

  const router = useRouter();

  // Function to scan a video frame for QR codes
  const scanQRCode = useCallback(() => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      // Not ready yet, try again in the next frame
      requestAnimationFrame(scanQRCode);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Use jsQR to detect QR codes
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert", // Try normal first, then inverted if needed
    });

    if (code) {
      // QR code detected
      console.log("QR Code detected:", code.data);
      handleQRCode(code.data);
    } else {
      // No QR code found, increment attempt counter
      setScanAttempts(prev => prev + 1);

      // Continue scanning in the next frame
      requestAnimationFrame(scanQRCode);
    }
  }, [scanning]);

  // Handle QR code data after successful scan
  const handleQRCode = useCallback(async (qrData: string) => {
    if (processingQR) return; // Prevent multiple simultaneous processing

    try {
      setProcessingQR(true);
      setScanResult(qrData);
      setScanning(false);

      // Stop the camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      console.log('QR code data:', qrData);

      // Extract visitor ID from QR code data
      let visitorId = '';

      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(qrData);
        if (jsonData && typeof jsonData === 'object') {
          if ('visitorId' in jsonData) {
            visitorId = jsonData.visitorId;
          } else if ('id' in jsonData) {
            visitorId = jsonData.id;
          }
        }
      } catch (e) {
        // Not JSON, try other formats
        if (qrData.startsWith('visitor:')) {
          // Format: visitor:123456:timestamp
          visitorId = qrData.split(':')[1];
        } else if (qrData.startsWith('visitor-')) {
          // Format: visitor-123456
          visitorId = qrData.replace('visitor-', '');
        } else if (/^\d{6,}$/.test(qrData)) {
          // Format: Just a numeric ID (at least 6 digits)
          visitorId = qrData;
        } else {
          // Try to extract any numeric sequence that could be an ID
          const matches = qrData.match(/\d{6,}/);
          if (matches && matches.length > 0) {
            visitorId = matches[0];
          }
        }
      }

      if (!visitorId) {
        setError('Invalid QR code format. Expected visitor ID not found.');
        setProcessingQR(false);
        return;
      }

      if (token) {
        try {
           console.log('API response qrData:', qrData);
          console.log('API response qrData:', token);
          // Validate QR code with backend
          const response = await accessControlAPI.validateQrCode(qrData, token);

    
          // Handle the response based on its format
          if (response && typeof response === 'object') {
            // Extract visitor ID from various possible response formats
            let validatedId = '';
            let isValid = false;

             if ('valid' in response && 'visitorId' in response) {
              validatedId = response.visitorId as string;
              isValid = response.valid as boolean;
            } else if ('accessGranted' in response && 'visitorId' in response) {
              validatedId = response.visitorId as string;
              isValid = response.accessGranted as boolean;
            } else if ('data' in response && typeof response.data === 'object') {
              const data = response.data;
              if (data && typeof data === 'object' && 'visitorId' in data) {
                validatedId = data.visitorId as string;
                isValid = true;
              }
            }

            if (isValid && validatedId) {
              router.push(`/check-in/${validatedId}`);
              onClose();
              return;
            } else {
              setError('Invalid QR code. Access denied.');
            }
          } else {
            setError('Invalid response from server');
          }
        } catch (apiErr) {
          console.error('API validation error:', apiErr);

          // If API validation fails, try to use the extracted visitor ID as fallback
          router.push(`/check-in?visitorId=${visitorId}`);
          onClose();
        }
      } else {
        // If no token is provided (public scanning), just redirect to check-in page with visitor ID
        router.push(`/check-in?visitorId=${visitorId}`);
        onClose();
      }
    } catch (err) {
      setError('Failed to process QR code: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setProcessingQR(false);
    }
  }, [token, router, onClose, processingQR]);

  // Start the camera and QR scanning
  const startScanner = useCallback(async () => {
    try {
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      setCameraPermission('granted');
      streamRef.current = stream;

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // required for iOS
        await videoRef.current.play();
        setScanning(true);

        // Start scanning frames
        requestAnimationFrame(scanQRCode);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraPermission('denied');
      setError('Camera access denied. Please check your camera permissions and try again.');
    }
  }, [scanQRCode]);

  // Initialize scanner when component mounts
  useEffect(() => {
    startScanner();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [startScanner]);

  // Function to handle manual QR code input
  const handleManualInput = () => {
    const manualInput = prompt('Enter the QR code data or visitor ID:');
    if (manualInput && manualInput.trim()) {
      handleQRCode(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-blue-700" />
            Scan QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start animate-fadeIn">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={startScanner}
                className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <Camera className="h-4 w-4 mr-1" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 animate-fadeIn">
            <p className="font-medium">QR Code Detected!</p>
            <p className="text-sm">Processing: {scanResult.substring(0, 30)}{scanResult.length > 30 ? '...' : ''}</p>
            <div className="mt-2 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-700 border-t-transparent mr-2"></div>
              <span className="text-xs">Validating...</span>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-xl shadow-inner">
          <video
            ref={videoRef}
            className="w-full h-72 bg-black rounded-xl object-cover"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full opacity-0"
          />

          {scanning && !scanResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-52 border-4 border-white/70 rounded-lg relative">
                {/* Animated scanner line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-[scanDown_2s_ease-in-out_infinite]"></div>

                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-sm"></div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/60 backdrop-blur-sm py-2 text-sm font-medium">
                Position QR code within the frame
              </div>
            </div>
          )}

          {!scanning && !error && !scanResult && cameraPermission !== 'denied' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-3"></div>
                <p className="text-white text-sm">Initializing camera...</p>
              </div>
            </div>
          )}

          {cameraPermission === 'denied' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-lg max-w-xs text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">Camera Access Denied</h3>
                <p className="text-gray-600 mb-4">Please allow camera access in your browser settings to scan QR codes.</p>
                <button
                  onClick={handleManualInput}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
                >
                  Enter Code Manually
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 text-center text-sm flex flex-col items-center justify-center">
          <div className="mb-3 bg-blue-50 py-2 px-4 rounded-full inline-flex items-center">
            {scanning && !scanResult ? (
              <>
                <Camera className="h-4 w-4 mr-2 text-blue-600 animate-pulse" />
                <span className="text-blue-800 font-medium">Scanning for QR code...</span>
              </>
            ) : scanResult ? (
              <div className="text-green-700 font-medium animate-pulse flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Processing QR code...
              </div>
            ) : (
              <span className="text-blue-800">Camera access required for scanning</span>
            )}
          </div>

          {scanning && !scanResult && !processingQR && (
            <button
              onClick={handleManualInput}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors"
            >
              <Scan className="h-4 w-4 mr-2" />
              Enter QR code manually
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
