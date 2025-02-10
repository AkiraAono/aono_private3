import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";

import "./App.css";

// ボードのサイズ(縦と横)
let BOARD_SIZE: number = 5;

// マインの確率(0.0〜1.0)
const MINE_RATE: number = 0.150;

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
  isFlag: boolean = false;    // 旗が立っているか
  nearMineCount: number = 0;   // 周囲のマインの数
};
let board: MasuProps[][];


// マスのコンポーネント
function Masu(props: {
  row: number;
  column: number;
  callback: (row: number, column: number) => void;
  onContextMenu: (row: number, column: number) => void;
}) {

  let prop: MasuProps = board[props.row][props.column];

  // ゲームクリア後の処理・・マインのますに丸をつける
  if (gameState === GameState.CLEAR) {
    if (prop.isMine === true) {
      return (
        <button disabled={true} className="button-masu">
          {'💣'}
        </button>
      );
    }
  }

  // このマスが開いていない時は空白のボタンまたは旗を表示する
  if (prop.isOpened === false) {
    return (
      <button
        disabled={gameState !== GameState.PLAYING}
        onClick={() => {
          props.callback(props.row, props.column);
        }}
        onContextMenu={(e) => {
          e.preventDefault();  // デフォルトのコンテキストメニューを防ぐ
          props.onContextMenu(props.row, props.column);
        }}
        className="button-masu"
      >
        {prop.isFlag ? '🚩' : '　'}
      </button>
    );
  }

  // このマスが開いておりマインなら爆弾を表示
  if (prop.isMine === true) {
    return (
      <button disabled={true} className="button-masu">
         {'🔥'}
      </button>
    );
  }

  // このマスが開いており、かつマインではないなら、周囲のマイン数を表示する
  return (
    <button disabled={true} className="button-masu" >
      {prop.nearMineCount}
    </button>
  );

}

// マスをクリックした時の処理
function OnMasuClick(row: number, column: number) {
  // 最初のクリック時にマインを配置する
  if (allOpenedMasuCount === 0) {
    InitGame(row, column);
  }

  board[row][column].isOpened = true;

  if (board[row][column].isMine === true) {
    gameState = GameState.GAMEOVER;
  } else if (++allOpenedMasuCount >= BOARD_SIZE * BOARD_SIZE - allMineCount) {
    gameState = GameState.CLEAR;
  }

  // もし今開いたマスがゼロのマスなら、隣接するマスも開く
  if (board[row][column].nearMineCount !== 0) {
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

// 右クリックで旗を立てる/外す処理
function OnMasuRightClick(row: number, column: number) {
  if (!board[row][column].isOpened && gameState === GameState.PLAYING) {
    board[row][column].isFlag = !board[row][column].isFlag;
  }
}

// ゲームを初期化する 
function InitGame(excludeRow?: number, excludeColumn?: number) {
  allOpenedMasuCount = 0;
  allMineCount = 0;
  gameState = GameState.PLAYING;

  board = new Array<Array<MasuProps>>(BOARD_SIZE);

  // ボードの初期化
  for (let i = 0; i < board.length; i++) {
    board[i] = new Array<MasuProps>(BOARD_SIZE);
    for (let j = 0; j < board[i].length; j++) {
      board[i][j] = new MasuProps();
    }
  }

  // マインの配置（最初にクリックしたマスを除外）
  if (excludeRow !== undefined && excludeColumn !== undefined) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        // 最初にクリックしたマスにはマインを配置しない
        if (i !== excludeRow || j !== excludeColumn) {
          board[i][j].isMine = Math.random() < MINE_RATE;
          if (board[i][j].isMine === true) {
            allMineCount++;
          }
        }
      }
    }

    // 隣接するマインの数を数える
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        board[i][j].nearMineCount = CountNearMine(i, j);
      }
    }
  }
}


