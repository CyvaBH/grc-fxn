"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2, ImagePlus, CheckCircle2 } from "lucide-react"
import { fileToImageDataUrl } from "@/lib/profile-store"
import type { ReadinessAction } from "@/lib/readiness"

/**
 * Evidence gate: an action can only be marked complete with a written
 * description of what was done, plus an optional photo/screenshot.
 */
export function EvidenceModal({
  action,
  existing,
  onClose,
  onSaved,
}: {
  action: ReadinessAction
  existing?: { evidence: string; attachment: string | null } | null
  onClose: () => void
  onSaved: () => void
}) {
  const [text, setText] = useState(existing?.evidence || "")
  const [attachment, setAttachment] = useState<string | null>(existing?.attachment || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    try {
      setAttachment(await fileToImageDataUrl(file, 1024))
    } catch {
      setError("Could not read that image. Try a JPG or PNG.")
    }
  }

  const handleSave = async () => {
    if (text.trim().length < 10) {
      setError("Describe what you did in at least a sentence — evidence needs specifics (dates, names, counts).")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: action.id, title: action.title, evidence: text.trim(), attachment }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Could not save evidence")
      onSaved()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-brand-navy/50 p-0 sm:p-6">
      <div className="bg-white w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-brand-navy text-sm">Complete with evidence</h2>
            <p className="text-xs text-gray-500">{action.title} (+{action.points} pts)</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-brand-mist rounded-lg p-3 text-xs text-brand-navy leading-relaxed">
            <strong>How to do it:</strong> {action.howTo}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-text">Your evidence</Label>
            <Textarea
              id="ev-text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={action.evidencePrompt}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Photo / screenshot (optional)</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={pickFile}
            />
            {attachment ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachment} alt="Evidence" className="h-16 w-16 rounded-lg object-cover border border-border" />
                <button onClick={() => setAttachment(null)} className="text-xs text-gray-500 hover:text-status-critTx">
                  Remove
                </button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Attach image
              </Button>
            )}
          </div>
          {error && <p className="text-xs text-status-critTx">{error}</p>}
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            {saving ? "Saving…" : "Submit evidence"}
          </Button>
        </div>
      </div>
    </div>
  )
}
