import { PropsWithChildren } from 'react';


export interface InputLabelParams {
  for: string;
  label: string;
}

export default function InputLabelComponent(params: PropsWithChildren<InputLabelParams>) {
  return <label
    className="w-full max-w-md flex flex-col gap-1"
    htmlFor={ params.for }
  >
    <span className="text-sm font-bold text-gray-500">
      { params.label }
    </span> { params.children }
  </label>;
}
