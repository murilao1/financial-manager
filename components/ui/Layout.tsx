import React from 'react';
import { View, ViewProps } from 'react-native';

type Spacing = number | undefined;

type CommonProps = ViewProps & {
  gap?: Spacing;
  p?: Spacing;
  px?: Spacing;
  py?: Spacing;
  pt?: Spacing;
  pr?: Spacing;
  pb?: Spacing;
  pl?: Spacing;
};

function useBoxStyle({ gap, p, px, py, pt, pr, pb, pl, style }: CommonProps) {
  return [
    {
      gap,
      padding: p,
      paddingHorizontal: px,
      paddingVertical: py,
      paddingTop: pt,
      paddingRight: pr,
      paddingBottom: pb,
      paddingLeft: pl,
    },
    style,
  ];
}

export function Row(props: CommonProps) {
  const style = useBoxStyle(props);
  return (
    <View
      {...props}
      style={[{ flexDirection: 'row', alignItems: 'center' }, style]}
    />
  );
}

export function Column(props: CommonProps) {
  const style = useBoxStyle(props);
  return <View {...props} style={[{ flexDirection: 'column' }, style]} />;
}

export function Spacer({ size = 8 }: { size?: number }) {
  return <View style={{ width: size, height: size }} />;
}
