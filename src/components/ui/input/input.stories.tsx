import type { Meta, StoryObj } from '@storybook/react';
import Input from './input.component';

const meta: Meta<typeof Input> = {
  component: Input,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Input>;

export const InputStory: Story = {
  args: {
    type: 'text',
    name: 'firstName',
    label: 'First Name',
    placeholder: 'John',
  },
};
