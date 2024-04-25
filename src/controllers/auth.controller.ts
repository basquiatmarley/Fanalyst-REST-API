// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-todo-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate, TokenService} from '@loopback/authentication';
import {
  UserRepository as JWTUserRepository,
  TokenServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  post,
  requestBody,
  response
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {compare, genSalt, hash} from 'bcryptjs';
import {Users} from '../models';
import {UsersRepository} from '../repositories';

export class AuthController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(JWTUserRepository) protected jwtUserRepository: JWTUserRepository,
    @repository(UsersRepository) protected usersRepository: UsersRepository,
  ) { }

  @post('/auth/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'Login Schema',
            exclude: ['id', 'statusDeleted', 'imageUrl', 'role', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'statusDeleted', 'status', 'firstName', 'lastName'],
          }),
        },
      },
    })
    user: Omit<Users, 'id'>,
  ): Promise<{token: string, userData: Users}> {
    const findOneUser = await this.usersRepository.findOne({
      where: {email: user.email},
    });

    if (!findOneUser) {
      throw new HttpErrors.NotFound('User not found');
    }

    const isPasswordValid = compare(user.password, findOneUser.password);
    if (!isPasswordValid) {
      throw new HttpErrors.Unauthorized('Invalid credentials');
    }

    const token = await this.jwtService.generateToken({
      email: findOneUser.email,
      name: `${findOneUser.firstName}-${findOneUser.lastName}`,
      [securityId]: findOneUser.id.toString(),
    });

    return {token: token, userData: findOneUser};


  }

  @authenticate('jwt')
  @get('/auth/verify', {
    responses: {
      '200': {
        description: 'Auth verify token',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<{token: string, userData: Users}> {
    var uId = currentUserProfile[securityId];
    const findOneUser = await this.usersRepository.findOne({
      where: {id: Number(uId)},
    });

    if (!findOneUser) {
      throw new HttpErrors.NotFound('User not found');
    }
    const token = await this.jwtService.generateToken({
      email: findOneUser.email,
      name: `${findOneUser.firstName}-${findOneUser.lastName}`,
      [securityId]: findOneUser.id.toString(),
    });

    return {token: token, userData: findOneUser};

  }

  @post('/auth/signup')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'Sign Up Schema',
            exclude: ['id', 'statusDeleted', 'imageUrl', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'statusDeleted', 'status'],
          }),
        },
      },
    })
    user: Omit<Users, 'id'>,
  ): Promise<Users> {
    user.status = 1;
    user.password = await hash(user.password, await genSalt());
    const savedUser = await this.usersRepository.create(user);

    return savedUser;
  }
}

