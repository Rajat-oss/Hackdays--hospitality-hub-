import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(ScrollTrigger, TextPlugin)

export { gsap, ScrollTrigger }

export const fadeUpAnimation = (element: string | Element, delay = 0) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 60 },
    { opacity: 1, y: 0, duration: 0.8, delay, ease: 'power3.out' }
  )
}

export const staggerChildren = (parent: string | Element, staggerTime = 0.1) => {
  return gsap.fromTo(
    `${parent} > *`,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.7, stagger: staggerTime, ease: 'power2.out' }
  )
}
