export interface InputParams<T> {
  placeholder?: string;
  value: T;
  name: string;
  label: string;
  onInput: (value: T) => void;
}
