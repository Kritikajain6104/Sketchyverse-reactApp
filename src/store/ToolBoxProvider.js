import toolContext from "./toolbox-context";
import { useReducer } from "react";
import { COLORS, TOOLBOX_ACTIONS } from "../constants";
import { TOOL_ITEMS } from "../constants";
const toolBoxreducer = (state, action) => {
  switch (action.type) {
    case TOOLBOX_ACTIONS.CHANGE_STROKE: {
      const { tool, color } = action.payload;
      const newState = { ...state };
      newState[tool].stroke = color;
      return newState;
    }
    case TOOLBOX_ACTIONS.CHANGE_FILL: {
      const newState = { ...state };
      const { tool, fill } = action.payload;
      newState[tool].fill = fill;
      return newState;
    }
    case TOOLBOX_ACTIONS.CHANGE_SIZE: {
      const newState = { ...state };
      const { activeToolItem, size } = action.payload;
      newState[activeToolItem].size = size;
      return newState;
    }
    default:
      return state;
  }
};
const initialToolBoxState = {
  [TOOL_ITEMS.BRUSH]: {
    stroke: COLORS.BLACK,
  },
  [TOOL_ITEMS.LINE]: {
    stroke: COLORS.BLACK,
    size: 1,
  },
  [TOOL_ITEMS.RECTANGLE]: {
    stroke: COLORS.BLACK,
    fill: null,
    size: 1,
  },
  [TOOL_ITEMS.CIRCLE]: {
    stroke: COLORS.BLACK,
    fill: null,
    size: 1,
  },
  [TOOL_ITEMS.ARROW]: {
    stroke: COLORS.BLACK,
    size: 1,
  },
  [TOOL_ITEMS.TEXT]: {
    stroke: COLORS.BLACK,
    size: 32,
  },
};

function ToolBoxProvider({ children }) {
  const [toolboxState, dispathToolBoxActions] = useReducer(
    toolBoxreducer,
    initialToolBoxState
  );
  function changeStrokeHandler(tool, color) {
    dispathToolBoxActions({
      type: TOOLBOX_ACTIONS.CHANGE_STROKE,
      payload: {
        tool,
        color,
      },
    });
  }
  function changeFillHandler(tool, fill) {
    dispathToolBoxActions({
      type: TOOLBOX_ACTIONS.CHANGE_FILL,
      payload: {
        tool,
        fill,
      },
    });
  }
  function changeSize(activeToolItem, size) {
    dispathToolBoxActions({
      type: TOOLBOX_ACTIONS.CHANGE_SIZE,
      payload: {
        activeToolItem,
        size,
      },
    });
  }
  const ToolBoxContextValue = {
    toolBoxState: toolboxState,
    changeStrokeHandler: changeStrokeHandler,
    changeFillHandler: changeFillHandler,
    changeSize: changeSize,
  };

  return (
    <>
      <toolContext.Provider value={ToolBoxContextValue}>
        {children}
      </toolContext.Provider>
    </>
  );
}

export default ToolBoxProvider;
