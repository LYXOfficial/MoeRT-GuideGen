import { InputNumber } from '@douyinfe/semi-ui'
import colors from './define/colors'
import type { EditorConfig } from '../../../interfaces/editor'
import CustomColorPicker from '../../CustomColorPicker'

export interface BlankProps {
  background?: string
  width?: number
}
export const blankDefaultProps: BlankProps = {
  background: colors.background,
  width: 20
}
export const blankEditorConfig: EditorConfig = {
  forms: [
    {
      key: 'width',
      label: 'themes.chengdu.components.Blank.props.width',
      element: <InputNumber />
    },
    {
      key: 'background',
      label: 'themes.chengdu.components.Blank.props.background',
      element: <CustomColorPicker currentTheme={1} />
    }
  ]
}

function Blank({
  background = blankDefaultProps.background,
  width = blankDefaultProps.width
}: BlankProps) {
  return (
    <div
      className="h-full"
      style={{ backgroundColor: background, width: width }}
    ></div>
  )
}

Blank.getEditorConfig = () => blankEditorConfig

export default Blank
