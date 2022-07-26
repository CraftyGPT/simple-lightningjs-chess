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

const ChessboardFiles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ChessboardRanks = ['1', '2', '3', '4', '5', '6', '7', '8']
const ChessboardSquares = ChessboardFiles.map(file =>
  ChessboardRanks.map(rank => [file, rank].join(''))
).flat(1)
const ChessboardSquareSize = 64

export default class App extends Lightning.Component {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {
    return {
      ChessBoard: {
        w: 512,
        h: 512,
        x: 480,
        y: 270,
        mount: 0.5,
        rect: true,
      },
    }
  }

  _init() {
    this.index = 0
    this.dataLength = ChessboardSquares.length
    const squares = ChessboardSquares.reduce((prev, value, i) => {
      const x = ChessboardFiles.indexOf(value[0])
      const ranks = [...ChessboardRanks]
      ranks.reverse()
      const y = ranks.indexOf(value[1])

      return {
        ...prev,
        [value]: {
          type: Square,
          x: x * ChessboardSquareSize,
          y: y * ChessboardSquareSize,
          w: ChessboardSquareSize,
          i: i,
          color: i % 2 !== x % 2 ? 0xff000000 : 0xffffffff,
          label: value,
        },
      }
    }, {})
    this.tag('ChessBoard').children = squares
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
      h: 64,
      w: 64,
      rect: true,
      Label: {
        y: h => h / 2,
        mountY: 0.5,
        color: 0xff000000,
        text: { fontSize: 32 },
      },
    }
  }

  set label(value) {
    this.tag('Label').text = value.toString()
  }

  _init() {
    this.originalColor = this.color
  }

  _focus() {
    this.patch({
      smooth: { color: 0xff763ffc },
      Label: {
        smooth: { color: 0xffffffff },
      },
    })
  }

  _unfocus() {
    this.patch({
      smooth: { color: this.originalColor },
      Label: {
        smooth: { color: 0xff000000 },
      },
    })
  }
}
