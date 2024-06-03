import type { Meta, StoryObj } from '@storybook/react';
import TextArea from './text-area.component';

const meta: Meta<typeof TextArea> = {
  component: TextArea,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const TextAreaStory: Story = {
  args: {
    value: 'First Name',
    id: 'firstName',
  },
};
