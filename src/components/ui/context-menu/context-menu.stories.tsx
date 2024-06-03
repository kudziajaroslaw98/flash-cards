import { Bars3Icon } from '@heroicons/react/24/solid';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button/button.component';
import ContextMenu from './context-menu.component';

const meta: Meta<typeof ContextMenu> = {
  component: ContextMenu,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const ContextMenuStory: Story = {
  args: {
    className: '-left-0',
    triggerComponent: (
      <Button
        icon={<Bars3Icon className='h-4 w-4' />}
        size={'icon'}
        onClick={action('trigger-click')}
      />
    ),
    menuItems: [
      {
        label: 'Item 1',
        onClick: action('item-1-click'),
        active: false,
      },
      {
        label: 'Item 2',
        onClick: action('item-2-click'),
        active: false,
      },
      {
        label: 'Item 3',
        onClick: action('item-3-click'),
        active: false,
      },
    ],
    name: 'context-menu',
    open: false,
    contextPosition: 'bottom',
  },
};
