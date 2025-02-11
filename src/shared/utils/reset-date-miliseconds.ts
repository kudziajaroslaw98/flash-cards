export const resetMiliseconds = (date: Date | string) => {
  return new Date(new Date(date).setMilliseconds(0));
};
