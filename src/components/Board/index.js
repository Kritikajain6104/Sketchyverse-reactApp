import React, { useContext, useLayoutEffect } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import rough from "roughjs/bin/rough";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolContext from "../../store/toolbox-context";
import classes from "./index.module.css";
const Board = () => {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const { toolBoxState } = useContext(toolContext);
  const {
    elements,
    toolActionType,
    handleBoardMouseDown,
    handleBoardMouseMove,
    handleBoardMouseUp,
    textAreaBlurHandler,
    undoHandler,
    redoHandler,
  } = useContext(boardContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "z") {
        undoHandler();
      } else if (event.ctrlKey && event.key === "y") {
        redoHandler();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoHandler, redoHandler]);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    let roughCanvas = rough.canvas(canvas);
    const context = canvas.getContext("2d");
    context.save();
    elements.forEach((element) => {
      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
          roughCanvas.draw(element.roughEle);
          break;
        case TOOL_ITEMS.ARROW:
          if (element.x1 === element.x2 && element.y1 === element.y2) break;
          roughCanvas.draw(element.roughEle);
          break;
        case TOOL_ITEMS.BRUSH:
          context.fillStyle = element.strokecolor;
          context.fill(element.path);
          context.restore();
          break;
        case TOOL_ITEMS.TEXT: {
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.strokecolor;
          context.textBaseline = "top";
          context.fillText(element.text, element.x1, element.y1);
          context.restore();
          break;
        }
        default:
          throw new Error("Type not recognized");
      }
    });
    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [elements]);
  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }, [toolActionType]);
  const handleMouseDown = (event) => {
    handleBoardMouseDown(event, toolBoxState);
  };
  const handleMouseMove = (event) => {
    handleBoardMouseMove(event, toolBoxState);
  };
  const handleMouseUp = () => {
    handleBoardMouseUp(elements);
  };
  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: elements[elements.length - 1]?.strokecolor,
          }}
          onBlur={(event) => textAreaBlurHandler(event.target.value)}
        />
      )}
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMoveCapture={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </>
  );
};

export default Board;
