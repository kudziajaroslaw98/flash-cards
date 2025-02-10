export const prepareNotification = () => {
  const notificationConfigs = [
    {
      title: 'Are You a Goldfish? Prove It.',
      body: 'Goldfish forget stuff in 3 seconds. You have 3 minutes to review. 🐟⏳',
    },
    {
      title: "Your Memory's on Life Support",
      body: 'Quick! Revive it with 5 minutes of flashcards. ⚡🩺',
    },
    {
      title: 'Your Flashcards Are Plotting a Rebellion',
      body: "Review them now, or they'll start hiding under the couch. 🛋️⚔️",
    },
    {
      title: 'Quiz Yourself Before You Wreck Yourself',
      body: "Your memory's fading faster than a Snapchat streak. 💥📚",
    },
    {
      title: "Don't Ghost Your Flashcards!",
      body: 'They miss you. And your brain is starting to feel like a haunted house. 👻🏠',
    },
    {
      title: 'Winter Is Forgetting…',
      body: 'Brace yourself. The Night King of Ignorance approaches.',
    },
    {
      title: 'Aliens Stole Your Knowledge',
      body: "They'll return it… but only if you review 10 flashcards. (We don't negotiate with extraterrestrials.)",
    },
    {
      title: 'Stuck in a Hamster Wheel of Forgetting?',
      body: "Stop running in circles. Review now or keep forgetting the capital of France. (It's Paris. Probably.)",
    },
    {
      title: 'Squirrel Brain Status?',
      body: 'You buried that knowledge somewhere. Time to dig it up before winter… or final exams.',
    },
  ];

  const getRandomNotification = () => {
    const randomIndex = Math.floor(Math.random() * notificationConfigs.length);
    return notificationConfigs[randomIndex];
  };

  const payload = JSON.stringify({
    lang: 'en',
    icon: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    badge: '/icon-badge-96x96.png',
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192x192.png',
      },
    ],
    ...getRandomNotification(),
  });

  return payload;
};
