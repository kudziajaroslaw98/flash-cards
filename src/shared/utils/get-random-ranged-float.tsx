export default function getRandomRangedFloat(min: number, max: number) {
  return parseFloat((Math.random() * (max - min + 1)).toFixed(2));
}
