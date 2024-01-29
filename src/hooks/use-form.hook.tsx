// import InputComponent, {
//   InputProps,
// } from '#/components/ui/input/input.component';
// import checkValidity from '#/utils/functions/check-validity.util';
// import { cloneDeep } from 'lodash';
// import { ReactNode, useEffect, useState } from 'react';

// export default function useForm(
//   scheme: FormScheme,
//   onSubmit?: (
//     formValue: Record<string, string | number | readonly string[] | undefined>,
//   ) => void,
//   debug: boolean = false,
// ): {
//   form: ReactNode;
//   value: Record<string, unknown>;
//   isValid: boolean;
//   errors: Record<string, string | undefined>;
//   formValids: Record<string, boolean>;
// } {
//   const [form, setForm] = useState<ReactNode>();
//   const [formScheme, setScheme] = useState<FormScheme>();
//   const [formValues, setFormValues] = useState<
//     Record<string, string | number | readonly string[] | undefined>
//   >({});
//   const [formValids, setFormValids] = useState<Record<string, boolean>>({});
//   const [formErrors, setFormErrors] = useState<
//     Record<string, string | undefined>
//   >({});
//   const [formInputs, setFormInputs] = useState<string[]>([]);
//   const [valid, setValid] = useState<boolean>();

//   const buildFormInputs = (
//     inputSchemes: Record<string, Omit<InputProps, 'value'>>,
//   ) => {
//     return Object.entries(inputSchemes).map(([inputName, props]) => {
//       if (!formInputs.includes(inputName)) {
//         setFormInputs([...formInputs, inputName]);
//       }

//       const clonedValids = cloneDeep(formValids);
//       const clonedErrors = cloneDeep(formErrors);
//       const clonedValues = cloneDeep(formValues);

//       clonedValids[inputName] = true;
//       clonedErrors[inputName] = undefined;
//       clonedValues[inputName] = undefined;

//       setFormValids(clonedValids);
//       setFormErrors(clonedErrors);
//       setFormValues(clonedValues);

//       return (
//         <>
//           <InputComponent
//             {...props}
//             key={inputName}
//             onBlur={(e) => {
//               if (props.onBlur) {
//                 props.onBlur(e);
//               }

//               const { valid, error } = checkValidity(
//                 e.currentTarget.value,
//                 scheme.validation.shape?.[inputName],
//               );

//               const clonedValids = cloneDeep(formValids);
//               const clonedErrors = cloneDeep(formErrors);

//               console.log(clonedErrors, clonedValids);

//               clonedValids[inputName] = valid;
//               clonedErrors[inputName] = error;

//               setFormValids(clonedValids);
//               setFormErrors(clonedErrors);
//             }}
//             onInput={(e) => {
//               if (props.onInput) {
//                 props.onInput(e);
//               }

//               const clonedValues = cloneDeep(formValues);
//               clonedValues[inputName] = e.currentTarget.value;

//               setFormValues(clonedValues);
//             }}
//             valid={formValids[inputName]}
//             error={formErrors[inputName]}
//             value={formValues[inputName]}
//           />
//           {formValids[inputName]}
//           {formErrors[inputName]}
//           {formValues[inputName]}
//         </>
//       );
//     });
//   };

//   const buildForm = (inputs: ReactNode[]) => {
//     return (
//       <form
//         onBlur={() => scheme.validation.safeParse(formValues)}
//         onSubmit={() => onSubmit && onSubmit(formValues)}
//       >
//         {inputs}
//       </form>
//     );
//   };

//   useEffect(() => {
//     console.log('before build');

//     const buildedInputs = buildFormInputs(scheme.inputs);
//     const buildedForm = buildForm(buildedInputs);

//     setForm(buildedForm);
//     setScheme(scheme);
//   }, []);

//   //   useEffect(() => {
//   //     const buildedInputs = buildFormInputs(scheme.inputs, true);
//   //     const buildedForm = buildForm(buildedInputs);

//   //     setForm(buildedForm);
//   //   }, [formValues]);

//   useEffect(() => {
//     if (debug) {
//       console.log('formScheme', formScheme);
//       console.log('formErrors', formErrors);
//       console.log('formValids', formValids);
//       console.log('formValues', formValues);
//       console.log('formInputs', formInputs);
//     }
//   }, [debug, formScheme, formErrors, formValids, formValues, formInputs]);

//   return {
//     form,
//     value: formValues,
//     isValid: Object.values(formValids).every((item) => item === true),
//     errors: formErrors,
//     formValids: formValids,
//   };
// }
