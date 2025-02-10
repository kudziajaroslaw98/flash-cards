import type { Flashcard } from '#/types/flash-card.type';

self.onmessage = async (event: MessageEvent) => {
  if (event.data.action === 'calculate-culmilative') {
    const items = event.data.items as Flashcard[];
    let culmulation = 0;

    const mappedItems = items.map((item, index) => {
      if (index === 0) {
        culmulation = item.spacedRepetition.reversedWeight;
      } else {
        culmulation = culmulation + item.spacedRepetition.reversedWeight;
      }

      return {
        ...item,
        spacedRepetition: {
          ...item.spacedRepetition,
          culmulativeWeight: culmulation,
        },
      };
    });

    self.postMessage({ mappedItems });
  }
};
