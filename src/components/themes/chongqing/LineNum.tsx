import { useRef, useState, useEffect } from 'react'
import colors from './define/colors'
import type { EditorConfig } from '../../../interfaces/editor'
import { Input, Select, Switch } from '@douyinfe/semi-ui'
import CustomColorPicker from '../../CustomColorPicker'

export interface LineNumProps {
  num: string
  lineColor: string
  customChinese?: string
  customEnglish?: string
  showText?: boolean
  align?: string
}

export const lineNumDefaultProps: LineNumProps = {
  num: '6',
  lineColor: colors.line6,
  customChinese: '号线',
  customEnglish: 'Line',
  showText: true,
  align: 'left'
}

export const lineNumEditorConfig: EditorConfig = {
  forms: [
    {
      key: 'lineColor',
      label: 'themes.chongqing.components.LineNum.props.lineColor',
      element: <CustomColorPicker currentTheme={0} />
    },
    {
      key: 'num',
      label: 'themes.chongqing.components.LineNum.props.num',
      element: <Input />
    },
    {
      key: 'customChinese',
      label: 'themes.chongqing.components.LineNum.props.customChinese',
      element: <Input />
    },
    {
      key: 'customEnglish',
      label: 'themes.chongqing.components.LineNum.props.customEnglish',
      element: <Input />
    },
    {
      key: 'showText',
      label: 'themes.chongqing.components.LineNum.props.showText',
      element: <Switch />
    },
    {
      key: 'align',
      label: 'themes.chongqing.components.LineNum.props.align.displayName',
      element: (
        <Select>
          <Select.Option value="left">left</Select.Option>
          <Select.Option value="right">right</Select.Option>
        </Select>
      )
    }
  ]
}

function LineNum({
  num = lineNumDefaultProps.num,
  lineColor = lineNumDefaultProps.lineColor,
  customChinese = lineNumDefaultProps.customChinese,
  customEnglish = lineNumDefaultProps.customEnglish,
  showText = lineNumDefaultProps.showText,
  align = lineNumDefaultProps.align
}: LineNumProps) {
  const numRef = useRef<SVGTextElement>(null)
  const textRef = useRef<SVGGElement>(null)
  const [svgWidth, setSvgWidth] = useState(0)
  const [textOffsetX, setTextOffsetX] = useState(0)
  const [numX, setNumX] = useState(0)
  const [rectX, setRectX] = useState(0)
  const [textAnchor, setTextAnchor] = useState<'start' | 'end'>('start')

  const isChinese = /[\u4e00-\u9fa5]/.test(num)

  useEffect(() => {
    let mounted = true

    const measure = () => {
      if (numRef.current) {
        const numBBox = numRef.current.getBBox()
        const textBBox = textRef.current?.getBBox() ?? { width: 0 }
        const rectWidth = 15
        const margin = align === 'left' ? 10 : 5

        const totalWidth =
          rectWidth +
          numBBox.width +
          (showText ? margin + textBBox.width : margin / 2)

        if (align === 'left') {
          setRectX(0)
          setNumX(rectWidth + 5)
          setTextOffsetX(rectWidth + numBBox.width + margin)
          setTextAnchor('start')
        } else if (align === 'right') {
          setRectX(totalWidth - rectWidth)
          setNumX(totalWidth - rectWidth - numBBox.width - 5)
          setTextOffsetX(totalWidth - rectWidth - numBBox.width - margin)
          setTextAnchor('end')
        }

        setSvgWidth(totalWidth)
      }
    }

    document.fonts.ready.then(() => {
      if (mounted) measure()
    })

    return () => {
      mounted = false
    }
  }, [num, showText, customChinese, customEnglish, align])

  return (
    <div style={{ backgroundColor: colors.background }}>
      <div className="h-64px mr-5px ml-5px" style={{ width: svgWidth }}>
        <svg width={svgWidth} height={64}>
          {/* 矩形 */}
          <rect width={15} height={52} x={rectX} y={12} fill={lineColor} />

          {/* 数字 */}
          <text
            ref={numRef}
            x={numX}
            y={isChinese ? 48 : 52}
            fontSize={isChinese ? 42 : 56}
            style={{ letterSpacing: '-3px' }}
            fill={colors.foreground}
          >
            {num}
          </text>

          {/* 文字组 */}
          {showText && (
            <g ref={textRef} transform={`translate(${textOffsetX},0)`}>
              <text
                x={0}
                y={32}
                fontSize={20}
                textAnchor={textAnchor}
                fill={colors.foreground}
              >
                {customChinese ?? (isChinese ? '线' : '号线')}
              </text>
              <text
                x={0}
                y={48}
                fontSize={14}
                textAnchor={textAnchor}
                fill={colors.foreground}
              >
                {customEnglish}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

LineNum.getEditorConfig = () => lineNumEditorConfig

export default LineNum
