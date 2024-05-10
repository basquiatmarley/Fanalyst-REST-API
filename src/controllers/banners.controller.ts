import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Banner} from '../models';
import {BannerRepository} from '../repositories';

export class BannersController {
  constructor(
    @repository(BannerRepository)
    public bannerRepository : BannerRepository,
  ) {}

  @post('/banners')
  @response(200, {
    description: 'Banner model instance',
    content: {'application/json': {schema: getModelSchemaRef(Banner)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Banner, {
            title: 'NewBanner',
            exclude: ['id'],
          }),
        },
      },
    })
    banner: Omit<Banner, 'id'>,
  ): Promise<Banner> {
    return this.bannerRepository.create(banner);
  }

  @get('/banners/count')
  @response(200, {
    description: 'Banner model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Banner) where?: Where<Banner>,
  ): Promise<Count> {
    return this.bannerRepository.count(where);
  }

  @get('/banners')
  @response(200, {
    description: 'Array of Banner model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Banner, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Banner) filter?: Filter<Banner>,
  ): Promise<Banner[]> {
    return this.bannerRepository.find(filter);
  }

  @patch('/banners')
  @response(200, {
    description: 'Banner PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Banner, {partial: true}),
        },
      },
    })
    banner: Banner,
    @param.where(Banner) where?: Where<Banner>,
  ): Promise<Count> {
    return this.bannerRepository.updateAll(banner, where);
  }

  @get('/banners/{id}')
  @response(200, {
    description: 'Banner model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Banner, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Banner, {exclude: 'where'}) filter?: FilterExcludingWhere<Banner>
  ): Promise<Banner> {
    return this.bannerRepository.findById(id, filter);
  }

  @patch('/banners/{id}')
  @response(204, {
    description: 'Banner PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Banner, {partial: true}),
        },
      },
    })
    banner: Banner,
  ): Promise<void> {
    await this.bannerRepository.updateById(id, banner);
  }

  @put('/banners/{id}')
  @response(204, {
    description: 'Banner PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() banner: Banner,
  ): Promise<void> {
    await this.bannerRepository.replaceById(id, banner);
  }

  @del('/banners/{id}')
  @response(204, {
    description: 'Banner DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bannerRepository.deleteById(id);
  }
}
