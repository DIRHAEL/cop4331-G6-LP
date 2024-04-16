import * as React from "react";

import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import { DarkTheme, BaseProvider, styled } from "baseui";
import {
  ProgressSteps,
  NumberedStep,
  ORIENTATION,
} from "baseui/progress-steps";
import { Button, SHAPE, ButtonProps, KIND, SIZE } from "baseui/button";

import { useState } from "react";

const engine = new Styletron();

function ProgressStepsContainer({ currentStep }) {
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={DarkTheme}>
        <ProgressSteps
          current={currentStep}
          orientation={ORIENTATION.horizontal}
        >
          <NumberedStep title="Insert Pin"></NumberedStep>
          <NumberedStep title="Add Images"></NumberedStep>
          <NumberedStep title="Submit"></NumberedStep>
        </ProgressSteps>
      </BaseProvider>
    </StyletronProvider>
  );
}

export default ProgressStepsContainer;
