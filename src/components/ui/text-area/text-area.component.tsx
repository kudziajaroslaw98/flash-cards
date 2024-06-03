import useDebounce from '#/hooks/use-debounce.hook';
import { useEffect, useRef, useState } from 'react';

export interface TextAreaProps {
  className: string;
  onInput: (_event: string) => void;
  value: string;
  id: string;
}

export default function TextArea(props: Readonly<TextAreaProps>) {
  const [value, setValue] = useState(props.value);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useDebounce(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '36px';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, 75);

  useEffect(() => {
    adjustHeight();

    window.addEventListener('resize', () => {
      adjustHeight();
    });

    return () => {
      window.removeEventListener('resize', () => {
        adjustHeight();
      });
    };
  }, [adjustHeight]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={textAreaRef}
      className={`h-8 w-full resize-none rounded-md p-2 outline-none ring-blue-400 transition-all focus:ring-1 ${props.className}`}
      id={props.id}
      value={value}
      onInput={(e) => {
        setValue(e.currentTarget.value);
        props.onInput(e.currentTarget.value);
      }}
    ></textarea>
  );
}
