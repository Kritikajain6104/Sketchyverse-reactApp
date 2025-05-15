import { createContext } from "react";

const toolContext = createContext({
  toolBoxState: {},
  changeFillHandler: () => {},
  changeStrokeHandler: () => {},
  changeSize: () => {},
});

export default toolContext;
