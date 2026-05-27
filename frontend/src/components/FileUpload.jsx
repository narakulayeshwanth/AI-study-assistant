import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadDocument } from '../services/documentService';
import toast from 'react-hot-toast';

export default function FileUpload({ onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setTitle(accepted[0].name.replace(/\.[^/.]+$/, ''));
      setStatus(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (r) => toast.error(r[0]?.errors[0]?.message || 'File rejected'),
  });

  const handleUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title || file.name);

    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadDocument(fd, setProgress);
      setStatus('success');
      toast.success('Document uploaded and processed! 🎉');
      onSuccess?.(res.data.document);
      setTimeout(() => { setFile(null); setTitle(''); setStatus(null); setProgress(0); }, 2000);
    } catch (err) {
      setStatus('error');
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const fileIcon = file?.name.endsWith('.pdf') ? '📄'
    : file?.name.endsWith('.docx') ? '📝'
    : file?.name.endsWith('.pptx') ? '📊'
    : '📃';
  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 group
                ${isDragActive
                  ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
                  : 'border-white/20 hover:border-primary-500/50 hover:bg-primary-500/5'}`}>
              <input {...getInputProps()} />
              <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary-400" />
              </motion.div>
              <p className="text-white font-semibold text-lg mb-1">
                {isDragActive ? 'Drop it here!' : 'Drop your file here'}
              </p>
              <p className="text-slate-500 text-sm mb-4">or click to browse</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {['PDF', 'DOCX', 'TXT', 'PPTX'].map(t => (
                  <span key={t} className="badge-primary text-xs">{t}</span>
                ))}
                <span className="text-slate-500 text-xs flex items-center">Max 10MB</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="file" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-5 space-y-4 transition-all
              ${status === 'success' ? 'border-emerald-500/40 bg-emerald-500/10' :
                status === 'error' ? 'border-red-500/40 bg-red-500/10' :
                'border-white/10 bg-white/5'}`}>
            {/* File info */}
            <div className="flex items-center gap-4">
              <span className="text-4xl">{fileIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-slate-500 text-sm">{fileSizeMB} MB</p>
              </div>
              {!uploading && !status && (
                <button onClick={() => setFile(null)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
              {status === 'success' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
              {status === 'error' && <AlertCircle className="w-6 h-6 text-red-400" />}
            </div>

            {/* Title input */}
            {!status && (
              <div>
                <label className="label">Document Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter document title..."
                  className="input-field text-sm"
                  disabled={uploading}
                />
              </div>
            )}

            {/* Progress */}
            {uploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Uploading & processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
              </div>
            )}

            {/* Upload button */}
            {!status && !uploading && (
              <button onClick={handleUpload} className="btn-primary w-full flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> Upload Document
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
