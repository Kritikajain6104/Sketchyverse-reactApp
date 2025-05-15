import { createContext } from "react";

const boardContext = createContext({
  activeToolItem: "",
  elements: [],
  toolActionType: "",
  history: [[]],
  hisIndex: 0,
  changeToolHandler: () => {},
  handleBoardMouseDown: () => {},
  handleBoardMouseMove: () => {},
  handleBoardMouseUp: () => {},
  undoHandler: () => {},
  redoHandler: () => {},
});

export default boardContext;
