export type MetadataModel = {
  lastSyncAt: Date | null;
};
export type Metadata = Record<
  keyof MetadataModel,
  MetadataModel[keyof MetadataModel]
>;
