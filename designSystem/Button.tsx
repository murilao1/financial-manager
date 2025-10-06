import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as ButtonPaper } from 'react-native-paper';

type AppButtonProps = React.ComponentProps<typeof Button>;

export default function Button(props: AppButtonProps) {
  return (
    <ButtonPaper
      {...props}
      style={[styles.button, props.style]}
      contentStyle={[styles.buttonContent, props.contentStyle]}
    >
      {props.children}
    </ButtonPaper>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 'auto',
    borderRadius: 8,
  },
  buttonContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
