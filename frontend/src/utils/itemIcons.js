/**
 * @param {Object|string} item - Ürün nesnesi veya doğrudan ürün adı/dosya yolu
 * @returns {string} En uygun emoji karakteri
 */
export const getItemEmoji = (item = {}) => {
    // Girdi string ise doğrudan al, obje ise icon, spriteUrl veya name alanına bak
    const rawString = typeof item === 'string'
        ? item
        : (item.icon || item.spriteUrl || item.name || '');

    const trimmed = rawString.trim();

    if (
        trimmed &&
        !trimmed.includes('/') &&
        !trimmed.includes('\\') &&
        !trimmed.includes('.png') &&
        !trimmed.includes('.jpg') &&
        trimmed.length <= 4
    ) {
        return trimmed;
    }

    // Obje içindeki türü kontrol et (aksesuar / dekor / iksir)
    const type = (typeof item === 'object' && item.type ? item.type : '').toLowerCase();
    if (type === 'accessory') return '🎩';
    if (type === 'decor') return '🪴';
    if (type === 'potion') return '🧪';

    //Türkçe karakter duyarlı küçük harfe dönüştürerek isim / yol analizi yap
    const text = (
        typeof item === 'object'
            ? `${item.name || ''} ${item.spriteUrl || ''} ${item.icon || ''}`
            : rawString
    ).toLocaleLowerCase('tr-TR');

    // Akıllı Yiyecek & İçecek Eşlemeleri
    if (text.includes('elma') || text.includes('apple')) return '🍎';
    if (text.includes('havuc') || text.includes('havuç') || text.includes('carrot')) return '🥕';
    if (text.includes('balik') || text.includes('balık') || text.includes('somon') || text.includes('fish')) return '🐟';
    if (text.includes('kek') || text.includes('pasta') || text.includes('cake')) return '🍰';
    if (text.includes('kemik') || text.includes('bone')) return '🦴';
    if (text.includes('et') || text.includes('biftek') || text.includes('steak') || text.includes('meat')) return '🥩';
    if (text.includes('pizza')) return '🍕';
    if (text.includes('burger') || text.includes('hamburger')) return '🍔';
    if (text.includes('sut') || text.includes('süt') || text.includes('milk')) return '🥛';
    if (text.includes('kurabiye') || text.includes('cookie') || text.includes('bisküvi')) return '🍪';
    if (text.includes('peynir') || text.includes('cheese')) return '🧀';
    if (text.includes('ekmek') || text.includes('bread')) return '🍞';
    if (text.includes('dondurma') || text.includes('ice cream')) return '🍦';
    if (text.includes('kahve') || text.includes('coffee')) return '☕';
    if (text.includes('su') || text.includes('water')) return '💧';
    if (text.includes('sosis') || text.includes('hotdog')) return '🌭';
    if (text.includes('çilek') || text.includes('cilek') || text.includes('strawberry')) return '🍓';
    if (text.includes('muz') || text.includes('banana')) return '🍌';
    if (text.includes('karpuz') || text.includes('watermelon')) return '🍉';
    if (text.includes('iksir') || text.includes('potion')) return '🧪';
    if (text.includes('enerji') || text.includes('energy')) return '⚡';
    if (text.includes('seker') || text.includes('şeker') || text.includes('candy')) return '🍬';

    return '🍖';
};

/**
 * Dosya yolu formatında (örn: '/assets/items/apple.png') kayıtlı kalmış eski ürün isimlerini
 * kullanıcı dostu Türkçe başlığa dönüştürür.
 * @param {Object|string} item - Ürün nesnesi veya doğrudan string
 * @returns {string} Ekranda gösterilecek temiz ürün adı
 */
export const getItemDisplayName = (item = {}) => {
    const name = typeof item === 'string' ? item : (item.name || '');
    if (!name.includes('/') && !name.includes('\\') && !name.includes('.png')) {
        return name || 'Lezzetli Yiyecek';
    }

    const text = name.toLocaleLowerCase('tr-TR');

    if (text.includes('apple') || text.includes('elma')) return 'Kırmızı Elma';
    if (text.includes('fish') || text.includes('balik') || text.includes('balık')) return 'Lezzetli Balık';
    if (text.includes('carrot') || text.includes('havuc') || text.includes('havuç')) return 'Taze Havuç';
    if (text.includes('cake') || text.includes('kek') || text.includes('pasta')) return 'Çilekli Kek';
    if (text.includes('meat') || text.includes('et') || text.includes('biftek')) return 'Biftek';
    if (text.includes('milk') || text.includes('sut') || text.includes('süt')) return 'Taze Süt';
    if (text.includes('bone') || text.includes('kemik')) return 'Lezzetli Kemik';
    if (text.includes('cookie') || text.includes('kurabiye')) return 'Fırından Kurabiye';
    if (text.includes('pizza')) return 'Dilim Pizza';

    return 'Özel Besin';
};