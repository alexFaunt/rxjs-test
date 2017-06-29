// import Rx from 'rxjs-es'
import { Observable } from 'rxjs-es/Observable'
import { Scheduler } from 'rxjs-es/Scheduler'
import 'rxjs-es/add/observable/interval'
import 'rxjs-es/add/operator/map'
import 'rxjs-es/add/operator/scan'

const TICKER_INTERVAL = 17;
export default Observable
  .interval(TICKER_INTERVAL, Scheduler.requestAnimationFrame)
  .map(() => ({
    time: Date.now(),
    deltaTime: null
  }))
  .scan((previous, current) => ({
    time: current.time,
    deltaTime: (current.time - previous.time) / 1000
  }));
