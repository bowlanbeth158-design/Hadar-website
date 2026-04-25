'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';

type Props = {
  initials: string;
  className?: string;
};

const KEY = 'hadar:profile-photo';

/**
 * Round avatar that shows initials by default and lets the user upload a
 * profile photo. The uploaded file URL is persisted to localStorage so the
 * preview survives a refresh. The camera badge is only visible until the
 * first upload — afterwards the user can still change the photo by clicking
 * the avatar itself.
 */
export function AvatarUpload({ initials, className = '' }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) setPreviewUrl(raw);
  }, []);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For the demo, store as a data URL so it survives a refresh.
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      try {
        localStorage.setItem(KEY, dataUrl);
      } catch {
        // ignore quota errors silently in demo mode
      }
    };
    reader.readAsDataURL(file);
  };

  const hasPhoto = !!previewUrl;

  return (
    <div className={`relative group ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={hasPhoto ? 'Changer la photo de profil' : 'Ajouter une photo de profil'}
        className="block h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden bg-gradient-to-br from-brand-navy via-brand-blue to-brand-sky text-white text-2xl md:text-3xl font-bold shadow-glow-navy ring-4 ring-white transition-transform duration-200 hover:scale-[1.03]"
      >
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl!} alt="Photo de profil" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">{initials}</span>
        )}
      </button>

      {/* Camera badge — only visible until the first upload, to avoid
          clutter once a photo is in place. The avatar itself stays
          clickable so the user can still change the photo. */}
      {!hasPhoto && (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:scale-110 transition-all duration-200"
        >
          <Camera className="h-4 w-4 text-brand-navy group-hover:text-white" aria-hidden />
        </span>
      )}

      {/* On hover (when a photo exists), reveal a subtle "Changer" hint */}
      {hasPhoto && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full flex items-center justify-center bg-brand-navy/0 group-hover:bg-brand-navy/40 transition-colors duration-200"
        >
          <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </span>
      )}

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
