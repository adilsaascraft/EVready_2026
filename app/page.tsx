'use client'

import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import * as htmlToImage from 'html-to-image'
import Image from 'next/image'
import Link from 'next/link'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2, Download, Car } from 'lucide-react'
import { toast } from 'sonner'
import { useFormDraftStore } from '@/stores/useFormDraftStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { apiRequest } from '@/lib/apiRequest'
import { couponType } from '@/lib/constant'
import {
  CoffeeSponsorSchema,
  CoffeeSponsorForm,
} from '@/validations/registrationSchema'

/* -------------------- PAGE -------------------- */
export default function EVreadyRegistrationPage() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [regNum, setRegNum] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)
  const [agree, setAgree] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)

  const DRAFT_KEY = 'add-ev-form'

  const webinarDraft = useFormDraftStore(
    (state) => state.drafts[DRAFT_KEY]
  )

  const setDraft = useFormDraftStore((state) => state.setDraft)
  const clearDraft = useFormDraftStore((state) => state.clearDraft)

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CoffeeSponsorForm>({
    resolver: zodResolver(CoffeeSponsorSchema),
    defaultValues: webinarDraft || {
      name: '',
      email: '',
      mobile: '',
      couponId: '',
    },
  })

  const watchedValues = useWatch({ control })

  useEffect(() => {
    if (!success) {
      setDraft(DRAFT_KEY, watchedValues)
    }
  }, [watchedValues, success, setDraft])

  /* ---------------- Reset ---------------- */
  const handleNewRegistration = () => {
    reset()
    clearDraft(DRAFT_KEY)
    setAgree(false)
    setTermsError(null)
    setSuccess(false)
    setShowQr(false)
  }

  /* ---------------- Submit ---------------- */
  const onSubmit = async (data: CoffeeSponsorForm) => {
    if (!agree) {
      setTermsError('Please accept Terms & Conditions.')
      return
    }

    setSubmitting(true)
    setTermsError(null)

    try {
      const response = await apiRequest({
        endpoint: '/api/registers',
        method: 'POST',
        body: data,
      })

      toast.success('Registration successful ⚡')
      setRegNum(response.register.regNum)
      setSuccess(true)
      clearDraft(DRAFT_KEY)
      setTimeout(() => setShowQr(true), 1500)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------------- QR Download ---------------- */
  const downloadQrCard = async () => {
    const node = document.getElementById('evready-qr-card')
    if (!node) return

    const dataUrl = await htmlToImage.toPng(node, {
      backgroundColor: '#ffffff',
      pixelRatio: 3,
      width: node.offsetWidth,
      height: node.offsetHeight,
    })

    const link = document.createElement('a')
    link.download = `${regNum}-evready-pass.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-green-50 to-green-100">
      
      {/* ---------------- BANNER ---------------- */}
      <div className="relative w-full">
        <Image
          src="https://res.cloudinary.com/dymanaa1j/image/upload/v1771464283/Registration_Web_Banner_Image_cnctgq.jpg"
          alt="EVready 2026"
          width={1536}
          height={453}
          priority
          className="w-full h-auto object-cover"
        />
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="relative z-10 w-full flex justify-center">
          <Card className="w-full max-w-md shadow-xl border-green-200">
            <CardContent className="p-6 space-y-5">

              {!success ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                  {/* Header */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Car className="h-6 w-6 text-green-700" />
                      <h1 className="text-2xl font-bold text-green-800">
                        EVready 2026
                      </h1>
                    </div>

                    <p className="text-sm font-medium text-green-700">
                      Karnataka’s Largest EV Expo
                    </p>

                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Registration Form
                    </h2>
                  </div>

                  {/* Name */}
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <div className="grid gap-2">
                        <Label>Name *</Label>
                        <Input {...field} placeholder="Enter your full name" />
                        {errors.name && (
                          <p className="text-sm text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Email */}
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <div className="grid gap-2">
                        <Label>Email *</Label>
                        <Input type="email" {...field} placeholder="Enter email address" />
                      </div>
                    )}
                  />

                  {/* Mobile */}
                  <Controller
                    name="mobile"
                    control={control}
                    render={({ field }) => (
                      <div className="grid gap-2">
                        <Label>Mobile *</Label>
                        <Input
                          {...field}
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="Enter 10 digit mobile number"
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            field.onChange(value)
                          }}
                        />
                        {errors.mobile && (
                          <p className="text-sm text-red-500">
                            {errors.mobile.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Static Coupon Dropdown */}
                  <Controller
                    name="couponId"
                    control={control}
                    render={({ field }) => (
                      <div className="grid gap-2">
                        <Label>How did you hear about the EVREADY expo? *</Label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full p-3">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            {couponType.map((item) => (
                              <SelectItem
                                key={item.value}
                                value={item.value}
                              >
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {errors.couponId && (
                          <p className="text-sm text-red-500">
                            {errors.couponId.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Terms */}
                  <div className="flex gap-2">
                    <Checkbox
                      checked={agree}
                      onCheckedChange={(v) => setAgree(!!v)}
                    />
                    <Label className="text-sm">
                      I agree to{' '}
                      <Link
                        href="/term-and-condition"
                        className="text-green-700 underline"
                      >
                        Terms & Conditions
                      </Link>
                    </Label>
                  </div>

                  {termsError && (
                    <p className="text-sm text-red-500">{termsError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-700 hover:bg-green-800"
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Register Now
                  </Button>

                </form>
              ) : (
                /* SUCCESS SECTION (unchanged logic) */
                <div className="text-center py-10 px-6">
                  <div className="flex justify-center">
                    <div className="bg-green-100 rounded-full p-6">
                      <CheckCircle2 className="h-16 w-16 text-green-700" />
                    </div>
                  </div>

                  <h2 className="mt-6 text-3xl font-bold text-green-800">
                    Registration Successful 🎉
                  </h2>

                  <p className="mt-2 text-gray-600 text-sm">
                    Your free pass for <span className="font-semibold">EVready 2026</span> is confirmed.
                  </p>

                  {regNum && (
                    <div className="mt-4 inline-block bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                      Registration No: {regNum}
                    </div>
                  )}

                  {showQr && (
                    <div className="mt-8 space-y-5">
                      <div
                        id="evready-qr-card"
                        className="mx-auto w-[320px] rounded-2xl overflow-hidden shadow-lg border border-green-200 bg-white"
                      >
                        <div className="bg-green-700 text-white py-3">
                          <p className="text-sm font-semibold tracking-wide">
                            EVready 2026
                          </p>
                          <p className="text-xs text-green-100">
                            Karnataka’s Largest EV Expo
                          </p>
                        </div>

                        <div className="p-6 flex flex-col items-center space-y-4">
                          <QRCodeCanvas value={regNum ?? ''} size={170} />
                          <p className="text-xs text-gray-500">
                            Show this QR at the venue for entry
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={downloadQrCard}
                        className="w-full border-green-700 text-green-700 hover:bg-green-50"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Pass
                      </Button>
                    </div>
                  )}

                  <div className="my-8 border-t border-gray-200"></div>

                  <Button
                    onClick={handleNewRegistration}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-3 text-sm font-semibold"
                  >
                    New Registration
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} All Rights Reserved. Powered by SaaScraft Studio (India) Pvt. Ltd.
        </div>
      </footer>
    </div>
  )
}