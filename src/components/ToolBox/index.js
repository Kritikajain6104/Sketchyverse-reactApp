import React, { useContext } from "react";
import classes from "./index.module.css";
import toolContext from "../../store/toolbox-context";
import boardContext from "../../store/board-context";
import cx from "classnames";
import {
  FILL_TOOL_TYPES,
  SIZE_TOOL_TYPES,
  STROKE_TOOL_TYPES,
  TOOL_ITEMS,
} from "../../constants";
import { COLORS } from "../../constants";
const ToolBox = () => {
  const { toolBoxState, changeStrokeHandler, changeFillHandler, changeSize } =
    useContext(toolContext);
  const { activeToolItem } = useContext(boardContext);
  const strokeColor = toolBoxState[activeToolItem]?.stroke;
  const fillColor = toolBoxState[activeToolItem]?.fill;
  const size = toolBoxState[activeToolItem]?.size;
  return (
    <div className={classes.container}>
      {STROKE_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>
            Stroke
            <div className={classes.colorsContainer}>
              <div>
                <input
                  className={classes.colorPicker}
                  type="color"
                  value={strokeColor}
                  onChange={(e) =>
                    changeStrokeHandler(activeToolItem, e.target.value)
                  }
                ></input>
              </div>
              {Object.keys(COLORS).map((k) => {
                return (
                  <div
                    key={k}
                    className={cx(classes.colorBox, {
                      [classes.activeColorBox]: strokeColor === COLORS[k],
                    })}
                    style={{ backgroundColor: COLORS[k] }}
                    onClick={() =>
                      changeStrokeHandler(activeToolItem, COLORS[k])
                    }
                  ></div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {FILL_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>
            Fill
            <div className={classes.colorsContainer}>
              {fillColor === null ? (
                <div
                  className={cx(classes.colorPicker, classes.noFillColorBox)}
                  onClick={() =>
                    changeFillHandler(activeToolItem, COLORS.BLACK)
                  }
                ></div>
              ) : (
                <div>
                  <input
                    className={classes.colorPicker}
                    type="color"
                    value={fillColor}
                    onChange={(e) =>
                      changeFillHandler(activeToolItem, e.target.value)
                    }
                  ></input>
                </div>
              )}
              <div
                className={cx(classes.colorBox, classes.noFillColorBox, {
                  [classes.activeColorBox]: fillColor === null,
                })}
                onClick={() => changeFillHandler(activeToolItem, null)}
              ></div>
              {Object.keys(COLORS).map((k) => {
                return (
                  <div
                    key={k}
                    className={cx(classes.colorBox, {
                      [classes.activeColorBox]: fillColor === COLORS[k],
                    })}
                    style={{ backgroundColor: COLORS[k] }}
                    onClick={() => changeFillHandler(activeToolItem, COLORS[k])}
                  ></div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {SIZE_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>
            {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
            <input
              type="range"
              min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
              max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
              step={1}
              value={size}
              onChange={(event) =>
                changeSize(activeToolItem, event.target.value)
              }
            ></input>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolBox;
