import Lenis from 'lenis'

const lenis = new Lenis({
  autoRaf: true,
})

function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

export default lenis
