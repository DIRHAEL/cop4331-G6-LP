import * as React from "react";

import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import { DarkTheme, BaseProvider, styled } from "baseui";
import { Button, SHAPE, ButtonProps, KIND, SIZE } from "baseui/button";

import { ModalFooter } from "@chakra-ui/react";

const engine = new Styletron();

function SpacedButton(props) {
  return (
    <Button
      {...props}
      shape={SHAPE.pill}
      kind={KIND.secondary}
      size={SIZE.compact}
      overrides={{
        BaseButton: {
          style: ({ $theme }) => ({
            marginLeft: $theme.sizing.scale200,
            marginRight: $theme.sizing.scale200,
            marginTop: $theme.sizing.scale800,
          }),
        },
      }}
    />
  );
}

function ProgressStepsContainer({
  prevButton,
  nextButton,
  prevFunction,
  nextFunction,
}) {
  return (
    <ModalFooter>
      <StyletronProvider value={engine}>
        <BaseProvider theme={DarkTheme}>
          <SpacedButton disabled={prevButton} onClick={prevFunction}>
            Previous
          </SpacedButton>
          <SpacedButton disabled={nextButton} onClick={nextFunction}>
            Next
          </SpacedButton>
        </BaseProvider>
      </StyletronProvider>
    </ModalFooter>
  );
}

export default ProgressStepsContainer;