// row, column で指定したひとつのマスについて隣接するマインの数を数える関数
function CountNearMine(row: number, column: number) {

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

// ランダムでクリア後のメッセージを表示する

function ShowClearMessage(): React.ReactNode {
  const messages = [
    "どうやら生き延びたようだ。\n少なくとも今のところは。",
    "死すべき運命に抗う者は\nどのような逆境にも屈することはない。",
    "ただ目の前の道を歩けば\nそれが最短の道であることを\n忘れてはならない。",
    "それでも生き延びたならば、\nそれはあなたの力だ。",
    "あなたはまだ生きている。\nただそれだけが真実である。",
    "何事にも屈しない意志こそが\n目の前の道を歩く者の\n唯一の力である。",
    "安堵の時が訪れる…。\nさあ、家に帰ろう。",
    "今はまだ死すべき時ではない。\n運命は自らの手で切り開くものだ。",
    "この荒廃した世界でも、\n希望を持つことはできる。",
    "命の灯火が、まだ残っている。\nそれを信じて歩け。",
    "最後に見たあの夢を\n忘れることはできない。\nいつまでも……。",
    "死を覚悟した時こそ、\n生きることの意味がわかるのだ。",
    "祝杯をあげよう。\nかつて生きた、友のために。",
    "彼方の空へと飛び立つその翼は\nあなたの魂をつなぐ糸である。",
    "これは終わりではない。\nまだ始まったばかりだ。",
    "生き延びようと足掻く者だけが\n明日への道を見つけることができる。",
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  return <div style={{ whiteSpace: 'pre-line' }}>{message}</div>;
}

// メインのコンポーネント
function App() {

  // ボードが未初期化なら初期化する
  if (board === undefined) {
    InitGame();
  }

  // URL からボードのサイズを取得する
  let urlBoardSize: number = parseInt(new URLSearchParams(useLocation().search).get('boardsize') ?? '5');

  // URL のボードサイズが現在のボードサイズと違うなら、ボードを再初期化する
  if (urlBoardSize !== BOARD_SIZE) {
    BOARD_SIZE = urlBoardSize;
    InitGame();
  }

  // 1回クリックごとにカウントを増やしステートを更新する
  const [stateCount, AddStateCount] = useState<number>(0);

  // マスをクリックした時のステート変更処理
  function AddCountCallback(row: number, column: number) {
    // 旗が立っているマスは開けない
    if (!board[row][column].isFlag) {
      AddStateCount(stateCount + 1);
      OnMasuClick(row, column);
    }
  }

  // ボードを表示する。BOARD_SIZE * BOARD_SIZE の格子内に Masu コンポーネントを配置する。
  return (
    <div className="container">
      <div>
        全部で{allOpenedMasuCount === 0 ? " ??? " : allMineCount}個のマインがあるよ。
      </div>
      <table className="container">
        <tbody>
          {board.map((row, i) => (
            <tr>
              {row.map((column, j) => (
                <td>
                  <Masu
                    row={i}
                    column={j}
                    callback={AddCountCallback}
                    onContextMenu={(row, col) => {
                      OnMasuRightClick(row, col);
                      AddStateCount(stateCount + 1);  // 画面を更新するため
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {gameState === GameState.GAMEOVER && <div className="game-message">死んだ</div>}
      {gameState === GameState.CLEAR && <div className="game-message">{ShowClearMessage()}</div>}

      <p />
      <hr />
      <p />

      <div>
        <button className="button-link" onClick={() => { window.location.reload() }}>
          NEW GAME
        </button>
        <p />
        ボードのサイズを変更する<br />
        <Link to={`/?boardsize=5`} className="button-link">5 X 5</Link>
        <Link to={`/?boardsize=10`} className="button-link">10 X 10</Link>
        <Link to={`/?boardsize=15`} className="button-link">15 X 15</Link>
        <Link to={`/?boardsize=20`} className="button-link">20 X 20</Link>
      </div>
    </div>
  );
}

export default App;
