/**
 * Words and Blooms - Save Editor & Storage Patcher
 * Targets wordsandcrowns.stats & wordsandblooms.stats schemas in LocalStorage.
 */
export class BloomsSaveEditor {
  constructor() {
    this.keys = [
      'wordsandcrowns.stats.v1',
      'wordsandcrowns.stats.timed.v1',
      'wordsandblooms.stats.rush.v1'
    ];
  }

  injectMaxStats(bestScore = 999999, totalScore = 5000000) {
    const statsTemplate = {
      gamesPlayed: 100,
      totalScore,
      bestScore,
      bestDrops: 999,
      bestGameDate: new Date().toISOString(),
      totalWordsMade: 5000,
      totalLettersUsed: 25000,
      longestWord: "BLOOMING",
      highestWordScore: 50000,
      highestScoringWord: "BLOOMING",
      dlCreated: 500,
      tlCreated: 500,
      dwCreated: 500,
      twCreated: 500
    };

    for (const k of this.keys) {
      localStorage.setItem(k, JSON.stringify(statsTemplate));
    }
    return statsTemplate;
  }

  skipTutorials() {
    localStorage.setItem('wordsandblooms.tutorial.done.v1', '1');
    localStorage.setItem('wordsandblooms.bloomintro.hide', '1');
    localStorage.setItem('wordsandblooms.rush.hideintro', '1');
    localStorage.setItem('wordsandblooms.bloom.used', '1');
    return true;
  }
}
