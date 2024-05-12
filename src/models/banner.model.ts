import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'banners',
})
export class Banner extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number; // Primary key, auto-increment

  @property({
    type: 'string',
    required: true,
  })
  name: string; // Banner name

  @property({
    type: 'string',
  })
  imageUrl?: string; // URL of the banner image

  @property({
    type: 'string',
    default: null,
  })
  route?: string; // Route associated with the banner (optional)

  @property({
    type: 'number',
    required: true,
  })
  status: number; // Status of the banner

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt: Date; // Timestamp when the banner was created

  @property({
    type: 'number',
  })
  createdBy?: number; // ID of the person who created the banner

  @property({
    type: 'date',
    default: null,
  })
  updatedAt?: Date; // Timestamp when the banner was last updated

  @property({
    type: 'number',
  })
  updatedBy?: number; // ID of the person who last updated the banner

  @property({
    type: 'number',
    default: 0,
  })
  statusDeleted: number; // Soft delete flag (0 = active, 1 = deleted)

  constructor(data?: Partial<Banner>) {
    super(data);
  }
}

export interface BannerRelations {
  // describe navigational properties here
}

export type BannerWithRelations = Banner & BannerRelations;
