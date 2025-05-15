import "./App.css";

import Board from "./components/Board";
import Toolbar from "./components/Toolbar";
import ToolBox from "./components/ToolBox";
import BoardProvider from "./store/BoardProvider";
import ToolBoxProvider from "./store/ToolBoxProvider";
function App() {
  return (
    <>
      <BoardProvider>
        <ToolBoxProvider>
          <ToolBox />
          <Board />
          <Toolbar />
        </ToolBoxProvider>
      </BoardProvider>
    </>
  );
}

export default App;
