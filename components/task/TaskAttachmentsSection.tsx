'use client'

import { useRef, useState } from 'react'
import { TaskAttachment } from '@/hooks/useTaskCollaboration'
import {
  Paperclip,
  Upload,
  FileText,
  ExternalLink,
  Trash2,
} from 'lucide-react'

interface TaskAttachmentsSectionProps {
  attachments: TaskAttachment[]
  onUpload: (file: File) => Promise<string | null>
  onDelete: (att: TaskAttachment) => Promise<void>
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function TaskAttachmentsSection({
  attachments,
  onUpload,
  onDelete,
}: TaskAttachmentsSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploading(true)
    const err = await onUpload(file)
    if (err) setUploadError(err)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(false)
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Paperclip className="w-3.5 h-3.5 text-blue-600" />
          <span>Lampiran ({attachments.length})</span>
        </span>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer disabled:opacity-50"
        >
          <Upload className="w-3 h-3" />
          <span>{uploading ? 'Mengunggah...' : 'Unggah File'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadError && (
        <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
      )}

      {attachments.length > 0 && (
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {attachments.map((att) => {
            const isImage = att.file_type.startsWith('image/')
            return (
              <div
                key={att.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isImage ? (
                    <img
                      src={att.file_url}
                      alt={att.file_name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {att.file_name}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {formatFileSize(att.file_size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka berkas"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(att)}
                    title="Hapus lampiran"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
