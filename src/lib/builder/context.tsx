'use client'

import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react'
import type { Block, BlockStyle, BlockAnimation, BuilderSite, Viewport } from './types'
import { BLOCK_DEFS } from './blocks'

// ─── State ───────────────────────────────────────────────────────────────────
export interface BuilderState {
  siteId: string | null
  name: string
  blocks: Block[]
  selectedId: string | null
  viewport: Viewport
  aiOpen: boolean
  history: Block[][]
  historyIndex: number
  saving: boolean
  saved: boolean
}

const initialState: BuilderState = {
  siteId: null,
  name: 'Mon site',
  blocks: [],
  selectedId: null,
  viewport: 'desktop',
  aiOpen: false,
  history: [[]],
  historyIndex: 0,
  saving: false,
  saved: false,
}

// ─── Actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_BLOCK'; payload: { block: Block; insertIndex?: number } }
  | { type: 'DUPLICATE_BLOCK'; payload: string }
  | { type: 'REMOVE_BLOCK'; payload: string }
  | { type: 'MOVE_BLOCK'; payload: { id: string; direction: 'up' | 'down' } }
  | { type: 'REORDER_BLOCKS'; payload: Block[] }
  | { type: 'UPDATE_CONTENT'; payload: { id: string; content: Record<string, string> } }
  | { type: 'UPDATE_STYLE'; payload: { id: string; style: BlockStyle } }
  | { type: 'UPDATE_ANIMATION'; payload: { id: string; animation: BlockAnimation } }
  | { type: 'SELECT_BLOCK'; payload: string | null }
  | { type: 'SET_VIEWPORT'; payload: Viewport }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'TOGGLE_AI' }
  | { type: 'LOAD'; payload: BuilderSite }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_SAVED'; payload: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }

const MAX_HISTORY = 50

