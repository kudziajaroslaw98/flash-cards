import { StatsModel } from '#/utils/interfaces/stats.model';

export type Stats = Record<keyof StatsModel, StatsModel[keyof StatsModel]>;
