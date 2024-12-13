'use client';

import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowRightIcon,
  ArrowRightStartOnRectangleIcon,
  BoltIcon,
  Cog8ToothIcon,
  LanguageIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  UserIcon,
} from '@heroicons/react/24/solid';
import { useSessionContext } from '#/providers/session-provider.component';
import NavigationGroupComponent from '../_ui/navigation/navigation-group';
import NavigationItemComponent from '../_ui/navigation/navigation-item';
import { NavigationGroup } from '#/types//navigation-group.type';
import ThemeSwitchComponent from '../theme-switch/theme-switch';
import { NavigationItem } from '#/types//navigation-item.type';
import ContextMenu from '../_ui/context-menu/context-menu';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import AvatarComponent from '../_ui/avatar/avatar';
import { Button } from '../_ui/button/button';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SidebarComponent() {
  const [expanded, toggleExpand] = useState<boolean>(true);
  const [toggled, toggle] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const { isLoggedIn, user, logOut } = useSessionContext();
  const name = user?.user_metadata?.name;

  const iconSize = expanded ? 'size-4' : 'size-5';
  const groupIconSize = 'size-5';

  const navigation: (NavigationItem | NavigationGroup)[] = [
    {
      type: 'item',
      label: 'Dashboard',
      href: APP_ROUTES.dashboard,
      visible: true,
      icon: <Squares2X2Icon className={iconSize} />,
    },
    {
      type: 'group',
      label: 'Flash Cards',
      icon: <BoltIcon className={groupIconSize} />,
      visible: true,
      items: [
        {
          type: 'item',
          label: 'Sets',
          href: APP_ROUTES.flashcards.sets,
          icon: <RectangleStackIcon className={iconSize} />,
        },
        {
          type: 'item',
          label: 'Learn',
          href: APP_ROUTES.flashcards.learn,
          icon: <AcademicCapIcon className={iconSize} />,
        },
        {
          type: 'item',
          label: 'Revise',
          href: APP_ROUTES.flashcards.revise,
          icon: <LanguageIcon className={iconSize} />,
        },
      ],
    },
    {
      type: 'group',
      label: 'Account',
      icon: <UserIcon className={groupIconSize} />,
      visible: isLoggedIn,
      items: [
        {
          type: 'item',
          label: 'Settings',
          href: APP_ROUTES.account.settings,
          icon: <Cog8ToothIcon className={iconSize} />,
        },
      ],
    },
  ];

  const handleToggle = () => {
    toggleExpand(!expanded);
  };

  return (
    <aside
      className={`sticky top-4 z-50 hidden max-h-[calc(100vh-2rem)] flex-col rounded-md border border-gray-200 bg-gray-50 transition-all dark:border-slate-900 dark:bg-slate-950 md:flex
      ${expanded ? 'w-60 min-w-60' : 'w-20 min-w-20'}
    `}
    >
      <div
        className={`relative flex items-center justify-center border-b border-gray-200 p-4 dark:border-slate-900`}
      >
        <Link
          href={'/'}
          className={`flex items-center font-thin tracking-wider ${expanded && 'gap-4'}`}
        >
          <Image
            width={24}
            height={24}
            src={'/images/flash-cards-logo.svg'}
            alt={'Flash Cards Logo'}
            loading='eager'
          />

          <span
            className={`overflow-clip bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-xl font-black uppercase tracking-tighter text-transparent transition-all ${expanded ? 'max-w-full' : 'hidden max-w-0'}`}
          >
            FlashCards
          </span>
        </Link>

        <Button
          size='icon-xs'
          className='absolute -right-2'
          icon={
            expanded ? (
              <ArrowLeftIcon className='size-3' />
            ) : (
              <ArrowRightIcon className='size-3' />
            )
          }
          onClick={handleToggle}
        />
      </div>

      <div
        className={`flex h-full w-full flex-col justify-center gap-8 overflow-y-scroll p-4`}
      >
        <div
          className={`hidden h-full flex-col gap-8 md:flex  ${!expanded && 'items-center'}`}
        >
          {navigation?.map(
            (section) =>
              section.visible && (
                <span key={section.label}>
                  {section?.type === 'item' && (
                    <NavigationItemComponent
                      item={section}
                      expanded={expanded}
                      visible={section.visible}
                    />
                  )}

                  {section?.type === 'group' && (
                    <NavigationGroupComponent
                      group={section}
                      expanded={expanded}
                      visible={section.visible}
                    />
                  )}
                </span>
              ),
          )}
        </div>

        <div className='flex h-full w-full items-end justify-center'>
          <div className='flex flex-col items-center justify-center gap-8'>
            <ThemeSwitchComponent showLabel={expanded} />

            <div
              className='flex'
              ref={menuRef}
            >
              <div className='flex items-center justify-center gap-4'>
                <ContextMenu
                  className='-left-4'
                  name={'avatar-context'}
                  afterMenuClass='py-4 justify-center'
                  contextPosition={'top-left'}
                  triggerComponent={
                    <AvatarComponent
                      className='size-10'
                      imageAlt='User Avatar'
                      imageSrc={user?.user_metadata?.avatar_url}
                      onClick={() => {
                        toggle(!toggled);
                      }}
                    ></AvatarComponent>
                  }
                  menuItems={[
                    {
                      label: isLoggedIn ? 'Log Out' : 'Log In',
                      icon: isLoggedIn ? (
                        <ArrowRightStartOnRectangleIcon className='size-6' />
                      ) : (
                        <ArrowRightEndOnRectangleIcon className='size-6' />
                      ),
                      onClick: () => {
                        if (isLoggedIn) {
                          logOut();
                          toggle(!toggled);
                        } else {
                          router.push(APP_ROUTES.signIn);
                          toggle(!toggled);
                        }
                      },
                    },
                    {
                      label: 'Settings',
                      icon: <Cog8ToothIcon className='size-6' />,
                      onClick: () => {
                        router.push(APP_ROUTES.account.settings);
                        toggle(!toggled);
                      },
                      visible: isLoggedIn,
                    },
                  ]}
                ></ContextMenu>

                <div
                  className={`w-full max-w-32 flex-col ${expanded ? 'flex' : 'hidden'}`}
                >
                  <span className='line-clamp-1  overflow-hidden text-ellipsis font-extrabold text-slate-800 dark:text-gray-100'>
                    {isLoggedIn ? `${name}` : 'Guest'}
                  </span>

                  <span className='w-full overflow-hidden text-ellipsis text-xs text-gray-400 dark:text-slate-500'>
                    {isLoggedIn ? user?.email : 'Click here to log in'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
