'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Send,
  Mail,
  MessageCircle,
  X,
  Megaphone,
  Users as UsersIcon,
  Image as ImageIcon,
  Video,
  Layers as LayersIcon,
  FileText,
  Calendar,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import { loadGroups, type UserGroup } from '@/lib/groups';
import { INITIAL_USERS } from '@/lib/mock/utilisateurs';

export type CampaignPlatform = 'email' | 'whatsapp' | 'telegram';

export type CampaignTemplate = {
  id: string;
  name: string;
  channel: string;
  language: string;
};

export type CampaignDraft = {
  name: string;
  audienceLabel: string;
  audienceCount: number;
  platform: CampaignPlatform;
  templateId: string;
  templateName: string;
  mediaType: 'none' | 'image' | 'video' | 'carousel';
  sendAt: 'now' | 'later';
  scheduledIso?: string;
};

type Props = {
  open: boolean;
  templates: CampaignTemplate[];
  onClose: () => void;
  onSubmit: (draft: CampaignDraft) => void;
};

const PLATFORM_META: Record<
  CampaignPlatform,
  { Icon: typeof Mail; labelKey: string; color: string; accepts: ('image' | 'video' | 'carousel')[] }
> = {
  email: {
    Icon: Mail,
    labelKey: 'campaign.platform.email',
    color: 'bg-brand-blue',
    accepts: ['image'],
  },
  whatsapp: {
    Icon: MessageCircle,
    labelKey: 'campaign.platform.whatsapp',
    color: 'bg-green-500',
    accepts: ['image', 'video', 'carousel'],
  },
  telegram: {
    Icon: Send,
    labelKey: 'campaign.platform.telegram',
    color: 'bg-sky-500',
    accepts: ['image', 'video', 'carousel'],
  },
};

