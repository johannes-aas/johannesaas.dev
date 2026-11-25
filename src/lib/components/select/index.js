import { Select as SelectPrimitive } from 'bits-ui'
import SelectTrigger from './select-trigger.svelte'
import SelectValue from './select-value.svelte'
import SelectContent from './select-content.svelte'
import SelectItem from './select-item.svelte'

export const SelectRoot = SelectPrimitive.Root
export const SelectPortal = SelectPrimitive.Portal

export { SelectTrigger, SelectValue, SelectContent, SelectItem }
