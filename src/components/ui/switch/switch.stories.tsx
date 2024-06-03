import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import Switch from './switch.component';

const meta: Meta<typeof Switch> = {
  component: Switch,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const SwitchStory: Story = {
  args: {
    value: false,
    onClick: action('onChange'),
    showLabel: true,
    checkedLabel: 'Dark mode',
    uncheckedLabel: 'Light mode',
  },
};
