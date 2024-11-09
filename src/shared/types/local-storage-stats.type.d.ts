import { StatsModel } from '#/shared/types/stats.type';

export type Stats = Record<keyof StatsModel, StatsModel[keyof StatsModel]>;
