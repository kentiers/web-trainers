/**
 * Hangman - Save Editor & Storage Patcher
 * Targets CrazyGames-Game-Hangman-v1.2 storage schema.
 */
export class HangmanSaveEditor {
  constructor(storageKey = 'CrazyGames-Game-Hangman-v1.2') {
    this.storageKey = storageKey;
  }

  getSaveData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : { diamond: 0 };
    } catch (e) {
      return { diamond: 0 };
    }
  }

  injectDiamonds(amount = 999999) {
    const save = this.getSaveData();
    save.diamond = amount;
    save.firstTimer = false;
    save.clueClicked = true;
    localStorage.setItem(this.storageKey, JSON.stringify(save));
    return amount;
  }
}
