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

import { Lightning, Utils, lng } from '@lightningjs/sdk'

const ChessboardFiles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ChessboardRanks = ['1', '2', '3', '4', '5', '6', '7', '8']
const ChessboardSquares = ChessboardFiles.map(file =>
  ChessboardRanks.map(rank => [file, rank].join(''))
).flat(1)

const IsometricSquareWidth = 124
const IsometricSquareHeight = 60
const IsometricMapOffsetX = 512
const IsometricMapOffsetY = 0

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
    this.tag('ChessBoard').children[0].childList.add({ type: Pawn })
  }

  _handleEnter() {
    if (!this.selected) {
      this.selected = this.tag('ChessBoard').children[this.index]
      const piece = this.selected.children.find(child => child.constructor === Pawn)
      if (piece) {
        piece._select()
      }
    } else {
      const piece = this.selected.children.find(child => child.constructor === Pawn)

      if (piece) {
        this.selected.childList.remove(piece)
        this.selected = this.tag('ChessBoard').children[this.index]
        this.selected.childList.add(piece)
        this.selected = false
        setTimeout(() => piece._unselect(), 100)
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

class Pawn extends Lightning.Component {
  static _template() {
    return {
      rect: true,
      Image: {
        mountY: 0.5,
        mountX: 0.25,
        zIndex: 1,
        src: './static/images/figures/chess-pawn-white.png',
        shader: null,
      },
    }
  }

  _select() {
    this.selected = true
    this.tag('Image').patch({
      smooth: {
        scale: 1.4,
        y: -50,
      },
      shader: { type: lng.shaders.Inversion },
    })
  }

  _unselect() {
    this.selected = false
    this.tag('Image').patch({
      smooth: {
        scale: 1,
        y: 0,
      },
      shader: null,
    })
  }

  _focus() {
    this.tag('Image').patch({
      smooth: {
        scale: 1.2,
        y: -35,
      },
    })
  }

  _unfocus() {
    if (!this.selected) {
      this.tag('Image').patch({
        smooth: {
          scale: 1.0,
          y: 0,
        },
      })
    }
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
      shader: { type: lng.shaders.Inversion },
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
