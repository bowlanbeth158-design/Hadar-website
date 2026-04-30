'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';

export type Country = {
  iso: string;
  name: string;
  dial: string; // including the leading "+"
  flag: string;
  // National significant number length (digits typed AFTER the dial
  // code). Used by the calling input to cap maxLength so users can't
  // type endless digits. For countries with variable length, we use
  // the higher value so we don't reject valid numbers.
  digits: number;
};

// Comprehensive country list — Morocco first (primary audience),
// then the largest Moroccan diaspora hubs (FR, ES, BE, NL, IT, DE,
// GB, US, CA, CH, PT), full Africa, full Middle East / Gulf, full
// Europe, major Asia, Latin America and Oceania. Search input
// scales the list by name / ISO / dial code so 100+ entries stay
// usable.
const COUNTRIES: Country[] = [
  // Top picks for Hadar
  { iso: 'MA', name: 'Maroc',                dial: '+212', flag: '🇲🇦', digits: 9 },
  { iso: 'FR', name: 'France',               dial: '+33',  flag: '🇫🇷', digits: 9 },
  { iso: 'ES', name: 'Espagne',              dial: '+34',  flag: '🇪🇸', digits: 9 },
  { iso: 'BE', name: 'Belgique',             dial: '+32',  flag: '🇧🇪', digits: 9 },
  { iso: 'NL', name: 'Pays-Bas',             dial: '+31',  flag: '🇳🇱', digits: 9 },
  { iso: 'IT', name: 'Italie',               dial: '+39',  flag: '🇮🇹', digits: 10 },
  { iso: 'DE', name: 'Allemagne',            dial: '+49',  flag: '🇩🇪', digits: 11 },
  { iso: 'GB', name: 'Royaume-Uni',          dial: '+44',  flag: '🇬🇧', digits: 10 },
  { iso: 'US', name: 'États-Unis',           dial: '+1',   flag: '🇺🇸', digits: 10 },
  { iso: 'CA', name: 'Canada',               dial: '+1',   flag: '🇨🇦', digits: 10 },
  { iso: 'CH', name: 'Suisse',               dial: '+41',  flag: '🇨🇭', digits: 9 },
  { iso: 'PT', name: 'Portugal',             dial: '+351', flag: '🇵🇹', digits: 9 },

  // Maghreb
  { iso: 'DZ', name: 'Algérie',              dial: '+213', flag: '🇩🇿', digits: 9 },
  { iso: 'TN', name: 'Tunisie',              dial: '+216', flag: '🇹🇳', digits: 8 },
  { iso: 'LY', name: 'Libye',                dial: '+218', flag: '🇱🇾', digits: 9 },
  { iso: 'MR', name: 'Mauritanie',           dial: '+222', flag: '🇲🇷', digits: 8 },

  // West Africa
  { iso: 'SN', name: 'Sénégal',              dial: '+221', flag: '🇸🇳', digits: 9 },
  { iso: 'CI', name: "Côte d'Ivoire",        dial: '+225', flag: '🇨🇮', digits: 10 },
  { iso: 'ML', name: 'Mali',                 dial: '+223', flag: '🇲🇱', digits: 8 },
  { iso: 'BF', name: 'Burkina Faso',         dial: '+226', flag: '🇧🇫', digits: 8 },
  { iso: 'NE', name: 'Niger',                dial: '+227', flag: '🇳🇪', digits: 8 },
  { iso: 'GN', name: 'Guinée',               dial: '+224', flag: '🇬🇳', digits: 9 },
  { iso: 'BJ', name: 'Bénin',                dial: '+229', flag: '🇧🇯', digits: 8 },
  { iso: 'TG', name: 'Togo',                 dial: '+228', flag: '🇹🇬', digits: 8 },
  { iso: 'GH', name: 'Ghana',                dial: '+233', flag: '🇬🇭', digits: 9 },
  { iso: 'NG', name: 'Nigéria',              dial: '+234', flag: '🇳🇬', digits: 10 },
  { iso: 'CM', name: 'Cameroun',             dial: '+237', flag: '🇨🇲', digits: 9 },
  { iso: 'GA', name: 'Gabon',                dial: '+241', flag: '🇬🇦', digits: 8 },
  { iso: 'CG', name: 'Congo',                dial: '+242', flag: '🇨🇬', digits: 9 },
  { iso: 'CD', name: 'République dém. du Congo', dial: '+243', flag: '🇨🇩', digits: 9 },
  { iso: 'TD', name: 'Tchad',                dial: '+235', flag: '🇹🇩', digits: 8 },
  { iso: 'CF', name: 'Centrafrique',         dial: '+236', flag: '🇨🇫', digits: 8 },
  { iso: 'GQ', name: 'Guinée équatoriale',   dial: '+240', flag: '🇬🇶', digits: 9 },
  { iso: 'AO', name: 'Angola',               dial: '+244', flag: '🇦🇴', digits: 9 },
  { iso: 'GW', name: 'Guinée-Bissau',        dial: '+245', flag: '🇬🇼', digits: 7 },
  { iso: 'CV', name: 'Cap-Vert',             dial: '+238', flag: '🇨🇻', digits: 7 },
  { iso: 'GM', name: 'Gambie',               dial: '+220', flag: '🇬🇲', digits: 7 },
  { iso: 'SL', name: 'Sierra Leone',         dial: '+232', flag: '🇸🇱', digits: 8 },
  { iso: 'LR', name: 'Liberia',              dial: '+231', flag: '🇱🇷', digits: 8 },

  // East Africa
  { iso: 'EG', name: 'Égypte',               dial: '+20',  flag: '🇪🇬', digits: 10 },
  { iso: 'SD', name: 'Soudan',               dial: '+249', flag: '🇸🇩', digits: 9 },
  { iso: 'ET', name: 'Éthiopie',             dial: '+251', flag: '🇪🇹', digits: 9 },
  { iso: 'KE', name: 'Kenya',                dial: '+254', flag: '🇰🇪', digits: 9 },
  { iso: 'TZ', name: 'Tanzanie',             dial: '+255', flag: '🇹🇿', digits: 9 },
  { iso: 'UG', name: 'Ouganda',              dial: '+256', flag: '🇺🇬', digits: 9 },
  { iso: 'RW', name: 'Rwanda',               dial: '+250', flag: '🇷🇼', digits: 9 },
  { iso: 'BI', name: 'Burundi',              dial: '+257', flag: '🇧🇮', digits: 8 },
  { iso: 'SO', name: 'Somalie',              dial: '+252', flag: '🇸🇴', digits: 8 },
  { iso: 'DJ', name: 'Djibouti',             dial: '+253', flag: '🇩🇯', digits: 8 },
  { iso: 'MG', name: 'Madagascar',           dial: '+261', flag: '🇲🇬', digits: 9 },

  // Southern Africa
  { iso: 'ZA', name: 'Afrique du Sud',       dial: '+27',  flag: '🇿🇦', digits: 9 },
  { iso: 'ZW', name: 'Zimbabwe',             dial: '+263', flag: '🇿🇼', digits: 9 },
  { iso: 'ZM', name: 'Zambie',               dial: '+260', flag: '🇿🇲', digits: 9 },
  { iso: 'MZ', name: 'Mozambique',           dial: '+258', flag: '🇲🇿', digits: 9 },
  { iso: 'BW', name: 'Botswana',             dial: '+267', flag: '🇧🇼', digits: 8 },
  { iso: 'NA', name: 'Namibie',              dial: '+264', flag: '🇳🇦', digits: 9 },

  // Middle East
  { iso: 'JO', name: 'Jordanie',             dial: '+962', flag: '🇯🇴', digits: 9 },
  { iso: 'LB', name: 'Liban',                dial: '+961', flag: '🇱🇧', digits: 8 },
  { iso: 'SY', name: 'Syrie',                dial: '+963', flag: '🇸🇾', digits: 9 },
  { iso: 'IQ', name: 'Irak',                 dial: '+964', flag: '🇮🇶', digits: 10 },
  { iso: 'IR', name: 'Iran',                 dial: '+98',  flag: '🇮🇷', digits: 10 },
  { iso: 'PS', name: 'Palestine',            dial: '+970', flag: '🇵🇸', digits: 9 },
  { iso: 'IL', name: 'Israël',               dial: '+972', flag: '🇮🇱', digits: 9 },
  { iso: 'TR', name: 'Turquie',              dial: '+90',  flag: '🇹🇷', digits: 10 },

  // Gulf
  { iso: 'AE', name: 'Émirats arabes unis',  dial: '+971', flag: '🇦🇪', digits: 9 },
  { iso: 'SA', name: 'Arabie saoudite',      dial: '+966', flag: '🇸🇦', digits: 9 },
  { iso: 'QA', name: 'Qatar',                dial: '+974', flag: '🇶🇦', digits: 8 },
  { iso: 'KW', name: 'Koweït',               dial: '+965', flag: '🇰🇼', digits: 8 },
  { iso: 'BH', name: 'Bahreïn',              dial: '+973', flag: '🇧🇭', digits: 8 },
  { iso: 'OM', name: 'Oman',                 dial: '+968', flag: '🇴🇲', digits: 8 },
  { iso: 'YE', name: 'Yémen',                dial: '+967', flag: '🇾🇪', digits: 9 },

  // Europe
  { iso: 'AT', name: 'Autriche',             dial: '+43',  flag: '🇦🇹', digits: 11 },
  { iso: 'IE', name: 'Irlande',              dial: '+353', flag: '🇮🇪', digits: 9 },
  { iso: 'LU', name: 'Luxembourg',           dial: '+352', flag: '🇱🇺', digits: 9 },
  { iso: 'MC', name: 'Monaco',               dial: '+377', flag: '🇲🇨', digits: 8 },
  { iso: 'PL', name: 'Pologne',              dial: '+48',  flag: '🇵🇱', digits: 9 },
  { iso: 'CZ', name: 'République tchèque',   dial: '+420', flag: '🇨🇿', digits: 9 },
  { iso: 'SK', name: 'Slovaquie',            dial: '+421', flag: '🇸🇰', digits: 9 },
  { iso: 'HU', name: 'Hongrie',              dial: '+36',  flag: '🇭🇺', digits: 9 },
  { iso: 'RO', name: 'Roumanie',             dial: '+40',  flag: '🇷🇴', digits: 9 },
  { iso: 'BG', name: 'Bulgarie',             dial: '+359', flag: '🇧🇬', digits: 9 },
  { iso: 'GR', name: 'Grèce',                dial: '+30',  flag: '🇬🇷', digits: 10 },
  { iso: 'CY', name: 'Chypre',               dial: '+357', flag: '🇨🇾', digits: 8 },
  { iso: 'MT', name: 'Malte',                dial: '+356', flag: '🇲🇹', digits: 8 },
  { iso: 'SE', name: 'Suède',                dial: '+46',  flag: '🇸🇪', digits: 9 },
  { iso: 'NO', name: 'Norvège',              dial: '+47',  flag: '🇳🇴', digits: 8 },
  { iso: 'DK', name: 'Danemark',             dial: '+45',  flag: '🇩🇰', digits: 8 },
  { iso: 'FI', name: 'Finlande',             dial: '+358', flag: '🇫🇮', digits: 10 },
  { iso: 'IS', name: 'Islande',              dial: '+354', flag: '🇮🇸', digits: 7 },
  { iso: 'EE', name: 'Estonie',              dial: '+372', flag: '🇪🇪', digits: 8 },
  { iso: 'LV', name: 'Lettonie',             dial: '+371', flag: '🇱🇻', digits: 8 },
  { iso: 'LT', name: 'Lituanie',             dial: '+370', flag: '🇱🇹', digits: 8 },
  { iso: 'RS', name: 'Serbie',               dial: '+381', flag: '🇷🇸', digits: 9 },
  { iso: 'HR', name: 'Croatie',              dial: '+385', flag: '🇭🇷', digits: 9 },
  { iso: 'SI', name: 'Slovénie',             dial: '+386', flag: '🇸🇮', digits: 8 },
  { iso: 'BA', name: 'Bosnie-Herzégovine',   dial: '+387', flag: '🇧🇦', digits: 8 },
  { iso: 'ME', name: 'Monténégro',           dial: '+382', flag: '🇲🇪', digits: 8 },
  { iso: 'MK', name: 'Macédoine du Nord',    dial: '+389', flag: '🇲🇰', digits: 8 },
  { iso: 'AL', name: 'Albanie',              dial: '+355', flag: '🇦🇱', digits: 9 },
  { iso: 'UA', name: 'Ukraine',              dial: '+380', flag: '🇺🇦', digits: 9 },
  { iso: 'RU', name: 'Russie',               dial: '+7',   flag: '🇷🇺', digits: 10 },
  { iso: 'BY', name: 'Bélarus',              dial: '+375', flag: '🇧🇾', digits: 9 },
  { iso: 'MD', name: 'Moldavie',             dial: '+373', flag: '🇲🇩', digits: 8 },

  // Asia
  { iso: 'CN', name: 'Chine',                dial: '+86',  flag: '🇨🇳', digits: 11 },
  { iso: 'JP', name: 'Japon',                dial: '+81',  flag: '🇯🇵', digits: 10 },
  { iso: 'KR', name: 'Corée du Sud',         dial: '+82',  flag: '🇰🇷', digits: 10 },
  { iso: 'IN', name: 'Inde',                 dial: '+91',  flag: '🇮🇳', digits: 10 },
  { iso: 'PK', name: 'Pakistan',             dial: '+92',  flag: '🇵🇰', digits: 10 },
  { iso: 'BD', name: 'Bangladesh',           dial: '+880', flag: '🇧🇩', digits: 10 },
  { iso: 'LK', name: 'Sri Lanka',            dial: '+94',  flag: '🇱🇰', digits: 9 },
  { iso: 'NP', name: 'Népal',                dial: '+977', flag: '🇳🇵', digits: 10 },
  { iso: 'TH', name: 'Thaïlande',            dial: '+66',  flag: '🇹🇭', digits: 9 },
  { iso: 'VN', name: 'Vietnam',              dial: '+84',  flag: '🇻🇳', digits: 9 },
  { iso: 'MY', name: 'Malaisie',             dial: '+60',  flag: '🇲🇾', digits: 10 },
  { iso: 'SG', name: 'Singapour',            dial: '+65',  flag: '🇸🇬', digits: 8 },
  { iso: 'ID', name: 'Indonésie',            dial: '+62',  flag: '🇮🇩', digits: 12 },
  { iso: 'PH', name: 'Philippines',          dial: '+63',  flag: '🇵🇭', digits: 10 },
  { iso: 'HK', name: 'Hong Kong',            dial: '+852', flag: '🇭🇰', digits: 8 },
  { iso: 'TW', name: 'Taïwan',               dial: '+886', flag: '🇹🇼', digits: 9 },
  { iso: 'KZ', name: 'Kazakhstan',           dial: '+7',   flag: '🇰🇿', digits: 10 },
  { iso: 'UZ', name: 'Ouzbékistan',          dial: '+998', flag: '🇺🇿', digits: 9 },
  { iso: 'AF', name: 'Afghanistan',          dial: '+93',  flag: '🇦🇫', digits: 9 },

  // Latin America
  { iso: 'MX', name: 'Mexique',              dial: '+52',  flag: '🇲🇽', digits: 10 },
  { iso: 'BR', name: 'Brésil',               dial: '+55',  flag: '🇧🇷', digits: 11 },
  { iso: 'AR', name: 'Argentine',            dial: '+54',  flag: '🇦🇷', digits: 10 },
  { iso: 'CL', name: 'Chili',                dial: '+56',  flag: '🇨🇱', digits: 9 },
  { iso: 'CO', name: 'Colombie',             dial: '+57',  flag: '🇨🇴', digits: 10 },
  { iso: 'PE', name: 'Pérou',                dial: '+51',  flag: '🇵🇪', digits: 9 },
  { iso: 'VE', name: 'Venezuela',            dial: '+58',  flag: '🇻🇪', digits: 10 },
  { iso: 'EC', name: 'Équateur',             dial: '+593', flag: '🇪🇨', digits: 9 },
  { iso: 'BO', name: 'Bolivie',              dial: '+591', flag: '🇧🇴', digits: 8 },
  { iso: 'UY', name: 'Uruguay',              dial: '+598', flag: '🇺🇾', digits: 8 },
  { iso: 'PY', name: 'Paraguay',             dial: '+595', flag: '🇵🇾', digits: 9 },
  { iso: 'DO', name: 'République dominicaine', dial: '+1',   flag: '🇩🇴', digits: 10 },
  { iso: 'CU', name: 'Cuba',                 dial: '+53',  flag: '🇨🇺', digits: 8 },
  { iso: 'JM', name: 'Jamaïque',             dial: '+1',   flag: '🇯🇲', digits: 10 },
  { iso: 'HT', name: 'Haïti',                dial: '+509', flag: '🇭🇹', digits: 8 },
  { iso: 'GT', name: 'Guatemala',            dial: '+502', flag: '🇬🇹', digits: 8 },
  { iso: 'HN', name: 'Honduras',             dial: '+504', flag: '🇭🇳', digits: 8 },
  { iso: 'NI', name: 'Nicaragua',            dial: '+505', flag: '🇳🇮', digits: 8 },
  { iso: 'CR', name: 'Costa Rica',           dial: '+506', flag: '🇨🇷', digits: 8 },
  { iso: 'PA', name: 'Panama',               dial: '+507', flag: '🇵🇦', digits: 8 },
  { iso: 'SV', name: 'Salvador',             dial: '+503', flag: '🇸🇻', digits: 8 },

  // Oceania
  { iso: 'AU', name: 'Australie',            dial: '+61',  flag: '🇦🇺', digits: 9 },
  { iso: 'NZ', name: 'Nouvelle-Zélande',     dial: '+64',  flag: '🇳🇿', digits: 10 },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]!;

