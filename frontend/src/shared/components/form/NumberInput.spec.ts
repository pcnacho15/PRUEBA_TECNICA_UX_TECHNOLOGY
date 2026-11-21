import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NumberInput from './NumberInput.vue'

const mountInput = (props: Record<string, unknown> = {}) =>
  mount(NumberInput, { props: { id: 'n', modelValue: null, ...props } })

describe('NumberInput', () => {
  it('emite number al escribir y null al vaciar', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')

    await input.setValue('12.5')
    await input.setValue('')

    expect(wrapper.emitted('update:modelValue')).toEqual([[12.5], [null]])
  })

  it('en modo entero bloquea punto, coma y notación científica', async () => {
    const input = mountInput({ integer: true, min: 1 }).find('input')

    for (const key of ['.', ',', 'e', '-']) {
      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      input.element.dispatchEvent(event)
      expect(event.defaultPrevented, `tecla ${key}`).toBe(true)
    }
    const digit = new KeyboardEvent('keydown', { key: '5', cancelable: true })
    input.element.dispatchEvent(digit)
    expect(digit.defaultPrevented).toBe(false)
  })

  it('usa step=1 e inputmode numeric para enteros, decimal para el resto', () => {
    const entero = mountInput({ integer: true }).find('input')
    expect(entero.attributes('step')).toBe('1')
    expect(entero.attributes('inputmode')).toBe('numeric')

    const decimal = mountInput({ step: '0.01' }).find('input')
    expect(decimal.attributes('step')).toBe('0.01')
    expect(decimal.attributes('inputmode')).toBe('decimal')
  })
})