export function NewCampaignModal({ open, templates, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [audience, setAudience] = useState<string>('all');
  const [platform, setPlatform] = useState<CampaignPlatform>('email');
  const [templateId, setTemplateId] = useState<string>('');
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video' | 'carousel'>('none');
  const [mediaImage, setMediaImage] = useState<string | undefined>(undefined);
  const [mediaVideoUrl, setMediaVideoUrl] = useState('');
  const [carousel, setCarousel] = useState<string[]>([]);
  const [sendAt, setSendAt] = useState<'now' | 'later'>('now');
  const [scheduledIso, setScheduledIso] = useState('');
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setGroups(loadGroups());
    setName('');
    setAudience('all');
    setPlatform('email');
    setTemplateId('');
    setMediaType('none');
    setMediaImage(undefined);
    setMediaVideoUrl('');
    setCarousel([]);
    setSendAt('now');
    setScheduledIso('');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  const audienceOptions = useMemo(
    () => [
      { id: 'all', label: 'Tous les utilisateurs', count: INITIAL_USERS.length },
      {
        id: 'new',
        label: 'Nouveaux inscrits (30 j)',
        count: INITIAL_USERS.length,
      },
      ...groups.map((g) => ({ id: g.id, label: g.name, count: g.userIds.length })),
    ],
    [groups],
  );

  const selectedAudience = audienceOptions.find((a) => a.id === audience) ?? audienceOptions[0]!;

  const filteredTemplates = useMemo(
    () => templates.filter((t) => t.channel === platform || t.channel === 'banner'),
    [templates, platform],
  );

  const accepted = PLATFORM_META[platform].accepts;

  // Reset media when platform changes
  useEffect(() => {
    setMediaType('none');
    setMediaImage(undefined);
    setMediaVideoUrl('');
    setCarousel([]);
    setTemplateId('');
  }, [platform]);

  const resizeToDataUrl = (file: File, size = 1024): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read-fail'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('img-fail'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(size / img.width, size / img.height, 1);
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('no-ctx'));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeToDataUrl(file, 1024);
      setMediaImage(dataUrl);
    } catch {
      // ignore
    } finally {
      if (imageRef.current) imageRef.current.value = '';
    }
  };

  const onPickCarousel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const dataUrls: string[] = [];
    for (const f of files) {
      try {
        dataUrls.push(await resizeToDataUrl(f, 800));
      } catch {
        // ignore
      }
    }
    setCarousel((prev) => [...prev, ...dataUrls].slice(0, 5));
    if (carouselRef.current) carouselRef.current.value = '';
  };

  const canSubmit =
    name.trim().length >= 3 &&
    templateId.length > 0 &&
    (sendAt === 'now' || (sendAt === 'later' && scheduledIso.length > 0));

  const submit = () => {
    if (!canSubmit) return;
    const selectedTemplate = filteredTemplates.find((t) => t.id === templateId);
    onSubmit({
      name: name.trim(),
      audienceLabel: selectedAudience.label,
      audienceCount: selectedAudience.count,
      platform,
      templateId,
      templateName: selectedTemplate?.name ?? '',
      mediaType,
      sendAt,
      scheduledIso: sendAt === 'later' ? scheduledIso : undefined,
    });
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-campaign-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-glow-navy overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" aria-hidden />
            <h2 id="new-campaign-title" className="text-lg font-bold">
              Nouvelle campagne
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              1. Nom de la campagne
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Alerte fraude WhatsApp — mai 2026"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              <UsersIcon className="inline h-3 w-3 mr-1" aria-hidden />
              2. Audience — groupe d&apos;utilisateurs
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {audienceOptions.map((opt) => {
                const on = audience === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAudience(opt.id)}
                    aria-pressed={on}
                    className={
                      on
                        ? 'flex items-center justify-between gap-2 rounded-xl border-2 border-brand-blue bg-brand-sky/30 px-3 py-2 text-sm text-brand-navy text-left'
                        : 'flex items-center justify-between gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy text-left hover:border-gray-300'
                    }
                  >
                    <span className="font-semibold truncate">{opt.label}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{opt.count}</span>
                  </button>
                );
              })}
            </div>
            {groups.length === 0 && (
              <p className="mt-2 text-[11px] text-gray-500">
                💡 Créez des groupes sur la page <b>Utilisateurs</b> pour cibler des audiences
                plus précises.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              3. Plateforme d&apos;envoi
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(['email', 'whatsapp', 'telegram'] as CampaignPlatform[]).map((id) => {
                const meta = PLATFORM_META[id];
                const on = platform === id;
                const label = id === 'email' ? 'Email' : id === 'whatsapp' ? 'WhatsApp' : 'Telegram';
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPlatform(id)}
                    aria-pressed={on}
                    className={
                      on
                        ? 'flex items-center gap-2 rounded-xl border-2 border-brand-blue bg-white p-3 shadow-glow-blue'
                        : 'flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white p-3 hover:border-gray-300'
                    }
                  >
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white ${meta.color}`}
                    >
                      <meta.Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-brand-navy">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              <FileText className="inline h-3 w-3 mr-1" aria-hidden />
              4. Modèle à utiliser ({filteredTemplates.length} disponible
              {filteredTemplates.length > 1 ? 's' : ''})
            </label>
            {filteredTemplates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center text-xs text-gray-500">
                Aucun modèle pour cette plateforme.{' '}
                <span className="text-brand-blue">
                  Créez-en un dans l&apos;onglet <b>Templates</b>.
                </span>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredTemplates.map((t) => {
                  const on = templateId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      aria-pressed={on}
                      className={
                        on
                          ? 'rounded-xl border-2 border-brand-blue bg-brand-sky/30 p-3 text-left'
                          : 'rounded-xl border-2 border-gray-200 bg-white p-3 text-left hover:border-gray-300'
                      }
                    >
                      <p className="text-sm font-semibold text-brand-navy">{t.name}</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {t.language} · {t.channel}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              5. Média (optionnel)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMediaType('none')}
                className={
                  mediaType === 'none'
                    ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold'
                    : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-xs font-medium hover:border-brand-blue'
                }
              >
                Aucun
              </button>
              {accepted.includes('image') && (
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={
                    mediaType === 'image'
                      ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold'
                      : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-xs font-medium hover:border-brand-blue'
                  }
                >
                  <ImageIcon className="h-3 w-3" aria-hidden />
                  Image
                </button>
              )}
              {accepted.includes('video') && (
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={
                    mediaType === 'video'
                      ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold'
                      : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-xs font-medium hover:border-brand-blue'
                  }
                >
                  <Video className="h-3 w-3" aria-hidden />
                  Vidéo
                </button>
              )}
              {accepted.includes('carousel') && (
                <button
                  type="button"
                  onClick={() => setMediaType('carousel')}
                  className={
                    mediaType === 'carousel'
                      ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold'
                      : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-xs font-medium hover:border-brand-blue'
                  }
                >
                  <LayersIcon className="h-3 w-3" aria-hidden />
                  Carrousel
                </button>
              )}
            </div>

            {mediaType === 'image' && (
              <div className="flex items-start gap-3">
                {mediaImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={mediaImage}
                    alt=""
                    className="h-28 w-48 object-cover rounded-xl border border-gray-200"
                  />
                ) : (
                  <div className="h-28 w-48 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-300">
                    <ImageIcon className="h-6 w-6" aria-hidden />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => imageRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-3 py-1.5 text-xs font-semibold hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    {mediaImage ? 'Changer' : 'Ajouter une image'}
                  </button>
                  {mediaImage && (
                    <button
                      type="button"
                      onClick={() => setMediaImage(undefined)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden />
                      Retirer
                    </button>
                  )}
                  <p className="text-[10px] text-gray-400">
                    Redimensionnée à 1024 px max — JPEG optimisé
                  </p>
                </div>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                />
              </div>
            )}

            {mediaType === 'video' && (
              <div>
                <input
                  type="url"
                  value={mediaVideoUrl}
                  onChange={(e) => setMediaVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou URL .mp4"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  {platform === 'whatsapp'
                    ? 'WhatsApp : vidéo MP4 max 16 Mo, durée ≤ 3 min'
                    : platform === 'telegram'
                      ? 'Telegram : vidéo MP4 max 50 Mo, durée ≤ 10 min'
                      : 'Collez un lien YouTube ou une URL directe .mp4'}
                </p>
              </div>
            )}

            {mediaType === 'carousel' && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {carousel.map((src, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="h-24 w-24 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setCarousel((prev) => prev.filter((_, j) => j !== i))}
                        aria-label="Retirer"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-700"
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                  ))}
                  {carousel.length < 5 && (
                    <button
                      type="button"
                      onClick={() => carouselRef.current?.click()}
                      className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400 hover:border-brand-blue hover:text-brand-blue"
                    >
                      <Plus className="h-5 w-5" aria-hidden />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  {carousel.length}/5 images · {platform === 'whatsapp' ? 'WhatsApp carousel' : 'Telegram album'}
                </p>
                <input
                  ref={carouselRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onPickCarousel}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              6. Planification
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSendAt('now')}
                className={
                  sendAt === 'now'
                    ? 'inline-flex items-center gap-1.5 rounded-pill bg-green-500 text-white px-4 py-1.5 text-xs font-semibold shadow-glow-green'
                    : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-4 py-1.5 text-xs font-medium hover:border-brand-blue'
                }
              >
                <Send className="h-3 w-3" aria-hidden />
                Envoyer maintenant
              </button>
              <button
                type="button"
                onClick={() => setSendAt('later')}
                className={
                  sendAt === 'later'
                    ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold shadow-glow-navy'
                    : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-4 py-1.5 text-xs font-medium hover:border-brand-blue'
                }
              >
                <Calendar className="h-3 w-3" aria-hidden />
                Planifier
              </button>
            </div>
            {sendAt === 'later' && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" aria-hidden />
                <input
                  type="datetime-local"
                  value={scheduledIso}
                  onChange={(e) => setScheduledIso(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-gray-500">
            Mode démo : l&apos;envoi est simulé, aucun message réel n&apos;est transmis.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" aria-hidden />
              {sendAt === 'now' ? 'Envoyer maintenant' : 'Planifier l’envoi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
