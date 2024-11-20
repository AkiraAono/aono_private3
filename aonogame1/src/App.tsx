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
// ゲームの状態
let gameState: GameState = GameState.PLAYING;

// 全てのマインの数。まだ開いてないものも含む。ゲームクリアの判定に使用する。
let allMineCount: number;

// 開いているマスの数。ゲームクリアの判定に使用する。
let allOpenedMasuCount: number = 0;

// マスのプロパティ
class MasuProps {
  isOpened: boolean = false;  // 開いているか
  isMine: boolean = false;     // マインか
  nearMineCount: number = 0;   // 周囲のマインの数
};
let board: MasuProps[][];


// マスのコンポーネント
function Masu(props: { row: number; column: number; callback: (row: number, column: number) => void }) {

  let prop: MasuProps = board[props.row][props.column];

  // このマスが開いていない時は空白のボタンを表示する
  if (prop.isOpened === false) {
    return (
      <button onClick={() => {
        props.callback(props.row, props.column);
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

  // このマスが開いており、かつマインではないなら、周囲のマイン数を表示する
  return (
    <button disabled={true}>
      {prop.nearMineCount}
    </button>
  );
  
}

// マスをクリックした時の処理
function OnMasuClick(row: number, column: number) {

  board[row][column].isOpened = true;

  if (board[row][column].isMine === true) {
    gameState = GameState.GAMEOVER;
  } else if (++allOpenedMasuCount >= BOARD_SIZE * BOARD_SIZE - allMineCount) {
    gameState = GameState.CLEAR;
  }

  // もし今開いたマスがゼロのマスなら、隣接するマスも開く
  if (board[row][column].nearMineCount != 0) {
    return;
  }

  for (let i = -1; i <= 1; i++) {
    if (row + i < 0 || row + i >= board.length) { continue; }
    for (let j = -1; j <= 1; j++) {
      if (column + j < 0 || column + j >= board[row].length) { continue; }
      if (board[row + i][column + j].isOpened === false) {
        OnMasuClick(row + i, column + j);
      }
    }
  }
}

// ゲームを初期化する 
function initGame() {

  allOpenedMasuCount = 0;

  allMineCount = 0;

  board = new Array<Array<MasuProps>>(BOARD_SIZE);

  for (let i = 0; i < board.length; i++) {
    board[i] = new Array<MasuProps>(BOARD_SIZE);
    for (let j = 0; j < board[i].length; j++) {
      board[i][j] = new MasuProps();
      board[i][j].isMine = Math.random() < MINE_RATE;
      if (board[i][j].isMine === true) {
        allMineCount++;
      }
    }
  }

  // 隣接するマインの数を数える
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      board[i][j].nearMineCount = countNearMine(i, j);
    }
  } 
}


// row, column で指定したひとつのマスについて隣接するマインの数を数える関数
function countNearMine(row: number, column: number) {

  let nearMineCount: number = 0;

  for (let i = -1; i <= 1; i++) {
    if (row + i < 0 || row + i >= board.length) { continue; }
    for (let j = -1; j <= 1; j++) {
      if (column + j < 0 || column + j >= board[row].length) { continue; }
      if (board[row + i][column + j].isMine === true) {
        nearMineCount++;
      }
    }
  }
  return nearMineCount;
}


// メインのコンポーネント
function App() {

  console.log("IN APP");

  // ボードが未初期化なら初期化する
  if (board === undefined) {
    initGame();
  }

  // 1回クリックごとにカウントを増やしステートを更新する
  const [stateCount, AddStateCount] = useState<number>(0);

  // マスをクリックした時のステート変更処理
  function AddCountCallback(row: number, column: number) {
    AddStateCount(stateCount + 1);
    OnMasuClick(row, column);
  }

  // ボードを表示する。BOARD_SIZE * BOARD_SIZE の格子内に Masu コンポーネントを配置する。
  return (
    <div>
      <div>
        全部で{allMineCount}個のマインがあるよ。
      </div>
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