function pushHistory(state: BuilderState, newBlocks: Block[]): Pick<BuilderState, 'history' | 'historyIndex'> {
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(newBlocks)
  if (newHistory.length > MAX_HISTORY) newHistory.shift()
  return { history: newHistory, historyIndex: newHistory.length - 1 }
}

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case 'ADD_BLOCK': {
      const { block, insertIndex } = action.payload
      const newBlocks = [...state.blocks]
      if (insertIndex !== undefined) {
        newBlocks.splice(insertIndex, 0, block)
      } else {
        newBlocks.push(block)
      }
      return { ...state, blocks: newBlocks, selectedId: block.id, ...pushHistory(state, newBlocks) }
    }

    case 'DUPLICATE_BLOCK': {
      const idx = state.blocks.findIndex(b => b.id === action.payload)
      if (idx < 0) return state
      const original = state.blocks[idx]
      const copy: Block = { ...original, id: genId(), style: { ...original.style, anchor: undefined }, content: { ...original.content } }
      const newBlocks = [...state.blocks.slice(0, idx + 1), copy, ...state.blocks.slice(idx + 1)]
      return { ...state, blocks: newBlocks, selectedId: copy.id, ...pushHistory(state, newBlocks) }
    }

    case 'REMOVE_BLOCK': {
      const newBlocks = state.blocks.filter(b => b.id !== action.payload)
      return {
        ...state,
        blocks: newBlocks,
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
        ...pushHistory(state, newBlocks),
      }
    }

    case 'MOVE_BLOCK': {
      const { id, direction } = action.payload
      const idx = state.blocks.findIndex(b => b.id === id)
      if (idx < 0) return state
      const newBlocks = [...state.blocks]
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= newBlocks.length) return state
      ;[newBlocks[idx], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[idx]]
      return { ...state, blocks: newBlocks, ...pushHistory(state, newBlocks) }
    }

    case 'REORDER_BLOCKS': {
      return { ...state, blocks: action.payload, ...pushHistory(state, action.payload) }
    }

    case 'UPDATE_CONTENT': {
      const newBlocks = state.blocks.map(b =>
        b.id === action.payload.id ? { ...b, content: { ...b.content, ...action.payload.content } } : b
      )
      return { ...state, blocks: newBlocks, ...pushHistory(state, newBlocks) }
    }

    case 'UPDATE_STYLE': {
      const newBlocks = state.blocks.map(b =>
        b.id === action.payload.id ? { ...b, style: { ...b.style, ...action.payload.style } } : b
      )
      return { ...state, blocks: newBlocks, ...pushHistory(state, newBlocks) }
    }

    case 'UPDATE_ANIMATION': {
      const newBlocks = state.blocks.map(b =>
        b.id === action.payload.id ? { ...b, animation: { ...b.animation, ...action.payload.animation } } : b
      )
      return { ...state, blocks: newBlocks, ...pushHistory(state, newBlocks) }
    }

    case 'SELECT_BLOCK':
      return { ...state, selectedId: action.payload }

    case 'SET_VIEWPORT':
      return { ...state, viewport: action.payload }

    case 'SET_NAME':
      return { ...state, name: action.payload }

    case 'TOGGLE_AI':
      return { ...state, aiOpen: !state.aiOpen }

    case 'LOAD':
      return {
        ...state,
        siteId: action.payload.id,
        name: action.payload.name,
        blocks: action.payload.blocks,
        history: [action.payload.blocks],
        historyIndex: 0,
        selectedId: null,
      }

    case 'SET_SAVING':
      return { ...state, saving: action.payload }

    case 'SET_SAVED':
      return { ...state, saved: action.payload }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state
      const newIndex = state.historyIndex - 1
      return { ...state, historyIndex: newIndex, blocks: state.history[newIndex] }
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state
      const newIndex = state.historyIndex + 1
      return { ...state, historyIndex: newIndex, blocks: state.history[newIndex] }
    }

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface BuilderContextValue {
  state: BuilderState
  dispatch: Dispatch<Action>
  addBlock: (type: string, insertIndex?: number) => void
  duplicateBlock: (id: string) => void
  removeBlock: (id: string) => void
  moveBlock: (id: string, direction: 'up' | 'down') => void
  updateContent: (id: string, content: Record<string, string>) => void
  updateStyle: (id: string, style: BlockStyle) => void
  updateAnimation: (id: string, animation: Partial<BlockAnimation>) => void
  selectBlock: (id: string | null) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addBlock = useCallback((type: string, insertIndex?: number) => {
    const def = BLOCK_DEFS.find(d => d.type === type)
    if (!def) return
    const block: Block = {
      id: genId(),
      type,
      content: { ...def.defaultContent },
      style: { ...def.defaultStyle },
      animation: { type: 'none', duration: 0.6, delay: 0, trigger: 'scroll' },
    }
    dispatch({ type: 'ADD_BLOCK', payload: { block, insertIndex } })
  }, [])

  const duplicateBlock = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_BLOCK', payload: id })
  }, [])

  const removeBlock = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_BLOCK', payload: id })
  }, [])

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    dispatch({ type: 'MOVE_BLOCK', payload: { id, direction } })
  }, [])

  const updateContent = useCallback((id: string, content: Record<string, string>) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { id, content } })
  }, [])

  const updateStyle = useCallback((id: string, style: BlockStyle) => {
    dispatch({ type: 'UPDATE_STYLE', payload: { id, style } })
  }, [])

  const updateAnimation = useCallback((id: string, animation: Partial<BlockAnimation>) => {
    dispatch({ type: 'UPDATE_ANIMATION', payload: { id, animation: animation as BlockAnimation } })
  }, [])

  const selectBlock = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_BLOCK', payload: id })
  }, [])

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [])

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.history.length - 1

  const value: BuilderContextValue = {
    state,
    dispatch,
    addBlock,
    duplicateBlock,
    removeBlock,
    moveBlock,
    updateContent,
    updateStyle,
    updateAnimation,
    selectBlock,
    undo,
    redo,
    canUndo,
    canRedo,
  }

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
}

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider')
  return ctx
}
