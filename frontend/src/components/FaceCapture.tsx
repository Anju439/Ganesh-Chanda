import { useEffect, useRef, useState, type ChangeEvent } from 'react'

type Props = {
  onCapture: (dataUrl: string) => void
  photo: string | null
}

export default function FaceCapture({ onCapture, photo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('This browser cannot open a camera. Upload a face photo instead.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setCameraReady(true)
      } catch {
        setCameraError('Camera permission was denied. Upload a clear face photo of the person signing in.')
      }
    }
    void start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function capture() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    onCapture(canvas.toDataURL('image/jpeg', 0.85))
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setCameraError('Choose a JPEG or PNG photo of the staff member.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result)
        setCameraError(null)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-[#edd8b8] bg-black">
        {photo ? (
          <img src={photo} alt="Captured staff face" className="aspect-video w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            muted
            playsInline
            className="aspect-video w-full object-cover"
            aria-label="Live camera for staff face capture"
          />
        )}
      </div>
      {cameraError && <p className="text-sm text-[#9a3b1a]">{cameraError}</p>}
      <div className="flex flex-wrap gap-2">
        {photo ? (
          <button
            type="button"
            onClick={() => onCapture('')}
            className="rounded-full border border-[#edd8b8] px-4 py-2 text-sm font-semibold text-[#6b1d12]"
          >
            Retake
          </button>
        ) : (
          <button
            type="button"
            disabled={!cameraReady}
            onClick={capture}
            className="rounded-full bg-[#6b1d12] px-4 py-2 text-sm font-semibold text-[#fff8ea] disabled:opacity-50"
          >
            Capture face
          </button>
        )}
        <label className="rounded-full border border-[#edd8b8] px-4 py-2 text-sm font-semibold text-[#6b1d12]">
          Upload photo
          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={onFile} />
        </label>
      </div>
    </div>
  )
}
