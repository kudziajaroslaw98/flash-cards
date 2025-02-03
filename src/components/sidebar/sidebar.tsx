'use client';

import { db } from '#/db/dexie.db';
import { useSessionContext } from '#/providers/session-provider.component';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { NavigationGroup } from '#/types//navigation-group.type';
import { NavigationItem } from '#/types//navigation-item.type';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpenText,
  GraduationCap,
  House,
  Languages,
  Layers,
  LogIn,
  LogOut,
  PlayCircle,
  Settings,
  UserRound,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import AvatarComponent from '../_ui/avatar/avatar';
import { Button } from '../_ui/button/button';
import ContextMenu from '../_ui/context-menu/context-menu';
import NavigationGroupComponent from '../_ui/navigation/navigation-group';
import NavigationItemComponent from '../_ui/navigation/navigation-item';
import ThemeSwitchComponent from '../theme-switch/theme-switch';

export default function SidebarComponent() {
  const [expanded, toggleExpand] = useState<boolean>(true);
  const [toggled, toggle] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const { isLoggedIn, user, logOut, isPlanActive } = useSessionContext();
  const flashcardsLength = useLiveQuery(() => db.flashcards.count());
  const setsLength = useLiveQuery(() => db.sets.count());
  const dueFlashcards = useLiveQuery(() =>
    db.flashcards
      .filter(
        (f) => new Date(f.spacedRepetition.dueDate).getTime() < Date.now(),
      )
      .count(),
  );
  const name = user?.user_metadata?.name;

  const iconSize = expanded ? 'size-4' : 'size-5';
  const groupIconSize = 'size-3';

  const navigation: (NavigationItem | NavigationGroup)[] = [
    {
      type: 'item',
      label: 'Dashboard',
      href: APP_ROUTES.dashboard,
      visible: true,
      icon: <House className={`${iconSize}`} />,
    },
    {
      type: 'item',
      label: 'How to use',
      href: APP_ROUTES.guide,
      visible: true,
      icon: <BookOpenText className={`${iconSize} `} />,
    },
    {
      type: 'item',
      label: 'Playground',
      href: '/playground',
      visible: process.env.NODE_ENV === 'development' && true,
      icon: <PlayCircle className={`${iconSize} `} />,
    },
    {
      type: 'group',
      label: 'Flashcards',
      icon: <Zap className={`${groupIconSize}`} />,
      visible: true,
      items: [
        {
          type: 'item',
          label: 'Sets',
          href: APP_ROUTES.flashcards.sets,
          icon: <Layers className={iconSize} />,
          indicator: setsLength,
        },
        {
          type: 'item',
          label: 'Learn',
          href: APP_ROUTES.flashcards.learn,
          icon: <GraduationCap className={iconSize} />,
          indicator: flashcardsLength,
        },
        {
          type: 'item',
          label: 'Revise',
          href: APP_ROUTES.flashcards.revise,
          icon: <Languages className={iconSize} />,
          indicator: dueFlashcards,
        },
      ],
    },
    {
      type: 'group',
      label: 'Account',
      icon: <UserRound className={`${groupIconSize}`} />,
      visible: isLoggedIn,
      items: [
        {
          type: 'item',
          label: 'Settings',
          href: APP_ROUTES.account.settings,
          icon: <Settings className={iconSize} />,
        },
      ],
    },
    {
      type: 'group',
      label: 'Premium',
      icon: <UserRound className={`${groupIconSize}`} />,
      visible: true && !isPlanActive,
      items: [
        {
          type: 'item',
          label: 'Upgrade plan',
          href: APP_ROUTES.pricing,
          icon: <ArrowUp className={iconSize} />,
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
          className={`flex items-center font-thin tracking-wider outline-none focus:ring focus:ring-green-400/50 ${expanded && 'gap-4'}`}
        >
          <Image
            width={24}
            height={24}
            src={'/images/flash-cards-logo.svg'}
            alt={'Flashcards Logo'}
            loading='eager'
          />

          <span
            className={`overflow-clip bg-gradient-to-r from-green-600 to-green-400 bg-clip-text pr-1 text-xl font-black uppercase tracking-tighter text-transparent transition-all ${expanded ? 'max-w-full' : 'hidden max-w-0'}`}
          >
            FlashCards
          </span>
        </Link>

        <Button
          size='icon-xs'
          className='absolute -right-2'
          icon={
            expanded ? (
              <ArrowLeft className='size-3' />
            ) : (
              <ArrowRight className='size-3' />
            )
          }
          onClick={handleToggle}
          alt='Toggle Navigation'
        />
      </div>

      <div className={`flex h-full w-full flex-col justify-center gap-8 p-4`}>
        <div
          className={`hidden h-full flex-col gap-2 md:flex  ${!expanded && 'items-center'}`}
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
                      type: 'item',
                      label: isLoggedIn ? 'Log Out' : 'Log In',
                      icon: isLoggedIn ? (
                        <LogIn className='size-6' />
                      ) : (
                        <LogOut className='size-6' />
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
                      type: 'item',
                      label: 'Settings',
                      icon: <Settings className='size-6' />,
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
                  <span className='line-clamp-1  overflow-hidden text-ellipsis font-extrabold text-gray-600 dark:text-slate-300'>
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
