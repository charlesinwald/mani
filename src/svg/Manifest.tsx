import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';

function ManifestIcon(props: any) {
  return (
    <Svg
      width={43}
      height={42}
      viewBox="0 0 43 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <G
        clipPath="url(#clip0_209_804)"
        stroke="#000001"
        strokeWidth={2.31353}
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M14 39c6.627 0 12-5.373 12-12s-5.373-12-12-12S2 20.373 2 27s5.373 12 12 12z" />
        <Path d="M29 39c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12z" />
        <Path d="M21.5 27c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12z" />
      </G>
      <Defs>
        <ClipPath id="clip0_209_804">
          <Path fill="#fff" transform="translate(.5)" d="M0 0H42V42H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default ManifestIcon;
