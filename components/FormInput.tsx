import {
  UseControllerProps,
  useController,
  FieldValues,
} from 'react-hook-form';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';

export type RHFTextInputProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues>;
export type FormInputProps<TFieldValues extends FieldValues> = TextInputProps &
  RHFTextInputProps<TFieldValues>;

function FormInput<TFieldValues extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  ...rest
}: FormInputProps<TFieldValues>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: true },
  });

  return (
    <View>
      <TextInput
        {...rest}
        style={[styles.input, error && styles.error]}
        value={value}
        onChangeText={(value) => onChange(value)}
      />
      <Text style={styles.errorText}> {error?.message} </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  error: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    opacity: 100,
  },
  errorTextErrorOccurred: {
    opacity: 0,
  },
});

export default FormInput;
