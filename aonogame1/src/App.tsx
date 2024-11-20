import { useState } from "react";

import "./App.css";

// ボードのサイズ(縦と横)
const BOARD_SIZE: number = 5;

// マインの確率(0.0〜1.0)
const MINE_RATE: number = 0.200;

// ゲームの状態
enum GameState {
  PLAYING,
  CLEAR,
  GAMEOVER,
}

let gameState: GameState = GameState.PLAYING;

// マスのプロパティ
class MasuProps {
  isOpened: boolean = false;  // 開いているか
  isMine: boolean = false;     // マインか
};
let board: MasuProps[][];


// マスのコンポーネント
function Masu(props: { row: number; column: number; callback: () => void }) {

  let prop: MasuProps = board[props.row][props.column];

  // このマスが開いていない時は空白のボタンを表示する
  if (prop.isOpened === false) {
    return (
      <button onClick={() => {
        prop.isOpened = true;
        props.callback();
      }}>
        {'　'}
      </button>
    );
  }

  // このマスが開いておりマインなら爆弾を表示
  if (prop.isMine === true) {
    return (
      <button disabled={true}>
        {'×'}
      </button>
    );
  }

  // このマスが開いており、かつマインではないなら、周囲のマインを数えて表示する
  let mineCount: number = 0;

  for (let i = -1; i <= 1; i++) {
    if (props.row + i < 0 || props.row + i >= board.length) { continue; }
    for (let j = -1; j <= 1; j++) {
      if (props.column + j < 0 || props.column + j >= board[props.row].length) { continue; }
      if (board[props.row + i][props.column + j].isMine === true) {
        mineCount++;
      }
    }
  }

  return (
    <button disabled={true}>
      {mineCount}
    </button>
  );
}

function OnMasuClick(row: number, column: number) {

}

// ボードを初期化する。
function initBoard() {

  board = new Array<Array<MasuProps>>(BOARD_SIZE);

  for (let i = 0; i < board.length; i++) {
    board[i] = new Array<MasuProps>(BOARD_SIZE);
    for (let j = 0; j < board[i].length; j++) {
      board[i][j] = new MasuProps();
      board[i][j].isMine = Math.random() < MINE_RATE;
    }
  }
}

// メインのコンポーネント
function App() {

  console.log("IN APP");

  // ボードが未初期化なら初期化する
  if (board === undefined) {
    initBoard();
  }

  // 1回クリックごとにカウントを増やしステートを更新する
  const [stateCount, AddStateCount] = useState<number>(0);

  // マスをクリックした時のステート変更処理
  function AddCountCallback() {
    AddStateCount(stateCount + 1);
  }

  // ボードを表示する。BOARD_SIZE * BOARD_SIZE の格子内に Masu コンポーネントを配置する。
  return (
    <div>
      <table>
        <tbody>
          {board.map((row, i) => (
            <tr>
              {row.map((column, j) => (
                <td>
                  <Masu row={i} column={j} callback={AddCountCallback} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {gameState === GameState.GAMEOVER && <div>死んだ</div>}
      {gameState === GameState.CLEAR && <div>どうやら生き延びたようだ……。少なくとも今のところは。</div>}
    </div>
  );
}

export default App;
