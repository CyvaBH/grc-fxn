"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, CheckCircle2, XCircle, Upload, ArrowRight } from "lucide-react"
import { analyzePolicy } from "@/lib/policy-checks"
import { cn } from "@/lib/utils"

const MAX_CHARS = 60000

/** Reads a pasted or uploaded policy and reports exactly which required points are missing. */
export function PolicyChecker({
  templateId,
  templateName,
  orgLine,
  evidenceAction,
  onUseAsEvidence,
  onClose,
}: {
  templateId: string
  templateName: string
  orgLine: string
  evidenceAction?: { id: string; title: string } | null
  onUseAsEvidence?: (actionId: string, summary: string) => void
  onClose: () => void
}) {
  const [text, setText] = useState("")
  const [results, setResults] = useState<ReturnType<typeof analyzePolicy> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/\.(txt|md|markdown)$/i.test(file.name)) {
      alert("Upload a .txt or .md file — or paste the text. PDFs: copy the text out first.")
      return
    }
    const content = await file.text()
    setText(content.slice(0, MAX_CHARS))
    setResults(null)
  }

  const runCheck = () => {
    if (text.trim().length < 200) {
      alert("Paste at least a few paragraphs of the policy for a meaningful check.")
      return
    }
    setResults(analyzePolicy(templateId, text))
  }

  const covered = results?.filter((r) => r.found).length || 0
  const total = results?.length || 0
  const pct = total > 0 ? Math.round((covered / total) * 100) : 0

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-brand-navy/50 p-0 sm:p-6">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-brand-navy text-sm">Policy health-check: {templateName}</h2>
            <p className="text-xs text-gray-500">Checked against {orgLine}. Preliminary screen — not a legal review.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="flex-shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {!results ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="pc-text">Paste the policy text</Label>
                <Textarea
                  id="pc-text"
                  rows={10}
                  value={text}
                  onChange={(e) => { setText(e.target.value.slice(0, MAX_CHARS)); setResults(null) }}
                  placeholder="Paste the full policy here…"
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input ref={fileRef} type="file" accept=".txt,.md,.markdown" className="hidden" onChange={pickFile} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload .txt / .md
                </Button>
                <Button size="sm" onClick={runCheck} disabled={text.trim().length < 200}>
                  Check my policy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between bg-brand-mist rounded-lg p-3">
                <p className="text-sm font-semibold text-brand-navy">
                  Coverage: {covered}/{total} required points ({pct}%)
                </p>
                <Button variant="ghost" size="sm" onClick={() => setResults(null)}>
                  Check another version
                </Button>
              </div>
              <div className="space-y-2">
                {results.filter((r) => !r.found).length > 0 && (
                  <>
                    <p className="text-xs font-bold text-status-critTx uppercase tracking-wide">
                      Missing — fix these
                    </p>
                    {results.filter((r) => !r.found).map((r) => (
                      <div key={r.label} className="flex gap-2 p-3 rounded-lg bg-status-critBg/60">
                        <XCircle className="h-4 w-4 text-status-critTx flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-brand-navy">{r.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{r.why}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {results.filter((r) => r.found).length > 0 && (
                  <>
                    <p className="text-xs font-bold text-brand-teal uppercase tracking-wide mt-3">
                      Covered
                    </p>
                    {results.filter((r) => r.found).map((r) => (
                      <div key={r.label} className={cn("flex gap-2 p-2 rounded-lg")}>
                        <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600">{r.label}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {evidenceAction && pct >= 70 && onUseAsEvidence && (
                <Button
                  className="w-full"
                  onClick={() =>
                    onUseAsEvidence(
                      evidenceAction.id,
                      `Policy health-check: ${covered}/${total} required points covered for ${templateName}. Missing: ${results.filter((r) => !r.found).map((r) => r.label).join("; ") || "none"}.`
                    )
                  }
                >
                  Submit this check as evidence for “{evidenceAction.title}”
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {evidenceAction && pct < 70 && (
                <p className="text-xs text-gray-500">
                  Reach 70% coverage to submit this check as evidence — fix the missing points above, then re-check.
                </p>
              )}
              {!evidenceAction && (
                <p className="text-xs text-gray-500">
                  This policy doesn&apos;t map to a scored action, but fixing the gaps above still strengthens audits.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
