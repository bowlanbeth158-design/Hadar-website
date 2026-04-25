'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';

type Props = {
  initials: string;
  className?: string;
};

/**
 * Round avatar that shows initials by default and lets the user upload a
 * profile photo. The uploaded file stays in-memory (object URL) — actual
 * upload to the server is wired later.
 */
export function AvatarUpload({ initials, className = '' }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Changer la photo de profil"
        className="block h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden bg-gradient-to-br from-brand-navy via-brand-blue to-brand-sky text-white text-2xl md:text-3xl font-bold shadow-glow-navy ring-4 ring-white transition-transform duration-200 hover:scale-[1.03]"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Photo de profil" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">{initials}</span>
        )}
      </button>

      {/* Camera overlay (always visible, more prominent on hover) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:scale-110 transition-all duration-200"
      >
        <Camera className="h-4 w-4 text-brand-navy group-hover:text-white" aria-hidden />
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
