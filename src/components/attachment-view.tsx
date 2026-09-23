"use client"

/** Renders an uploaded attachment data-URL by type: image, video, or PDF/file link. */
export function AttachmentView({ src, compact }: { src: string; compact?: boolean }) {
  if (src.startsWith("data:image/")) {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Attachment"
          className={
            compact
              ? "h-16 w-16 rounded-lg object-cover border border-border"
              : "mt-2 max-h-48 rounded-lg border border-border/30 object-cover"
          }
        />
      </a>
    )
  }
  if (src.startsWith("data:video/")) {
    return (
      <video
        src={src}
        controls
        preload="metadata"
        className={compact ? "h-16 w-24 rounded-lg border border-border" : "mt-2 max-h-64 w-full rounded-lg border border-border/30"}
      />
    )
  }
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1 text-xs text-brand-teal font-medium hover:underline"
    >
      📄 View attached PDF
    </a>
  )
}

/** True for the attachment types we accept as evidence (image, video, PDF). */
export function isAllowedAttachment(src: string): boolean {
  return (
    src.startsWith("data:image/") ||
    src.startsWith("data:video/") ||
    src.startsWith("data:application/pdf")
  )
}
