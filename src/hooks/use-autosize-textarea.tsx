import { useEffect } from 'react';

const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
  minHeight: number = 36,
) => {
  const recalculateHeight = () => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.style.height = '0px';
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = Math.max(scrollHeight, minHeight) + 'px';
    }
  };

  useEffect(() => {
    recalculateHeight();
  }, [textAreaRef, value]);

  return { recalculateHeight };
};

export default useAutosizeTextArea;
