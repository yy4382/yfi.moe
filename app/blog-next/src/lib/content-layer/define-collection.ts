export type ContentLayerItem<T> = {
  id: string;
  body: string;
  data: T;
};

export type ContentLayerListItem<T> = Omit<ContentLayerItem<T>, "body">;

export interface ContentCollection<T extends { slug: string }> {
  collectionId: string;

  getCollection(): Promise<ContentLayerListItem<T>[]>;
  getEntry(slug: string): Promise<ContentLayerItem<T> | null>;
  getCollectionWithBody(): Promise<ContentLayerItem<T>[]>;
}
