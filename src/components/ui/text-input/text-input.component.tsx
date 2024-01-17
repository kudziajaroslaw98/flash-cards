import { InputParams } from '#/utils/interfaces/input-params.interface';
import InputLabelComponent from '#/components/ui/input-label/input-label.component';


export default function TextInputComponent(params: Readonly<InputParams<string>>) {
  return (
    <InputLabelComponent
      for={ params.name }
      label={ params.label }
    >
      <input
        type="text"
        className="w-full rounded-md p-2 transition-all focus:ring-1 outline-none ring-blue-400 text-sm"
        id={ params.name }
        onInput={ (value) => params.onInput(value.currentTarget.value) }
        placeholder={ params.placeholder }
        value={ params.value }
      />
    </InputLabelComponent>
  );
}
