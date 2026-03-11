import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_SIZE_MB = 10
const ACCEPTED_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/csv': ['.csv'],
  'text/plain': ['.csv']
}

export default function UploadDropzone({ onUpload, isUploading, uploadProgress }) {
  const [selectedFiles, setSelectedFiles] = useState([])

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(e => console.warn(`Rejected ${file.name}: ${e.message}`))
      })
    }
    if (acceptedFiles.length > 0) {
      setSelectedFiles(acceptedFiles)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 5,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    disabled: isUploading
  })

  const removeFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles)
      setSelectedFiles([])
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <motion.div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragReject
            ? 'border-rose-500 bg-rose-500/5'
            : isDragActive
            ? 'border-indigo-400 bg-indigo-500/10 glow-border'
            : selectedFiles.length > 0
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-border bg-surface/30 hover:border-indigo-500/50 hover:bg-indigo-500/5'
        }`}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
      >
        <input {...getInputProps()} />

        {/* Background glow when dragging */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-500/5 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-4xl">⏫</div>
              <p className="text-bright font-semibold">Uploading files...</p>
              <div className="w-full max-w-xs mx-auto">
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full progress-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-muted text-sm mt-2">{uploadProgress}%</p>
              </div>
            </motion.div>
          ) : isDragActive ? (
            <motion.div
              key="drag"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-5xl mb-3"
              >
                📂
              </motion.div>
              <p className="text-indigo-400 font-display font-bold text-lg">Drop it like it's hot</p>
              <p className="text-subtle text-sm">Release to upload your files</p>
            </motion.div>
          ) : isDragReject ? (
            <motion.div key="reject" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-5xl mb-3">❌</div>
              <p className="text-rose-400 font-semibold">Invalid file type</p>
              <p className="text-subtle text-sm">Only CSV and XLSX files accepted</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-5xl mb-4"
              >
                {selectedFiles.length > 0 ? '✅' : '📊'}
              </motion.div>
              {selectedFiles.length > 0 ? (
                <div>
                  <p className="text-emerald-400 font-display font-bold text-lg mb-1">
                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready
                  </p>
                  <p className="text-subtle text-sm">Click upload or drop more files</p>
                </div>
              ) : (
                <div>
                  <p className="text-bright font-display font-bold text-lg mb-1">
                    Drag & drop your sales files
                  </p>
                  <p className="text-subtle text-sm">
                    CSV or XLSX · Up to 5 files · Max {MAX_SIZE_MB}MB each
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border border-indigo-500/30 text-indigo-400 text-sm">
                    <span>Browse Files</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* File list */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-subtle text-sm font-medium">Selected Files</span>
              <span className="text-muted text-xs">{selectedFiles.length}/5</span>
            </div>
            <div className="divide-y divide-border/50">
              {selectedFiles.map((file, idx) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {file.name.endsWith('.csv') ? '📋' : '📗'}
                    </span>
                    <div>
                      <p className="text-text text-sm font-medium truncate max-w-xs">{file.name}</p>
                      <p className="text-muted text-xs">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
                    className="text-muted hover:text-rose-400 transition-colors p-1 rounded"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <motion.button
                onClick={handleUpload}
                className="btn-primary w-full"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isUploading}
              >
                🚀 Upload & Analyze with AI
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
