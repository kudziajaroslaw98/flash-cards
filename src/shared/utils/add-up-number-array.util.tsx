export default function addUpNumberArray(arr: number[]): number[] {
  const addedUpArray: number[] = [];

  arr.forEach((item, index) => {
    if (index > 0) {
      addedUpArray.push(
        parseFloat((item + addedUpArray[index - 1]).toFixed(2)),
      );
    } else {
      addedUpArray.push(parseFloat(item.toFixed(2)));
    }
  });

  return addedUpArray;
}