const POPOVER_WIDTH = 288; // matches w-72
const POPOVER_GAP = 8;

type Props = {
  value: Country;
  onChange: (c: Country) => void;
};

export function CountryCodeSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePos = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    // Anchor left edge to button (popover extends right) and clamp
    // inside the viewport with an 8 px margin.
    const left = Math.max(
      8,
      Math.min(window.innerWidth - POPOVER_WIDTH - 8, r.left),
    );
    const top = r.bottom + POPOVER_GAP;
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dial.includes(q),
    );
  }, [query]);

  const popover = open && pos && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={popoverRef}
          role="listbox"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
          className="rounded-xl bg-[#ffffff] dark:bg-[#0b1220] border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden z-[200] animate-fade-in-down"
        >
          <div className="p-2 border-b border-gray-100 dark:border-white/10">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                aria-hidden
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un pays…"
                className="w-full rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 pl-8 pr-2.5 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
                autoFocus
              />
            </div>
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.map((c) => {
              const active = c.iso === value.iso;
              return (
                <li key={c.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span aria-hidden className="text-base leading-none shrink-0">
                      {c.flag}
                    </span>
                    <span className="flex-1 text-start text-brand-navy truncate">
                      {c.name}
                    </span>
                    <span className="text-gray-500 tabular-nums text-xs">
                      {c.dial}
                    </span>
                    {active && (
                      <Check className="h-4 w-4 text-brand-blue shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-gray-400">
                Aucun pays trouvé
              </li>
            )}
          </ul>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Indicatif pays — ${value.name} ${value.dial}`}
        className="inline-flex items-center gap-1.5 h-full rounded-l-xl bg-white/85 backdrop-blur-sm border border-r-0 border-gray-200 px-3 text-sm font-semibold text-brand-navy hover:border-brand-blue hover:text-brand-blue focus:outline-none focus:border-brand-blue transition-colors shrink-0"
      >
        <span aria-hidden className="text-base leading-none">
          {value.flag}
        </span>
        <span className="tabular-nums">{value.dial}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {popover}
    </>
  );
}
