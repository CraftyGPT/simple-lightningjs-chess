/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Lightning, Utils } from '@lightningjs/sdk'
import { Pieces, Piece } from './Pieces'

const ChessboardFiles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ChessboardRanks = ['1', '2', '3', '4', '5', '6', '7', '8']
const ChessboardSquares = ChessboardFiles.map(file =>
  ChessboardRanks.map(rank => [file, rank].join(''))
).flat(1)

const IsometricSquareWidth = 124
const IsometricSquareHeight = 60
const IsometricMapOffsetX = 512
const IsometricMapOffsetY = 256

export default class App extends Lightning.Component {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {
    return {
      ChessBoard: {
        rect: true,
      },
    }
  }

  _init() {
    this.index = 0
    this.selected = null
    this.dataLength = ChessboardSquares.length
    const squares = ChessboardSquares.reduce((prev, value, i) => {
      const x = ChessboardFiles.indexOf(value[0])
      const ranks = [...ChessboardRanks]
      ranks.reverse()
      const y = ranks.indexOf(value[1])

      return {
        ...prev,
        [value]: {
          x: IsometricMapOffsetX + Math.round(((x - y) * IsometricSquareWidth) / 2),
          y: IsometricMapOffsetY + Math.round(((x + y) * IsometricSquareHeight) / 2),
          w: IsometricSquareWidth,
          h: IsometricSquareHeight,
          zIndex: y,
          i: i,
          type: i % 2 !== x % 2 ? DarkSquare : LightSquare,
          // color: i % 2 !== x % 2 ? 0xff000000 : 0xffffffff,
          color: 0x00000000,
          label: value,
        },
      }
    }, {})
    this.tag('ChessBoard').children = squares
    this.__addFigures()
  }

  __addFigures() {
    const pieces = {
      PawnBlack: ChessboardFiles.map(file => `${file}7`),
      PawnWhite: ChessboardFiles.map(file => `${file}2`),
      RookBlack: ['A8', 'H8'],
      RookWhite: ['A1', 'H1'],
      KnightBlack: ['B8', 'G8'],
      KnightWhite: ['B1', 'G1'],
      BishopBlack: ['C8', 'F8'],
      BishopWhite: ['C1', 'F1'],

      QueenBlack: ['D8'],
      QueenWhite: ['D1'],
      KingBlack: ['E8'],
      KingWhite: ['E1'],
    }

    Object.keys(pieces).forEach(piece => {
      console.log(piece)
      const coords = pieces[piece]
      coords.forEach(coord => {
        const square = this.tag('ChessBoard').childList.getByRef(coord)
        square.childList.add({ type: Pieces[piece] })
      })
    })
  }

  _handleEnter() {
    if (!this.selected) {
      this.selected = this.tag('ChessBoard').children[this.index]
      const piece = this.selected.children.find(child => child instanceof Piece)
      if (piece) {
        piece._select()
      }
    } else {
      const piece = this.selected.children.find(child => child instanceof Piece)

      if (piece) {
        this.selected.childList.remove(piece)
        this.selected = this.tag('ChessBoard').children[this.index]
        const existingPiece = this.selected.children.find(child => child instanceof Piece)
        this.selected.childList.remove(existingPiece)
        this.selected.childList.add(piece)
        this.selected = false
        piece._unselect()
      } else {
        this.selected = this.tag('ChessBoard').children[this.index]
      }
    }
  }

  _handleUp() {
    const [x, y] = this.tag('ChessBoard').children[this.index].ref
    const index = ChessboardRanks.indexOf(y)
    const nextIndex = index + 1 >= ChessboardRanks.length ? 0 : index + 1
    const ref = `${x}${ChessboardRanks[nextIndex]}`

    this.index = this.tag('ChessBoard').children.findIndex(child => child.ref === ref)
  }

  _handleDown() {
    const [x, y] = this.tag('ChessBoard').children[this.index].ref
    const index = ChessboardRanks.indexOf(y)
    const nextIndex = index - 1 < 0 ? ChessboardRanks.length - 1 : index - 1
    const ref = `${x}${ChessboardRanks[nextIndex]}`

    this.index = this.tag('ChessBoard').children.findIndex(child => child.ref === ref)
  }

  _handleLeft() {
    const [x, y] = this.tag('ChessBoard').children[this.index].ref
    const index = ChessboardFiles.indexOf(x)
    const nextIndex = index - 1 < 0 ? ChessboardFiles.length - 1 : index - 1
    const ref = `${ChessboardFiles[nextIndex]}${y}`

    this.index = this.tag('ChessBoard').children.findIndex(child => child.ref === ref)
  }

  _handleRight() {
    const [x, y] = this.tag('ChessBoard').children[this.index].ref
    const index = ChessboardFiles.indexOf(x)
    const nextIndex = index + 1 >= ChessboardFiles.length ? 0 : index + 1
    const ref = `${ChessboardFiles[nextIndex]}${y}`

    this.index = this.tag('ChessBoard').children.findIndex(child => child.ref === ref)
  }

  _getFocused() {
    return this.tag('ChessBoard').children[this.index]
  }
}

class Square extends Lightning.Component {
  static _template() {
    return {
      w: 128,
      h: 64,
      rect: true,
      Label: {
        y: h => h / 2,
        mount: 0.5,
        color: 0xffffffff,
        text: { fontSize: 16 },
      },
    }
  }
  set label(value) {
    this.tag('Label').text = value.toString()
  }

  _focus() {
    this.patch({
      shader: { type: Lightning.shaders.Inversion },
    })

    this.children.forEach(child => (child._focus ? child._focus() : false))
  }

  _unfocus() {
    this.patch({
      shader: null,
    })
    this.children.forEach(child => (child._unfocus ? child._unfocus() : false))
  }
}

class LightSquare extends Square {
  static _template() {
    return {
      w: 128,
      h: 64,
      rect: true,
      Image: {
        mount: 0,
        w: 128,
        h: 64,
        src: './static/images/tile_light.png',
      },
      Label: {
        y: h => h / 2,
        mountX: -2.5,
        mountY: 0.5,
        color: 0xffffffff,
        text: { fontSize: 16 },
      },
    }
  }
}

class DarkSquare extends Square {
  static _template() {
    return {
      w: 128,
      h: 64,
      rect: true,
      Image: {
        mount: 0,
        w: 128,
        h: 64,
        src: './static/images/tile_dark.png',
      },
      Label: {
        y: h => h / 2,
        mountX: -2.5,
        mountY: 0.5,
        color: 0xffffffff,
        text: { fontSize: 16 },
      },
    }
  }
}
