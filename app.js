import { Observable } from 'rxjs-es/Observable'
import 'rxjs-es/add/observable/combineLatest'
import 'rxjs-es/add/observable/fromEvent'
import 'rxjs-es/add/observable/merge'
import 'rxjs-es/add/operator/sampleTime'
import 'rxjs-es/add/operator/distinctUntilChanged'

import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, SPACEBAR } from './keys'
import { LEFT, RIGHT, UP, DOWN } from './directions'
import ticker$ from './ticker'

const canvas = document.getElementById('stage')
const context = canvas.getContext('2d')

const GREEN = '#1ec503'
const PLAYER_COLOUR = 'yellow'
const PLAYER_RADIUS = 10
const PLAYER_SPEED = 100
const PLAYER_START = { x: 100, y: 100 }
const BOARD_WIDTH = 28
const STARTING_ROW = []
const STARTING_BOARD = []
STARTING_ROW.length = BOARD_WIDTH
STARTING_BOARD.length = BOARD_WIDTH
STARTING_ROW.fill(null, 0, BOARD_WIDTH)
STARTING_BOARD.fill(STARTING_ROW, 0, BOARD_WIDTH)

function drawBoard () {
  canvas.width = 480
  canvas.height = 480
  Object.assign(canvas.style, {
    background: 'black',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate3d(-50%, -50%, 0)',
    border: `1px solid ${GREEN}`
  })
}

function writeText(text, size, x, y) {
  context.fillStyle = GREEN
  context.textAlign = 'center'
  context.font = `${size}px Courier New`
  context.fillText(text, x, y)
}

function drawTitle() {
  writeText('Pac man!', 36, canvas.width / 2, canvas.height / 2 - 41)
}

function drawStartMessage() {
  writeText('[press an arrow key to start]', 24, canvas.width / 2, canvas.height / 2 + 5)
}

function removeItem(array, item) {
  const copy = [...array]
  copy.splice(copy.indexOf(item), 1)
  return copy
}

function unshift(array, item) {
  const copy = [...array]
  copy.unshift(item)
  return copy
}

function drawPlayer({ x, y }) {
  context.fillStyle = PLAYER_COLOUR
  context.beginPath()
  context.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2)
  context.fill()
  context.closePath()
}


const DIRECTION_KEYS = [UP_ARROW, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW]
/* inputs */
const direction$ = Observable
  .merge(
    Observable.fromEvent(document, 'keydown', (event) => {
      return (DIRECTION_KEYS.includes(event.keyCode)) ? event.keyCode : null
    }),
    Observable.fromEvent(document, 'keyup', (event) => {
      return (DIRECTION_KEYS.includes(event.keyCode)) ? -event.keyCode : null
    })
  )
  .distinctUntilChanged()
  .scan((prev, curr) => {
    if (curr > 0) return prev.includes(curr) ? prev : [curr].concat(prev)
    if (curr < 0) return removeItem(prev, -curr)
    return prev
  }, [])
  .scan((prev, curr) => {
    switch (curr[0]) {
      case UP_ARROW:
        return UP
      case LEFT_ARROW:
        return LEFT
      case DOWN_ARROW:
        return DOWN
      case RIGHT_ARROW:
        return RIGHT
      default:
        return null
    }
  }, null)
  .scan((prev, curr) => (curr || prev), null)
  .distinctUntilChanged()

const player$ = Observable
  .combineLatest(ticker$, direction$)
  .scan((prev, [{ deltaTime }, direction]) => {
    const { x, y } = prev
    switch (direction) {
      case UP:
        return { x, y: y - (deltaTime * PLAYER_SPEED) }
      case DOWN:
        return { x, y: y + (deltaTime * PLAYER_SPEED) }
      case LEFT:
        return { x: x - (deltaTime * PLAYER_SPEED), y }
      case RIGHT:
        return { x: x + (deltaTime * PLAYER_SPEED), y }
      default:
        return prev
    }
  }, PLAYER_START)
  .distinctUntilChanged()

const board$ = player$
  // .combineLatest(ticker$, player$)
  .scan((prev, { x, y }) => {
    console.log(prev)
    throw new Error('win')
    return prev
  }, STARTING_BOARD)


drawBoard()
drawTitle()
drawStartMessage()

const game$ = Observable
  .combineLatest(player$, board$)
  .sampleTime(17)
  .scan((prev, player) => ({
    player,
    started: player !== PLAYER_START
  }))

let subscription = game$.subscribe(render)

function render({ started, player }) {
  // This is a hack because I can't get it to fucking work.
  // As soon as i press any key the subscription fires - it shouldn't as theres no player change
  if (!started) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer(player)
}
