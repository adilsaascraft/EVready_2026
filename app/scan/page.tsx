'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function QrScanner({ eventId }: { eventId: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const startScan = async () => {
  const scanner = new Html5Qrcode('qr-reader')
  scannerRef.current = scanner

  try {
    await scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },

      // ✅ SUCCESS callback
      async (decodedText) => {
        await scanner.stop()
        setIsScanning(false)
        handleQrResult(decodedText)
      },

      // ✅ ERROR callback (required by TS)
      (errorMessage) => {
        // Ignore scan errors (this fires every frame when QR not found)
        // console.log(errorMessage)
      }
    )

    setIsScanning(true)
  } catch (err) {
    console.error(err)
    toast.error('Camera permission denied or not available')
  }
}


  const handleQrResult = async (qrValue: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event/${eventId}/mark-delivered`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrCode: qrValue, // 👈 scanned value
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      toast.success('Status updated to DELIVERED ✅')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        className="w-full max-w-sm mx-auto rounded-lg overflow-hidden"
      />

      <Button onClick={startScan} disabled={isScanning} className="w-full">
        {isScanning ? 'Scanning...' : 'Scan QR Code'}
      </Button>
    </div>
  )
}
