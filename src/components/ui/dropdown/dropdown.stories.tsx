import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import Dropdown from './dropdown.component';

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const DropdownStory: Story = {
  args: {
    config: {
      first: {
        label: 'First',
        value: 'first',
      },
      second: {
        label: 'Second',
        value: 'second',
      },
      third: {
        label: 'Third',
        value: 'third',
      },
    },
    onChange: action('onChange'),
  },
  decorators: [
    (Story) => (
      <div className='p-16 pt-64'>
        <Story />
      </div>
    ),
  ],
};
