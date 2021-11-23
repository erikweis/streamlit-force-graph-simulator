import React from "react";
import ReactDOM from "react-dom";
import Graph from "./Graph";

// Lots of import to define a Styletron engine and load the light theme of baseui
import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";

const engine = new Styletron();

// Wrap your CustomSlider with the baseui light theme
ReactDOM.render(
  <React.StrictMode>
    <StyletronProvider value={engine}>
      <Graph />
    </StyletronProvider>
  </React.StrictMode>,
  document.getElementById("root")
);