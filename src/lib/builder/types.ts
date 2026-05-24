export type BlockCategory = 'layout' | 'navigation' | 'hero' | 'text' | 'media' | 'buttons' | 'cards' | 'sections' | 'forms' | 'effects'

export type AnimationType =
  | 'none'
  | 'fadeIn' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight'
  | 'slideUp' | 'slideLeft' | 'slideRight'
  | 'zoomIn' | 'zoomOut'
  | 'flipX' | 'flipY'
  | 'bounce' | 'swing' | 'shake' | 'pulse' | 'heartbeat' | 'rubberBand' | 'tada'
  | 'float' | 'spin' | 'ping' | 'shimmer'

export type HoverEffect = 'none' | 'lift' | 'grow' | 'shrink' | 'glow' | 'tilt' | 'underline'

export type Viewport = 'desktop' | 'tablet' | 'mobile'

export interface BlockStyle {
  background?: string
  color?: string
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  marginTop?: number
  marginBottom?: number
  borderRadius?: number
  boxShadow?: string
  textAlign?: 'left' | 'center' | 'right'
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  opacity?: number
  width?: string
  minHeight?: string
  height?: string
  anchor?: string  // section id for internal links (#anchor)
}

export interface BlockAnimation {
  type: AnimationType
  duration: number  // 0.2 to 2.0
  delay: number     // 0 to 1.0
  trigger: 'load' | 'scroll'
  hover?: HoverEffect
}

export interface Block {
  id: string
  type: string
  content: Record<string, string>
  style: BlockStyle
  animation: BlockAnimation
}

export interface BlockDef {
  type: string
  label: string
  category: BlockCategory
  icon: string
  defaultContent: Record<string, string>
  defaultStyle: BlockStyle
  render: (content: Record<string, string>, style: BlockStyle) => string
}

export interface BuilderSite {
  id: string
  name: string
  blocks: Block[]
  styles: Record<string, string>
}

export interface Template {
  id: string
  label: string
  description: string
  emoji: string
  blocks: Omit<Block, 'id'>[]
}
