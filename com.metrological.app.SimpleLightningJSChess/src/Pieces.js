import { Lightning } from '@lightningjs/sdk'

export class Piece extends Lightning.Component {
  _select() {
    this.selected = true
    this.tag('Image').patch({
      smooth: {
        scale: 1.4,
        y: -50,
      },
      shader: { type: Lightning.shaders.Inversion },
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

// Generate a class for every chess piece
const classNameToFileName = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
const figures = ['Pawn', 'Bishop', 'King', 'Knight', 'Rook', 'Queen', 'King']
const colors = ['Black', 'White']
const pieceKeys = figures.flatMap(figure => colors.map(color => `${figure}${color}`))

export const Pieces = pieceKeys.reduce(
  (prev, curr) => ({
    ...prev,
    [curr]: class extends Piece {
      static _template() {
        return {
          rect: true,
          Image: {
            mountY: 0.5,
            mountX: 0.25,
            zIndex: 1,
            src: `./static/images/figures/chess${classNameToFileName(curr)}.png`,
            shader: null,
          },
        }
      }
    },
  }),
  {}
)
