export const PET_SPRITES = {
  cat: {
    happy: '/assets/pets/cok_mutlu_kedi.gif',
    studying: '/assets/pets/normal_kedi.gif',
    sad: '/assets/pets/mutsuz_kedi.gif',
  },
  dog: {
    happy: '/assets/pets/cok_mutlu_kopek.gif',
    studying: '/assets/pets/normal_kopek.gif',
    sad: '/assets/pets/mutsuz_kopek.gif',
  },
  rabbit: {
    happy: '/assets/pets/cok_mutlu_tavsan.gif',
    studying: '/assets/pets/normal_tavsan.gif',
    sad: '/assets/pets/mutsuz_tavsan.gif',
  },
};

export const getPetSprite = (type = 'cat', hungerLevel = 100, isStudying = false) => {
  const normalizedType = type ? type.toLowerCase() : 'cat';
  const pet = PET_SPRITES[normalizedType] || PET_SPRITES.cat;

  if (isStudying) {
    return pet.studying;
  }
  if (hungerLevel < 30) {
    return pet.sad;
  }
  return pet.happy;
};