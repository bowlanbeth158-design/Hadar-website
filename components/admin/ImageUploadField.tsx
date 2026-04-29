'use client';

import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

type Fit = 'contain' | 'cover';

type Props = {
  label: string;
  hint?: string;
  width: number;
  height: number;
  fit?: Fit;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  onError?: (msg: string) => void;
  /** How the preview is sized — 'thumb' (small) or 'banner' (wide) */
  previewShape?: 'square' | 'landscape';
};

export function ImageUploadField({
  label,
  hint,
  width,
  height,
  fit = 'contain',
  value,
  onChange,
  onError,
  previewShape = 'square',
}: Props) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const resize = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read-fail'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('img-fail'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('no-ctx'));

          if (fit === 'cover') {
            const srcRatio = img.width / img.height;
            const dstRatio = width / height;
            let sx = 0;
            let sy = 0;
            let sw = img.width;
            let sh = img.height;
            if (srcRatio > dstRatio) {
              sw = img.height * dstRatio;
              sx = (img.width - sw) / 2;
            } else {
              sh = img.width / dstRatio;
              sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
          } else {
            // contain: fit fully, letterbox transparent
            const ratio = Math.min(width / img.width, height / img.height);
            const dw = Math.round(img.width * ratio);
            const dh = Math.round(img.height * ratio);
            const dx = Math.round((width - dw) / 2);
            const dy = Math.round((height - dh) / 2);
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
          }
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handlePick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError?.(t('brand.image.errType'));
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    try {
      setUploading(true);
      const dataUrl = await resize(file);
      onChange(dataUrl);
    } catch {
      onError?.(t('brand.image.errGeneric'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const previewClass =
    previewShape === 'landscape'
      ? 'h-20 w-48'
      : Math.abs(width - height) > 8
        ? 'h-20 w-32'
        : 'h-20 w-20';

  return (
    <div>
      <label className="block text-[11px] font-semibold text-brand-navy mb-1.5">{label}</label>
      <div className="flex items-start gap-3 flex-wrap">
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={value}
            alt=""
            className={`${previewClass} object-contain bg-gray-50 rounded-xl border border-gray-200`}
          />
        ) : (
          <div
            className={`${previewClass} rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-300`}
          >
            <ImageIcon className="h-5 w-5" aria-hidden />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-3 py-1.5 text-xs font-semibold hover:bg-brand-navy hover:text-white disabled:opacity-60 disabled:cursor-wait transition-colors"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden />
            {uploading
              ? t('brand.image.uploading')
              : value
                ? t('brand.image.change')
                : t('brand.image.upload')}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
            >
              <Trash2 className="h-3 w-3" aria-hidden />
              {t('brand.image.remove')}
            </button>
          )}
          <p className="text-[10px] text-gray-400">
            {width} × {height} px
          </p>
          {hint && <p className="text-[10px] text-gray-500">{hint}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
