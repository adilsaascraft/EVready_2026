'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type ScanDay = 'day1' | 'day2' | 'day3'

const DAY_API: Record<ScanDay, string> = {
  day1: '/api/registers/day1',
  day2: '/api/registers/day2',
  day3: '/api/registers/day3',
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type FlashState = 'success' | 'error' | null

export default function QrScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const zebraInputRef = useRef<HTMLInputElement | null>(null)

  const [activeDay, setActiveDay] = useState<ScanDay | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [flash, setFlash] = useState<FlashState>(null)
  const [processing, setProcessing] = useState(false)
  const [zebraValue, setZebraValue] = useState('')

  // ==========================
  // Live Count
  // ==========================
  const { data, mutate } = useSWR(
    activeDay
      ? `${process.env.NEXT_PUBLIC_API_URL}${DAY_API[activeDay]}`
      : null,
    fetcher,
  )

  const count = data?.count ?? 0

  // ==========================
  // Stop Camera Scanner
  // ==========================
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch {}
      scannerRef.current = null
      setIsScanning(false)
    }
  }

  // ==========================
  // Flash Feedback
  // ==========================
  const triggerFlash = (type: FlashState) => {
    setFlash(type)

    setTimeout(() => {
      setFlash(null)
    }, 1200)
  }

  // ==========================
  // API Call (Shared by Zebra + Camera)
  // ==========================
  const markDelivered = async (regNum: string) => {
    if (!activeDay || processing) return
    setProcessing(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${DAY_API[activeDay]}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regNum }),
        },
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      triggerFlash('success')
      mutate()
    } catch (err: any) {
      triggerFlash('error')
    } finally {
      setProcessing(false)
    }
  }

  // ==========================
  // Zebra Scanner Handler
  // ==========================
  const handleZebraSubmit = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter' && zebraValue.trim()) {
      const value = zebraValue.trim()
      setZebraValue('')
      await markDelivered(value)
    }
  }

  // Always keep zebra input focused
  useEffect(() => {
    const interval = setInterval(() => {
      zebraInputRef.current?.focus()
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // ==========================
  // Camera Scanner
  // ==========================
  const startScan = async () => {
    if (!activeDay) {
      toast.error('Select a day first')
      return
    }

    if (isScanning) return

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText) => {
          await stopScanner()
          await markDelivered(decodedText)
        },
        () => {},
      )

      setIsScanning(true)
    } catch {
      toast.error('Camera permission denied')
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  // ==========================
  // UI
  // ==========================
  return (
    <div
      className={`min-h-screen transition-colors duration-75
        ${flash === 'success' ? 'bg-green-600' : ''}
        ${flash === 'error' ? 'bg-red-600' : ''}
      `}
    >
      {/* Hidden Zebra Input */}
      <input
        ref={zebraInputRef}
        value={zebraValue}
        onChange={(e) => setZebraValue(e.target.value)}
        onKeyDown={handleZebraSubmit}
        autoFocus
        className="absolute opacity-0 pointer-events-none"
      />

      <div className="space-y-6 pb-10">
        {/* Banner */}
        <div className="relative w-full overflow-hidden">
          <Image
            src="https://res.cloudinary.com/dymanaa1j/image/upload/v1771464283/Registration_Web_Banner_Image_cnctgq.jpg"
            alt="Event Banner"
            width={1536}
            height={453}
            priority
            sizes="100vw"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Day Selection */}
        <div className="flex justify-center gap-3">
          {(['day1', 'day2', 'day3'] as ScanDay[]).map((day) => (
            <Button
              key={day}
              variant={activeDay === day ? 'default' : 'outline'}
              onClick={() => setActiveDay(day)}
            >
              {day.toUpperCase()}
              {activeDay === day && (
                <Badge className="ml-2" variant="secondary">
                  {count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Camera Scanner */}
        <div className="mx-auto w-full max-w-sm">
          <div id="qr-reader" className="rounded-xl border overflow-hidden" />
        </div>

        <div className="max-w-sm mx-auto">
          <Button onClick={startScan} disabled={isScanning} className="w-full">
            {isScanning ? 'Scanning…' : 'Start Camera Scan'}
          </Button>
        </div>
      </div>
    </div>
  )
}