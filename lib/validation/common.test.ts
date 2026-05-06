import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
  totpCodeSchema,
  recoveryCodeSchema,
  cuidSchema,
  localeSchema,
  currencySchema,
  reportChannelSchema,
  problemTypeSchema,
} from './common';

describe('emailSchema', () => {
  it('accepts a normal email', () => {
    expect(emailSchema.parse('user@example.com')).toBe('user@example.com');
  });
  it('lowercases and trims', () => {
    expect(emailSchema.parse('  USER@X.COM  ')).toBe('user@x.com');
  });
  it('accepts plus aliases', () => {
    expect(() => emailSchema.parse('foo+bar@x.com')).not.toThrow();
  });
  it('rejects invalid', () => {
    expect(() => emailSchema.parse('not-an-email')).toThrow();
    expect(() => emailSchema.parse('@x.com')).toThrow();
    expect(() => emailSchema.parse('a@')).toThrow();
  });
  it('rejects too long', () => {
    expect(() => emailSchema.parse('a'.repeat(250) + '@x.com')).toThrow();
  });
});

describe('passwordSchema', () => {
  it('accepts mots de passe complexes ≥ 12 chars', () => {
    expect(() => passwordSchema.parse('Hadar2026!ok')).not.toThrow();
    expect(() => passwordSchema.parse('mon-Mot-de-Passe-2026')).not.toThrow();
  });
  it('rejette < 12 chars', () => {
    expect(() => passwordSchema.parse('Court1!')).toThrow();
  });
  it('rejette > 128 chars', () => {
    expect(() => passwordSchema.parse('A1!' + 'a'.repeat(130))).toThrow();
  });
  it('rejette si moins de 3 catégories de caractères', () => {
    // 12 chars mais que minuscules → 1 catégorie
    expect(() => passwordSchema.parse('motdepasseaa')).toThrow();
    // minuscules + chiffres → 2 catégories
    expect(() => passwordSchema.parse('motdepasse12')).toThrow();
  });
});

describe('phoneSchema', () => {
  it('accepte un numéro international valide', () => {
    expect(phoneSchema.parse('+212612345678')).toBe('+212612345678');
  });
  it('rejette les numéros sans + initial', () => {
    expect(() => phoneSchema.parse('212612345678')).toThrow();
  });
  it('rejette trop court / trop long', () => {
    expect(() => phoneSchema.parse('+1234')).toThrow();
    expect(() => phoneSchema.parse('+1' + '2'.repeat(20))).toThrow();
  });
});

describe('nameSchema', () => {
  it('accepte les noms latins, arabes, avec tirets', () => {
    expect(nameSchema.parse('Mohamed Ossama')).toBe('Mohamed Ossama');
    expect(nameSchema.parse('محمد')).toBe('محمد');
    expect(nameSchema.parse('Jean-Pierre')).toBe('Jean-Pierre');
  });
  it('rejette vide ou trop long', () => {
    expect(() => nameSchema.parse('')).toThrow();
    expect(() => nameSchema.parse('  ')).toThrow();
    expect(() => nameSchema.parse('a'.repeat(101))).toThrow();
  });
});

describe('totpCodeSchema', () => {
  it('accepte 6 chiffres', () => {
    expect(totpCodeSchema.parse('123456')).toBe('123456');
  });
  it('rejette autre chose', () => {
    expect(() => totpCodeSchema.parse('12345')).toThrow();
    expect(() => totpCodeSchema.parse('1234567')).toThrow();
    expect(() => totpCodeSchema.parse('12345a')).toThrow();
  });
});

describe('recoveryCodeSchema', () => {
  it('accepte XXXXX-XXXXX et XXXXXXXXXX', () => {
    expect(recoveryCodeSchema.parse('ABCDE-FGHJK')).toBe('ABCDE-FGHJK');
    expect(recoveryCodeSchema.parse('ABCDEFGHJK')).toBe('ABCDEFGHJK');
  });
  it('uppercase auto', () => {
    expect(recoveryCodeSchema.parse('abcde-fghjk')).toBe('ABCDE-FGHJK');
  });
  it('rejette caractères ambigus', () => {
    expect(() => recoveryCodeSchema.parse('0BCDE-FGHJK')).toThrow();
    expect(() => recoveryCodeSchema.parse('IBCDE-FGHJK')).toThrow();
  });
});

describe('cuidSchema', () => {
  it('accepte un cuid valide', () => {
    expect(() => cuidSchema.parse('c' + 'a'.repeat(24))).not.toThrow();
  });
  it('rejette autre chose', () => {
    expect(() => cuidSchema.parse('not-a-cuid')).toThrow();
    expect(() => cuidSchema.parse('aaaaaa')).toThrow();
  });
});

describe('enums', () => {
  it('localeSchema accepte fr/en/ar', () => {
    expect(localeSchema.parse('fr')).toBe('fr');
    expect(() => localeSchema.parse('de')).toThrow();
  });
  it('currencySchema', () => {
    expect(currencySchema.parse('MAD')).toBe('MAD');
    expect(() => currencySchema.parse('GBP')).toThrow();
  });
  it('reportChannelSchema', () => {
    expect(reportChannelSchema.parse('WHATSAPP')).toBe('WHATSAPP');
    expect(() => reportChannelSchema.parse('SMS')).toThrow();
  });
  it('problemTypeSchema', () => {
    expect(problemTypeSchema.parse('NON_LIVRAISON')).toBe('NON_LIVRAISON');
    expect(() => problemTypeSchema.parse('AUTRE')).toThrow();
  });
});
