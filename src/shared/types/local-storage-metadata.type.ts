export type MetadataModel = {
  lastSyncAt: Date | null;
  updatedAt: Date | null;
};
export type Metadata = Record<
  keyof MetadataModel,
  MetadataModel[keyof MetadataModel]
>;
