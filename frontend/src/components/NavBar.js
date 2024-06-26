import * as React from "react";
import { useStyletron } from "baseui";
import { Button } from "baseui/button";
import { Layer } from "baseui/layer";
import { ChevronDown, Delete, Overflow, Upload } from "baseui/icon";
import { AppNavBar, setItemActive, NavItem } from "baseui/app-nav-bar";
import { useState } from "react";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-monolithic";
import { DarkTheme, BaseProvider, styled } from "baseui";
import { FileUploader } from "baseui/file-uploader";

const engine = new Styletron();

export default function Example() {
  const [css] = useStyletron();

  const [mainItems, setMainItems] = useState([
    { icon: Upload, label: "Primary A" },
    { icon: Upload, label: "Primary B" },
    {
      icon: ChevronDown,
      label: "Primary C",
      navExitIcon: Delete,
      children: [
        { icon: Upload, label: "Secondary A" },
        { icon: Upload, label: "Secondary B" },
        { icon: Upload, label: "Secondary C" },
        { icon: Upload, label: "Secondary D" },
      ],
    },
    {
      icon: ChevronDown,
      label: "Primary D",
      navExitIcon: Delete,
      children: [
        {
          icon: ChevronDown,
          label: "Secondary E",
          children: [
            { icon: Upload, label: "Tertiary A" },
            { icon: Upload, label: "Tertiary B" },
          ],
        },
        { icon: Upload, label: "Secondary F" },
      ],
    },
  ]);
  const userItems = [
    { icon: Overflow, label: "Account item1" },
    { icon: Overflow, label: "Account item2" },
    { icon: Overflow, label: "Account item3" },
    { icon: Overflow, label: "Account item4" },
  ];

  const [isNavVisible, setIsNavVisible] = React.useState(false);

  function handleMainItemSelect(item) {
    setMainItems((prev) => setItemActive(prev, item));
  }

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={DarkTheme}></BaseProvider>
      <Button onClick={() => setIsNavVisible((prev) => !prev)}>
        {isNavVisible ? "Hide" : "Show"} navigation bar
      </Button>
      {isNavVisible && (
        <Layer>
          <div
            className={css({
              boxSizing: "border-box",
              width: "100vw",
              position: "fixed",
              top: "0",
              left: "0",
            })}
          >
            <AppNavBar
              title="Uber Something"
              mainItems={mainItems}
              userItems={userItems}
              onMainItemSelect={handleMainItemSelect}
              onUserItemSelect={(item) => console.log("user", item)}
              username="Umka Marshmallow"
              usernameSubtitle="5.0"
              userImgUrl=""
            />
          </div>
        </Layer>
      )}
    </StyletronProvider>
  );
}
