import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DragData } from '@/types'

export type ModalType = 'reset' | 'newGame' | 'wordReview' | 'gameOver' | 'error' | null

export const useUIStore = defineStore('ui', () => {
  const modalType = ref<ModalType>(null)
  const modalData = ref<any>(null)
  const dragData = ref<DragData | null>(null)
  const isDragging = ref(false)
  const hoveredCell = ref<{ row: number; col: number } | null>(null)

  function showModal(type: ModalType, data?: any) {
    modalType.value = type
    modalData.value = data || null
  }

  function hideModal() {
    modalType.value = null
    modalData.value = null
  }

  function setDragData(data: DragData | null) {
    dragData.value = data
  }

  function setIsDragging(dragging: boolean) {
    isDragging.value = dragging
  }

  function setHoveredCell(cell: { row: number; col: number } | null) {
    hoveredCell.value = cell
  }

  function reset() {
    modalType.value = null
    modalData.value = null
    dragData.value = null
    isDragging.value = false
    hoveredCell.value = null
  }

  return {
    modalType,
    modalData,
    dragData,
    isDragging,
    hoveredCell,
    showModal,
    hideModal,
    setDragData,
    setIsDragging,
    setHoveredCell,
    reset
  }
})