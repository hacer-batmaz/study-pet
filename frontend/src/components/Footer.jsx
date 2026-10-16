export default function Footer() {
  return (
    <footer className="border-t border-purple-900/40 py-8 px-6 text-center text-xs text-gray-500 mt-auto">
      <div className="flex items-center justify-center gap-2 mb-2 font-bold text-gray-300">
        <span>🐱</span>
        <span className="text-retro-accent">
          Study<span className="text-white">Pet</span>
        </span>
        <span>— Oyunlaştırılmış Odaklanma Platformu</span>
      </div>
      <p>© 2026 StudyPet. İnternet Programlama Projesi.</p>
    </footer>
  );
}