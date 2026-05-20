import { useEffect, useRef } from 'react'

export default function DustParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let particles = []
    let animationId

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    class Particle {
      constructor() {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.size = Math.random() * 1.5 + 0.5
        this.speedX = Math.random() * 0.4 - 0.2
        this.speedY = Math.random() * -0.4 - 0.1
        this.opacity = Math.random() * 0.4 + 0.1
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.y < -10) this.y = h + 10
        if (this.x < -10) this.x = w + 10
        if (this.x > w + 10) this.x = -10
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function init() {
      particles = []
      const count = Math.floor((w * h) / 15000)
      for (let i = 0; i < count; i++) particles.push(new Particle())
    }

    function animate() {
      ctx.clearRect(0, 0, w, h)
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      init()
    }

    window.addEventListener('resize', handleResize)
    init()
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] w-full h-full opacity-60"
    />
  )
}
