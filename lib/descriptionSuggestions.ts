// Pre-made description suggestions per problem type, in FR / EN / AR.
// Used by ReportForm step 3 to offer the user a one-click starting
// point for the description so they don't face an empty textarea.
//
// Phrases that mention an amount use the {amount} placeholder, which
// is replaced at render time with the actual amount + currency the
// user typed in step 2 (e.g. "3000 MAD"). Phrases that don't depend
// on an amount are used as-is.

type Locale = 'fr' | 'en' | 'ar';

export type ProblemId =
  | 'non_livraison'
  | 'bloque_apres_paiement'
  | 'produit_non_conforme'
  | 'usurpation_identite';

const SUGGESTIONS: Record<ProblemId, Record<Locale, string[]>> = {
  non_livraison: {
    fr: [
      "Le produit n'a pas été livré après le paiement de {amount}.",
      "Aucune livraison n'a été constatée après le paiement de {amount}.",
      "La commande n'a pas été reçue malgré le paiement de {amount}.",
      "La livraison prévue n'a pas eu lieu après le paiement de {amount}.",
    ],
    en: [
      'The product was not delivered after the payment of {amount}.',
      'No delivery was observed after the payment of {amount}.',
      'The order was not received despite the payment of {amount}.',
      'The expected delivery did not take place after the payment of {amount}.',
    ],
    ar: [
      'لم يتم تسليم المنتج بعد دفع {amount}',
      'لم يتم تسجيل أي عملية تسليم بعد دفع {amount}',
      'لم يتم استلام الطلب رغم دفع {amount}',
      'لم تتم عملية التسليم كما هو متوقع بعد دفع {amount}',
    ],
  },
  bloque_apres_paiement: {
    fr: [
      "Le contact n'est plus joignable après le paiement de {amount}.",
      'Le contact ne donne plus de réponse après le paiement de {amount}.',
      'La communication a cessé après le paiement de {amount}.',
      'Le contact a interrompu les échanges après le paiement de {amount}.',
    ],
    en: [
      'The contact is no longer reachable after the payment of {amount}.',
      'The contact no longer responds after the payment of {amount}.',
      'Communication stopped after the payment of {amount}.',
      'The contact stopped responding after the payment of {amount}.',
    ],
    ar: [
      'لم يعد من الممكن التواصل مع هذا الشخص بعد دفع {amount}',
      'هذا الشخص لم يعد يرد بعد دفع {amount}',
      'توقفت عملية التواصل بعد دفع {amount}',
      'قام هذا الشخص بقطع التواصل بعد دفع {amount}',
    ],
  },
  produit_non_conforme: {
    fr: [
      'Le produit reçu ne correspond pas à la description.',
      'Le produit livré est différent de ce qui était annoncé.',
      'Le produit ne correspond pas aux attentes après réception.',
      'La qualité du produit reçu ne correspond pas à ce qui était prévu.',
    ],
    en: [
      'The product received does not match the description.',
      'The delivered product is different from what was advertised.',
      'The product does not meet expectations after delivery.',
      'The quality of the received product does not match what was expected.',
    ],
    ar: [
      'المنتج المستلم لا يتطابق مع الوصف',
      'المنتج المُسلَّم مختلف عما تم الإعلان عنه',
      'المنتج لا يلبي التوقعات بعد الاستلام',
      'جودة المنتج المستلم لا تتطابق مع ما تم الاتفاق عليه',
    ],
  },
  usurpation_identite: {
    fr: [
      "Le compte semble utiliser une identité qui ne lui appartient pas.",
      'Le profil présente des éléments incohérents.',
      "Une identité similaire à une autre entité a été utilisée.",
      "Le compte semble se faire passer pour une autre personne ou organisation.",
    ],
    en: [
      'The account appears to be using an identity that does not belong to it.',
      'The profile contains inconsistent information.',
      'An identity similar to another entity has been used.',
      'The account appears to impersonate another person or organization.',
    ],
    ar: [
      'يبدو أن الحساب يستخدم هوية لا تعود له',
      'يحتوي الملف الشخصي على معلومات غير متناسقة',
      'تم استخدام هوية مشابهة لجهة أخرى',
      'يبدو أن الحساب ينتحل صفة شخص أو جهة أخرى',
    ],
  },
};

// Resolve the 4 suggestion phrases for a given problem + locale,
// substituting the {amount} placeholder with the user's typed amount
// + currency (e.g. "3000 MAD") when the problem template uses it.
// Falls back to "le paiement effectué" / "the payment" / "الدفع
// المُنجز" if the user hasn't typed an amount yet, so the suggestion
// list still shows valid phrases on step 3 even before step 2 is
// confirmed.
export function getDescriptionSuggestions(
  problemId: ProblemId | null,
  locale: Locale,
  amount: string,
  currencySymbol: string,
): string[] {
  if (!problemId) return [];
  const templates = SUGGESTIONS[problemId][locale];
  const trimmed = amount.trim();
  if (trimmed) {
    const amountStr = `${trimmed} ${currencySymbol}`;
    return templates.map((t) => t.replace(/\{amount\}/g, amountStr));
  }
  // No amount yet — keep amount-independent templates as-is and use
  // a neutral fallback for amount-dependent ones.
  const fallback =
    locale === 'fr'
      ? 'le paiement effectué'
      : locale === 'ar'
        ? 'الدفع المُنجز'
        : 'the payment';
  return templates.map((t) => t.replace(/\{amount\}/g, fallback));
}
