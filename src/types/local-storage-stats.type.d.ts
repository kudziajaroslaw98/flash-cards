import { StatsModel } from '#/types//stats.type';

export type Stats = Record<keyof StatsModel, StatsModel[keyof StatsModel]>;
