import { useRef, useState, useEffect, useCallback } from 'react'
import ComponentsList from './ComponentsList'
import GuideBoardCols, { type GuideBoardRef } from './GuideBoard'
import type { GuideItem } from '../interfaces/guide'
import type { SaveData } from '../interfaces/editor'
import { Toast } from '@douyinfe/semi-ui'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core'
import themes from './themes/themereg'
import Header from './Header'
import { useTranslation } from 'react-i18next'

interface EditorProps {
  guideHeight?: number;
  onArchiveLoaded?: () => void;
}

export default function Editor({ guideHeight = 0, onArchiveLoaded }: EditorProps) {
  const { t } = useTranslation()
  const guideBoardRef = useRef<GuideBoardRef>(null)
  const [activeItem, setActiveItem] = useState<GuideItem | null>(null)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [isImporting, setIsImporting] = useState(false) // 添加导入状态标志
  const lastChangeRef = useRef(Date.now())
  const autoSaveIntervalMs = 2000 // 自动保存间隔

  // 添加全局鼠标位置跟踪
  const mousePositionRef = useRef({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 拖拽指示器状态
  const [dropIndicator, setDropIndicator] = useState<{
    show: boolean;
    x: number;
    y: number;
    height: number;
  }>({ show: false, x: 0, y: 0, height: 0 })

  // 导出存档
  const exportSaveData = () => {
    if (!guideBoardRef.current) return
    const { rows, config } = guideBoardRef.current.getState()
    const saveData: SaveData = {
      version: 1,
      config: {
        ...config,
        theme: themes[currentTheme][0]
      },
      rows: rows.map((row) =>
        row.map(({ id, type, props }) => ({
          id,
          type,
          props
        }))
      )
    }

    // 下载文件
    const blob = new Blob([JSON.stringify(saveData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MoeRT_GuideGen_Save_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    Toast.success(t('saves.export.success'))
  }

  // 导入存档
  const importSaveData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const saveData = JSON.parse(text) as SaveData

        if (saveData.version !== 1) {
          throw new Error(t('saves.import.unsupportedVersion'))
        }
        console.log('导入存档数据：', saveData)

        // 设置导入状态，防止主题变化触发保存
        setIsImporting(true)

        // 设置主题并等待状态更新
        await new Promise<void>((resolve) => {
          const themeIndex = themes.findIndex(
            ([name]) => name === saveData.config.theme
          )
          if (themeIndex !== -1) {
            // 先设置主题
            setCurrentTheme(themeIndex)
            // 等待主题更新完成
            setTimeout(() => {
              if (guideBoardRef.current) {
                // 恢复状态
                guideBoardRef.current.restoreState(saveData)
                // 更新上一次主题引用，防止自动保存触发主题重置
                prevThemeRef.current = themeIndex
                // 清除导入状态
                setIsImporting(false)
                Toast.success(t('saves.import.success'))
              }
              resolve()
            }, 100)
          } else {
            // 如果主题没有改变，直接恢复状态
            if (guideBoardRef.current) {
              guideBoardRef.current.restoreState(saveData)
              Toast.success(t('saves.import.success'))
            }
            setIsImporting(false)
            resolve()
          }
        })
      } catch (err) {
        setIsImporting(false)
        Toast.error(`${t('saves.import.error')}: ${(err as Error).message}`)
      }
    }
    input.click()
  }

  // 自动保存 - 使用 useCallback 避免闭包问题
  const saveToLocalStorage = useCallback(() => {
    if (!guideBoardRef.current) return
    const { rows, config } = guideBoardRef.current.getState()
    const saveData: SaveData = {
      version: 1,
      config: {
        ...config,
        theme: themes[currentTheme][0]
      },
      rows: rows.map((row) =>
        row.map(({ id, type, props }) => ({
          id,
          type,
          props
        }))
      )
    }
    localStorage.setItem('guide-autosave', JSON.stringify(saveData))
    lastChangeRef.current = Date.now()
  }, [currentTheme]) // 依赖 currentTheme

  // 从 LocalStorage 加载
  const loadFromLocalStorage = async () => {
    try {
      const saved = localStorage.getItem('guide-autosave')
      if (!saved) return

      const saveData = JSON.parse(saved) as SaveData
      if (saveData.version !== 1) return

      return new Promise<void>((resolve) => {
        const themeIndex = themes.findIndex(
          ([name, _]) => name === saveData.config.theme
        )

        if (themeIndex !== -1 && themeIndex !== currentTheme) {
          // 先设置主题
          setCurrentTheme(themeIndex)
          // 更新上一次主题引用，防止自动保存触发主题重置
          prevThemeRef.current = themeIndex
          // 等待主题更新
          setTimeout(() => {
            if (guideBoardRef.current) {
              guideBoardRef.current.restoreState(saveData)
              resolve()
            }
          }, 100)
        } else {
          // 如果主题没变，直接恢复状态
          if (guideBoardRef.current) {
            guideBoardRef.current.restoreState(saveData)
            resolve()
          }
        }
      })
    } catch (err) {
      console.error('加载自动存档失败：', err)
    }
  }

  // 记录上一次的主题，用于检测变化
  const [isInitialized, setIsInitialized] = useState(false)
  const prevThemeRef = useRef(currentTheme)
  const configChangeTimeoutRef = useRef<number>(500)

  // 监听配置变化并触发保存
  const handleConfigChange = () => {
    if (configChangeTimeoutRef.current) {
      window.clearTimeout(configChangeTimeoutRef.current)
    }
    configChangeTimeoutRef.current = window.setTimeout(() => {
      lastChangeRef.current = Date.now()
      saveToLocalStorage()
    }, 500)
  }

  // 监听主题变化
  useEffect(() => {
    if (isInitialized) {
      // 只有当主题真的改变时才触发保存
      if (prevThemeRef.current !== currentTheme) {
        prevThemeRef.current = currentTheme
        handleConfigChange()
      }
    }
  }, [currentTheme, isInitialized])

  // 初始化和自动保存
  useEffect(() => {
    const saveInterval: number | null = null

    const init = async () => {
      try {
        // 1. 确保完全加载
        await loadFromLocalStorage()
        // 等待一下，确保 DOM 更新完成
        await new Promise((resolve) => setTimeout(resolve, 100))
        prevThemeRef.current = currentTheme
        setIsInitialized(true)
        // 通知App组件档案加载完成
        onArchiveLoaded?.()
      } catch (err) {
        console.error('初始化失败：', err)
        setIsInitialized(true)
        // 即使失败也要通知加载完成
        onArchiveLoaded?.()
      }
    }

    init()

    return () => {
      if (saveInterval) clearInterval(saveInterval)
      if (configChangeTimeoutRef.current) {
        clearTimeout(configChangeTimeoutRef.current)
      }
    }
  }, [onArchiveLoaded])

  // 设置自动保存定时器 - 单独的 useEffect
  useEffect(() => {
    if (!isInitialized) return

    const saveInterval = window.setInterval(() => {
      if (Date.now() - lastChangeRef.current > 1000) {
        saveToLocalStorage()
      }
    }, autoSaveIntervalMs)

    return () => {
      clearInterval(saveInterval)
    }
  }, [isInitialized, saveToLocalStorage]) // 依赖 saveToLocalStorage

  const handleDragStart = (event: DragStartEvent) => {
    const draggedItem = event.active.data.current?.item as GuideItem
    if (draggedItem) {
      setActiveItem(draggedItem)
    }
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)
    setDropIndicator({ show: false, x: 0, y: 0, height: 0 }) // 隐藏指示器

    if (!over) return

    const draggedItem = active.data.current?.item
    const sourceRowId = active.data.current?.rowId

    // 获取准确的 overRowId
    let overRowId = over.data.current?.rowId
    if (!overRowId && over.id.toString().startsWith('row')) {
      overRowId = over.id.toString()
    }
    if (!overRowId) return

    // 从组件列表拖入
    if (draggedItem && !sourceRowId && overRowId) {
      const newId = `${draggedItem.type || 'item'}-${Math.random().toString(36).substring(2)}`
      const rowNumber = overRowId.match(/^row(\d+)/)
      if (!rowNumber) return

      const targetRowId = `row${rowNumber[1]}`
      
      // 计算插入位置
      const rowContainer = document.querySelector(`[data-row="${targetRowId}"]`)
      let insertIndex: number | undefined = undefined
      
      if (rowContainer) {
        // 使用全局鼠标位置
        const pointerX = mousePositionRef.current.x

        const children = Array.from(rowContainer.children).filter(child => {
          const element = child as HTMLElement
          // 过滤掉空占位符、拖拽相关元素和隐藏元素
          const id = element.getAttribute('id') || ''
          return !element.classList.contains('sortable-ghost') && 
                 !element.classList.contains('sortable-chosen') &&
                 !element.classList.contains('sortable-placeholder') &&
                 element.style.display !== 'none' &&
                 !id.startsWith('empty-') &&
                 element.tagName !== 'SCRIPT' &&
                 element.tagName !== 'STYLE'
        }) as HTMLElement[]

        if (children.length > 0 && pointerX > 0) {
          // 找到合适的插入位置
          insertIndex = children.length // 默认插入到最后
          for (let i = 0; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect()
            if (pointerX < rect.left + rect.width / 2) {
              insertIndex = i
              break
            }
          }
        }
      }

      const newItem: GuideItem = {
        ...draggedItem,
        id: newId
      }

      guideBoardRef.current?.addItemToRow(targetRowId, newItem, insertIndex)
      lastChangeRef.current = Date.now()
      return
    }
    
    // 行内和跨行拖拽
    if (sourceRowId && overRowId) {
      if (sourceRowId === overRowId) {
        if (active.id !== over.id) {
          const oldIndex = guideBoardRef.current?.getItemIndex(
            sourceRowId,
            active.id.toString()
          )
          const newIndex = guideBoardRef.current?.getItemIndex(
            overRowId,
            over.id.toString()
          )

          if (
            typeof oldIndex === 'number' &&
            typeof newIndex === 'number' &&
            oldIndex !== -1 &&
            newIndex !== -1
          ) {
            guideBoardRef.current?.reorderRow(sourceRowId, oldIndex, newIndex)
            lastChangeRef.current = Date.now()
          }
        }
      } else {
        // 跨行移动
        const rowNumber = overRowId.match(/^row(\d+)/)
        if (!rowNumber) return

        const targetRowId = `row${rowNumber[1]}`
        
        // 计算插入位置 - 注意这里需要在移除源元素之前计算位置
        const rowContainer = document.querySelector(`[data-row="${targetRowId}"]`)
        let insertIndex: number | undefined = undefined
        
        if (rowContainer) {
          // 使用全局鼠标位置
          const pointerX = mousePositionRef.current.x

          const children = Array.from(rowContainer.children).filter(child => {
            const element = child as HTMLElement
            // 过滤掉空占位符、拖拽相关元素和隐藏元素
            const id = element.getAttribute('id') || ''
            return !element.classList.contains('sortable-ghost') && 
                   !element.classList.contains('sortable-chosen') &&
                   !element.classList.contains('sortable-placeholder') &&
                   element.style.display !== 'none' &&
                   !id.startsWith('empty-') &&
                   element.tagName !== 'SCRIPT' &&
                   element.tagName !== 'STYLE'
          }) as HTMLElement[]

          if (children.length > 0 && pointerX > 0) {
            // 找到合适的插入位置
            insertIndex = children.length // 默认插入到最后
            for (let i = 0; i < children.length; i++) {
              const rect = children[i].getBoundingClientRect()
              if (pointerX < rect.left + rect.width / 2) {
                insertIndex = i
                break
              }
            }
          }
        }

        // 先移除源元素，再插入到目标位置
        const item = guideBoardRef.current?.removeItemFromRow(
          sourceRowId,
          active.id.toString()
        )
        if (item) {
          guideBoardRef.current?.addItemToRow(targetRowId, item, insertIndex)
          lastChangeRef.current = Date.now()
        }
      }
    }
  }
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 })
      return
    }

    const draggedItem = active.data.current?.item
    const sourceRowId = active.data.current?.rowId
    
    // 获取准确的 overRowId
    let overRowId = over.data.current?.rowId
    if (!overRowId && over.id.toString().startsWith('row')) {
      overRowId = over.id.toString()
    }
    
    // 如果不是在有效的行上，隐藏指示器
    if (!overRowId) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 })
      return
    }

    // 如果是从组件列表拖入，显示指示器
    if (!sourceRowId && draggedItem) {
      const rowNumber = overRowId.match(/^row(\d+)/)
      if (!rowNumber) {
        setDropIndicator({ show: false, x: 0, y: 0, height: 0 })
        return
      }

      const targetRowId = `row${rowNumber[1]}`
      const rowContainer = document.querySelector(`[data-row="${targetRowId}"]`)
      
      if (rowContainer) {
        const rowRect = rowContainer.getBoundingClientRect()
        const guideBoardRect = document.querySelector('.guide-board')?.getBoundingClientRect()
        
        if (guideBoardRect) {
          // 使用全局鼠标位置
          const pointerX = mousePositionRef.current.x

          // 计算插入位置
          const children = Array.from(rowContainer.children).filter(child => {
            const element = child as HTMLElement
            // 过滤掉空占位符、拖拽相关元素和隐藏元素
            const id = element.getAttribute('id') || ''
            return !element.classList.contains('sortable-ghost') && 
                   !element.classList.contains('sortable-chosen') &&
                   !element.classList.contains('sortable-placeholder') &&
                   element.style.display !== 'none' &&
                   !id.startsWith('empty-') &&
                   element.tagName !== 'SCRIPT' &&
                   element.tagName !== 'STYLE'
          }) as HTMLElement[]
          
          let insertX = rowRect.left + 10 // 默认在行首，留一点边距

          if (children.length > 0) {
            // 找到合适的插入位置
            let foundPosition = false
            for (let i = 0; i < children.length; i++) {
              const rect = children[i].getBoundingClientRect()
              if (pointerX < rect.left + rect.width / 2) {
                insertX = rect.left
                foundPosition = true
                break
              }
            }
            // 如果没有找到位置，插入到最后
            if (!foundPosition) {
              const lastChild = children[children.length - 1]
              insertX = lastChild.getBoundingClientRect().right
            }
          } else {
            // 空行的情况，显示在行的中间
            insertX = rowRect.left + rowRect.width / 2
          }

          setDropIndicator({
            show: true,
            x: insertX - guideBoardRect.left,
            y: rowRect.top - guideBoardRect.top,
            height: rowRect.height
          })
        }
      }
      return
    }

    // 如果没有源行ID或拖拽项，隐藏指示器
    if (!sourceRowId || !draggedItem) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 })
      return
    }

    // 确保 overRowId 是正确的格式
    const rowNumber = overRowId.match(/^row(\d+)/)
    if (!rowNumber) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 })
      return
    }

    const targetRowId = `row${rowNumber[1]}`

    // 使用全局鼠标位置
    const pointerX = mousePositionRef.current.x

    // 获取拖拽元素在源行中的索引
    const oldIndex = guideBoardRef.current?.getItemIndex(
      sourceRowId,
      active.id.toString()
    )

    if (typeof oldIndex !== 'number' || oldIndex === -1) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 })
      return
    }

    // 跨行拖拽，显示指示器
    if (sourceRowId !== targetRowId) {
      const rowContainer = document.querySelector(`[data-row="${targetRowId}"]`)
      if (rowContainer) {
        const rowRect = rowContainer.getBoundingClientRect()
        const guideBoardRect = document.querySelector('.guide-board')?.getBoundingClientRect()
        
        if (guideBoardRect) {
          // 使用全局鼠标位置
          const pointerX = mousePositionRef.current.x
          
          // 计算插入位置
          const children = Array.from(rowContainer.children).filter(child => {
            const element = child as HTMLElement
            // 过滤掉空占位符、拖拽相关元素和隐藏元素
            const id = element.getAttribute('id') || ''
            return !element.classList.contains('sortable-ghost') && 
                   !element.classList.contains('sortable-chosen') &&
                   !element.classList.contains('sortable-placeholder') &&
                   element.style.display !== 'none' &&
                   !id.startsWith('empty-') &&
                   element.tagName !== 'SCRIPT' &&
                   element.tagName !== 'STYLE'
          }) as HTMLElement[]
          
          let insertX = rowRect.left + 10 // 默认在行首，留一点边距

          if (children.length > 0) {
            // 找到合适的插入位置
            let foundPosition = false
            for (let i = 0; i < children.length; i++) {
              const rect = children[i].getBoundingClientRect()
              // 检查鼠标是否在当前元素的左半部分
              if (pointerX < rect.left + rect.width / 2) {
                insertX = rect.left
                foundPosition = true
                break
              }
            }
            // 如果没有找到位置，插入到最后一个元素后面
            if (!foundPosition) {
              const lastChild = children[children.length - 1]
              insertX = lastChild.getBoundingClientRect().right
            }
          } else {
            // 空行的情况，显示在行的中间
            insertX = rowRect.left + rowRect.width / 2
          }

          setDropIndicator({
            show: true,
            x: insertX - guideBoardRect.left,
            y: rowRect.top - guideBoardRect.top,
            height: rowRect.height
          })
        }
      }
    } else {
      // 同行内拖拽，隐藏指示器，继续预览重排序
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 })
      
      const rowContainer = document.querySelector(`[data-row="${targetRowId}"]`)
      if (!rowContainer) return

      const children = Array.from(rowContainer.children) as HTMLElement[]
      let newIndex = children.length

      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect()
        if (pointerX < rect.left + rect.width / 2) {
          newIndex = i
          break
        }
      }

      // 如果位置发生变化，进行重排序
      if (newIndex !== oldIndex) {
        guideBoardRef.current?.reorderRow(targetRowId, oldIndex, newIndex)
      }
    }
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      collisionDetection={closestCenter}
    >
      <div className="flex flex-col h-screen">
        <Header
          onExport={exportSaveData}
          onImport={importSaveData}
          guideHeight={guideHeight}
        />
        <div className="flex h-0 flex-1">
          <ComponentsList
            currentTheme={currentTheme}
            onThemeChange={(theme) => {
              // 在导入过程中忽略主题变化
              if (isImporting) {
                return
              }
              setCurrentTheme(theme)
              guideBoardRef.current?.clearBoard()
            }}
          />
          <div className="m-auto relative">
            <GuideBoardCols
              ref={guideBoardRef}
              currentTheme={currentTheme}
              onConfigChange={handleConfigChange}
            />
            {/* 拖拽指示器 */}
            {dropIndicator.show && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: dropIndicator.x,
                  top: dropIndicator.y,
                  width: 2,
                  height: dropIndicator.height,
                  backgroundColor: '#66ccff',
                  borderRadius: 1,
                  zIndex:114514
                }}
              />
            )}
          </div>
        </div>
        <img className="love-salt-kawaii-qwq fixed opacity-30 -right-50px bottom-0 -z-1 w-600px select-none" src="/imgs/salt.png"/>
      </div>
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
        }}
      >
        {activeItem ? (
          <div
            style={{
              transform: 'scale(1.05)',
              boxShadow: '0 0 8px rgba(0,0,0,0.12)',
              background: 'white',
              cursor: 'grabbing',
              opacity: 0.9,
              fontFamily: themes[currentTheme][1].fontFamily
            }}
          >
            {activeItem.element}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
