import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useLibrary } from '@/lib/library';
import { useToast } from '@/lib/toast';

export function useUpload() {
  const { addFiles } = useLibrary();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    const { added, skipped } = await addFiles(files);
    setBusy(false);
    if (added) toast(added === 1 ? 'שיר אחד נוסף לספרייה' : `${added} שירים נוספו לספרייה`);
    if (skipped) toast(`${skipped} קבצים לא נתמכים דולגו`);
  };
  return { upload, busy };
}

export default function UploadButton({ className = '' }) {
  const input = useRef(null);
  const { upload, busy } = useUpload();
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:scale-[1.03] disabled:opacity-60 ${className}`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        הוספת שירים מהמכשיר
      </button>
      <input
        ref={input}
        type="file"
        accept="audio/*"
        multiple
        hidden
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );
}
