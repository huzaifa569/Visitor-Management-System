'use client';

import { useState, useEffect } from 'react';
import { newVisitorAPI } from '@/lib/api';
import {
  X,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
  QrCode,
  Info as InfoIcon,
  RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface QRCodeDisplayProps {
  visitorId: string;
  onClose: () => void;
}

export default function QRCodeDisplay({ visitorId, onClose }: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<string>('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        // Try to get QR code from API
        try {
          const data = await newVisitorAPI.generateQrCode(visitorId);
          console.log('QR code API response:', data);

          if (data && typeof data === 'object') {
            // Handle different response formats based on API implementation
            if ('qrCodeUrl' in data && typeof data.qrCodeUrl === 'string') {
              setQrImage(data.qrCodeUrl);
              setQrData(`visitor:${visitorId}:${Date.now()}`); // Fallback data for QR code content
              setSuccess('QR code generated successfully');
              return;
            } else if ('qrCode' in data && typeof data.qrCode === 'string') {
              // Some APIs return base64 image
              setQrImage(data.qrCode);
              setQrData(`visitor:${visitorId}:${Date.now()}`); // Fallback data for QR code content
              setSuccess('QR code generated successfully');
              return;
            } else if ('data' in data && typeof data.data === 'object') {
              // Format from Swagger: { success: true, data: { qrCode: string, payload: object } }
              const responseData = data.data;
              if (responseData && 'qrCode' in responseData && typeof responseData.qrCode === 'string') {
                setQrImage(responseData.qrCode);

                // If payload is available, use it for QR data
                if ('payload' in responseData && typeof responseData.payload === 'object') {
                  const payload = responseData.payload;
                  if (payload && 'visitorId' in payload) {
                    setQrData(JSON.stringify(payload));
                    setSuccess('QR code generated successfully');
                    return;
                  }
                }

                // Fallback if payload is not available
                setQrData(`visitor:${visitorId}:${Date.now()}`);
                setSuccess('QR code generated successfully');
                return;
              }
            }
          } else if (typeof data === 'string') {
            // Some APIs might return just the QR code data as a string
            setQrData(data);
            setSuccess('QR code generated successfully');
            return;
          }

          // If we get here, the API response format wasn't recognized
          console.warn('Unrecognized QR code API response format:', data);
          throw new Error('Unrecognized QR code format from API');

        } catch (apiError) {
          console.error('API QR code generation failed:', apiError);
          setError('Failed to generate QR code from server');
        }

      } catch (err) {
        console.error('Error in QR code generation:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQrCode();
  }, [visitorId]);

  const handleDownload = () => {
    if (!qrData && !qrImage) return;

    try {
      // If we have a QR image from the API, download that
      if (qrImage && qrImage.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = qrImage;
        link.download = `visitor-pass-${visitorId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Otherwise try to get the SVG QR code we generated
      const svgElement = document.getElementById('qr-code-svg');
      if (svgElement) {
        // Create a canvas with a white background and padding
        const canvas = document.createElement('canvas');
        const size = 300; // Final image size with padding
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);

        // Add a title at the top
        ctx.fillStyle = '#1E40AF'; // Blue-700
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Visitor QR Code', size/2, 30);

        // Add visitor ID
        ctx.fillStyle = '#1F2937'; // Gray-800
        ctx.font = '14px Arial';
        ctx.fillText(`Visitor ID: ${visitorId}`, size/2, size - 30);

        // Create an image from the SVG
        const img = document.createElement('img');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          // Draw the QR code in the center with padding
          const padding = 30;
          ctx.drawImage(img, padding, padding + 10, size - (padding * 2), size - (padding * 2) - 20);
          URL.revokeObjectURL(url);

          // Add a border around the QR code
          ctx.strokeStyle = '#E5E7EB'; // Gray-200
          ctx.lineWidth = 1;
          ctx.strokeRect(padding - 5, padding + 5, size - (padding * 2) + 10, size - (padding * 2) - 10);

          // Download the canvas as PNG
          try {
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `visitor-pass-${visitorId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (err) {
            console.error('Error creating download link:', err);
            setError('Failed to create download link. Try again or take a screenshot.');
          }
        };

        img.onerror = () => {
          console.error('Error loading SVG image');
          setError('Failed to process QR code for download');
        };

        img.src = url;
      }
    } catch (err) {
      console.error('Error downloading QR code:', err);
      setError('Failed to download QR code');
    }
  };

  const handleShare = async () => {
    if (!qrData && !qrImage) return;

    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({
          title: 'Visitor QR Code',
          text: 'Scan this QR code for visitor access',
          url: window.location.href
        });
      }
    } catch (err) {
      console.error('Error sharing QR code:', err);
      setError('Failed to share QR code');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <QrCode className="h-5 w-5 text-blue-600 mr-2" />
            Visitor QR Code
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && !error && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        ) : qrImage ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-5 rounded-lg shadow-md mb-5 border border-gray-100">
              <div className="relative">
                <Image 
                  src={qrImage}
                  alt="Visitor QR Code"
                  width={50}
                  height={50}
                  className="w-64 h-64 object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none rounded-lg"></div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-5 w-full">
              <h3 className="font-medium text-blue-800 mb-1 flex items-center">
                <InfoIcon className="h-4 w-4 mr-1.5" />
                Instructions
              </h3>
              <p className="text-sm text-blue-700">
                Present this QR code at the reception desk or security checkpoint for scanning.
                This code is valid for your scheduled visit and contains your visitor information.
              </p>
            </div>
            <div className="flex space-x-4 w-full">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg transition-colors flex-1 shadow-sm"
              >
                <Download className="mr-2 h-5 w-5" />
                Download
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex-1 shadow-sm"
                >
                  <Share className="mr-2 h-5 w-5" />
                  Share
                </button>
              )}
            </div>
          </div>
        ) : qrData ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-5 rounded-lg shadow-md mb-5 border border-gray-100">
              <div className="relative">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrData}
                  size={240}
                  level="H"
                  className="p-4"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none rounded-lg"></div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-5 w-full">
              <h3 className="font-medium text-blue-800 mb-1 flex items-center">
                <InfoIcon className="h-4 w-4 mr-1.5" />
                Instructions
              </h3>
              <p className="text-sm text-blue-700">
                Present this QR code at the reception desk or security checkpoint for scanning.
                This code is valid for your scheduled visit and contains your visitor information.
              </p>
            </div>
            <div className="flex space-x-4 w-full">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg transition-colors flex-1 shadow-sm"
              >
                <Download className="mr-2 h-5 w-5" />
                Download
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex-1 shadow-sm"
                >
                  <Share className="mr-2 h-5 w-5" />
                  Share
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">No QR code available.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
