export function SupportFab() {
  return (
    <button
      type="button"
      aria-label="Contacter le support"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-pill bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 text-sm font-semibold shadow-lg transition-colors"
    >
      <span aria-hidden>💬</span>
      Support
    </button>
  );
}
