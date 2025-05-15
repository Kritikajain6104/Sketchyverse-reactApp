import { useReducer } from "react";
import boardContext from "./board-context";
import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/element";
import { isPointNearElement } from "../utils/element";
import {
  TOOL_ITEMS,
  TOOL_ACTION_TYPES,
  BOARD_ACTIONS,
  FILL_TOOL_TYPES,
} from "../constants";
import { createRoughElement } from "../utils/element";
import { useCallback } from "react";

const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL:
      return {
        ...state,
        activeToolItem: action.payload.tool,
      };
    case BOARD_ACTIONS.DRAW_DOWN: {
      const { clientX, clientY, strokecolor, fillcolor, size } = action.payload;
      const tool_item = state.activeToolItem;
      const id = state.elements.length + 1;
      if (tool_item === TOOL_ITEMS.ERASER) {
        return state;
      }
      const newEle = createRoughElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        {
          type: tool_item,
          strokecolor,
          fillcolor,
          size,
        }
      );

      return {
        ...state,
        toolActionType:
          tool_item === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
        elements: [...state.elements, newEle],
      };
    }

    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;
      const newElements = [...state.elements];
      const index = state.elements.length - 1;
      const { type } = newElements[index];
      switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          const { x1, y1, strokecolor, fillcolor, size } = newElements[index];
          const newElement = createRoughElement(
            index,
            x1,
            y1,
            clientX,
            clientY,
            {
              type: state.activeToolItem,
              strokecolor,
              fillcolor,
              size,
            }
          );
          newElements[index] = newElement;
          return {
            ...state,
            elements: newElements,
          };
        case TOOL_ITEMS.BRUSH:
          newElements[index].points = [
            ...newElements[index].points,
            { x: clientX, y: clientY },
          ];
          newElements[index].path = new Path2D(
            getSvgPathFromStroke(getStroke(newElements[index].points))
          );

          return {
            ...state,
            elements: newElements,
          };
        default:
          throw new Error("Type not recognized");
      }
    }
    case BOARD_ACTIONS.CHANGE_ACTION_TYPE: {
      return {
        ...state,
        toolActionType: action.payload.actionType,
      };
    }
    case BOARD_ACTIONS.ERASE: {
      let newElements = [...state.elements];
      const { clientX, clientY } = action.payload;
      newElements = newElements.filter((element) => {
        const result = isPointNearElement(element, clientX, clientY);
        return !result;
      });
      const newHistory = state.history.slice(0, state.hisIndex + 1);
      newHistory.push(newElements);

      return {
        ...state,
        elements: newElements,
        history: newHistory,
        hisIndex: state.hisIndex + 1,
      };
    }
    case BOARD_ACTIONS.CHANGE_TEXT:
      let newElements = [...state.elements];
      const index = newElements.length - 1;
      newElements[index].text = action.payload.text;
      const newHistory = state.history.slice(0, state.hisIndex + 1);
      newHistory.push(newElements);
      return {
        ...state,
        toolActionType: TOOL_ACTION_TYPES.NONE,
        elements: newElements,
        history: newHistory,
        hisIndex: state.hisIndex + 1,
      };
    case BOARD_ACTIONS.DRAW_UP: {
      const elementsCopy = [...state.elements];
      const newHistory = state.history.slice(0, state.hisIndex + 1);
      newHistory.push(elementsCopy);
      return {
        ...state,
        history: newHistory,
        hisIndex: state.hisIndex + 1,
      };
    }
    case BOARD_ACTIONS.UNDO: {
      let index = state.hisIndex,
        newElements = state.elements;
      if (state.hisIndex > 0) {
        index = state.hisIndex - 1;
        newElements = state.history[index];
      }

      return { ...state, hisIndex: index, elements: newElements };
    }
    case BOARD_ACTIONS.REDO: {
      let index = state.hisIndex,
        newElements = state.elements;
      if (state.hisIndex < state.history.length - 1) {
        index = state.hisIndex + 1;
        newElements = state.history[index];
      }

      return { ...state, hisIndex: index, elements: newElements };
    }

    default:
      return state;
  }
};

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,
  elements: [],
  history: [[]],
  hisIndex: 0,
  toolActionType: TOOL_ACTION_TYPES.NONE,
};
function BoardProvider({ children }) {
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );

  function changeToolHandler(tool) {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: {
        tool,
      },
    });
  }
  function handleBoardMouseDown(event, toolBoxState) {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) {
      return;
    }

    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING,
        },
      });
      return;
    }
    const clientX = event.clientX;
    const clientY = event.clientY;
    const activeTool = boardState.activeToolItem;
    const strokecolor = toolBoxState[activeTool]?.stroke;
    const fillcolor =
      toolBoxState && activeTool && FILL_TOOL_TYPES.includes(activeTool)
        ? toolBoxState[activeTool]?.fill
        : null;
    const size = toolBoxState[activeTool]?.size;

    dispatchBoardAction({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        strokecolor,
        fillcolor,
        size,
      },
    });
  }
  function handleBoardMouseMove(event) {
    const clientX = event.clientX;
    const clientY = event.clientY;

    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING)
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: {
          clientX,
          clientY,
        },
      });
    else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.ERASE,
        payload: {
          clientX,
          clientY,
        },
      });
    }
  }
  function handleBoardMouseUp() {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_UP,
        payload: {
          element: boardState.elements,
        },
      });
    }

    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE,
      },
    });
  }
  function textAreaBlurHandler(text) {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
      },
    });
  }
  const undoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.UNDO,
    });
  }, []);

  const redoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.REDO,
    });
  }, []);
  const BoardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    changeToolHandler,
    handleBoardMouseDown,
    handleBoardMouseMove,
    handleBoardMouseUp,
    textAreaBlurHandler,
    undoHandler,
    redoHandler,
  };
  return (
    <boardContext.Provider value={BoardContextValue}>
      {children}
    </boardContext.Provider>
  );
}

export default BoardProvider;
