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

    self.postMessage({ action: 'calculate-culmilative', mappedItems });
  } else if (event.data.action === 'calculate-reversed-weight') {
    let min: number | null = null;
    let max: number | null = null;
    const items = event.data.items as Flashcard[];
    const mappedItems = items.map((item: Flashcard) => {
      const date = item.spacedRepetition.dueDate;
      const difference = new Date(date).getTime() - Date.now();
      const dateInMinutes = Math.round(
        (difference < 0 ? 0 : difference) / 1000 / 60,
      );

      if (min === null) {
        min = dateInMinutes;
      }

      if (max === null) {
        max = dateInMinutes;
      }

      if (dateInMinutes < min) {
        min = dateInMinutes;
      } else if (dateInMinutes > max) {
        max = dateInMinutes;
      }
      return {
        ...item,
        spacedRepetition: { ...item.spacedRepetition, weight: dateInMinutes },
      };
    });

    const sortedItems = mappedItems.sort(
      (a, b) => a.spacedRepetition.weight - b.spacedRepetition.weight,
    );

    const reversedWeights = sortedItems.map((item) => {
      let newWeight = max! - item.spacedRepetition.weight;

      if (newWeight < 600) {
        newWeight = 600;
      }
      return {
        ...item,
        spacedRepetition: {
          ...item.spacedRepetition,
          reversedWeight: newWeight,
        },
      };
    });

    const sortedReversed = reversedWeights.sort(
      (a, b) =>
        b.spacedRepetition.reversedWeight - a.spacedRepetition.reversedWeight,
    );
    self.postMessage({
      action: 'calculate-reversed-weight',
      mappedItems: sortedReversed,
    });
  }
};

// const culmulativeWeights: number[] = [];
// const mappedItems: WeightedItem<T>[] = items.map((item: T) => {
//   const date = item.spacedRepetition.dueDate;
//   const difference = new Date(date).getTime() - Date.now();
//   const dateInMinutes = Math.round(
//     (difference < 0 ? 0 : difference) / 1000 / 60,
//   );

//   if (min === null) {
//     min = dateInMinutes;
//   }

//   if (max === null) {
//     max = dateInMinutes;
//   }

//   if (dateInMinutes < min) {
//     min = dateInMinutes;
//   } else if (dateInMinutes > max) {
//     max = dateInMinutes;
//   }
//   return { ...item, weight: dateInMinutes };
// });

// if (min === null || max === null) {
//   throw new Error(
//     '[Spaced Repetition Algorithm] - No dates in the array',
//   );
// }

// const reversedWeights: WeightedItem<T>[] = mappedItems.map(
//   (item, index) => {
//     let newWeight = max! - item.weight;

//     if (newWeight < 600) {
//       newWeight = 600;
//     }

//     if (index === 0) {
//       culmulativeWeights.push(newWeight);
//     } else {
//       culmulativeWeights.push(culmulativeWeights[index - 1] + newWeight);
//     }

//     return {
//       ...item,
//       weight: newWeight,
//     };
//   },
// );

// reversedWeights.sort((a, b) => b.weight - a.weight);
