import { Launch } from '@lightningjs/sdk'
import App from './App.js'

export default function() {
  document.head.innerHTML += '<style>body, html { overflow: hidden; background: black; } </style>'
  return Launch(App, ...arguments)
}
