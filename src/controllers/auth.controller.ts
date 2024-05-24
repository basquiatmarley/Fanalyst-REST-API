import {authenticate, TokenService} from '@loopback/authentication';
import {
  UserRepository as JWTUserRepository,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {compare, genSalt, hash} from 'bcryptjs';
import {randomBytes, randomUUID} from 'crypto';
import * as admin from 'firebase-admin';
import {Users, UsersRelations} from '../models';
import {UsersRepository} from '../repositories';
import {EMAIL_SERVICE, EmailService} from '../services/mailers.service';

export class AuthController {
  constructor(
    @inject(EMAIL_SERVICE) private emailService: EmailService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(JWTUserRepository)
    protected jwtUserRepository: JWTUserRepository,
    @repository(UsersRepository) protected usersRepository: UsersRepository,
  ) { }

  @post('/auth/login')
  @response(200, {
    description: 'Password reset',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {token: {type: 'string'}, userData: {type: 'object'}},
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              password: {type: 'string'},
              generatedPassword: {type: 'boolean'},
            },
          },
        },
      },
    })
    request: {
      email: string;
      password: string;
      generatedPassword: boolean | false;
    },
  ): Promise<{token: string; userData: Users}> {
    const findOneUser = await this.usersRepository.findOne({
      where: {
        and: [{email: request.email}, {status: 1}],
      },
    });

    if (!findOneUser) {
      throw new HttpErrors.NotFound('User not found');
    }
    let isPasswordValid = true;
    if (!request.generatedPassword) {
      isPasswordValid = await compare(request.password, findOneUser.password);
    } else {
      isPasswordValid = request.password == findOneUser.password;
    }

    if (!isPasswordValid) {
      throw new HttpErrors.NotFound('Password not match');
    }

    const token = await this.jwtService.generateToken({
      email: findOneUser.email,
      name: `${findOneUser.firstName}-${findOneUser.lastName}`,
      [securityId]: findOneUser.id.toString(),
    });

    return {token: token, userData: findOneUser};
  }

  @post('/auth/login-with-third')
  @response(200, {
    description: 'Password reset',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {token: {type: 'string'}, userData: {type: 'object'}},
        },
      },
    },
  })
  async loginWith(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              password: {type: 'string'},
              idToken: {type: 'string'},
              type: {type: 'string'},
              imageUrl: {type: 'string'},
            },
          },
        },
      },
    })
    request: {
      idToken: string;
      type: string;
    },
  ): Promise<{token: string; userData: Users & UsersRelations | null}> {
    var validateToken = false;
    let userPayload: {[key: string]: any} | null;

    if (request.type == 'GOOGLE') {
      userPayload = null;
      try {
        // const clientId = [
        //   '104706451517-5l8k8f4krp1a8ab3b7c9cuedeb8uiudc.apps.googleusercontent.com',
        //   '104706451517-bpo0ca1oun9t22ain7gq84l3b169qve2.apps.googleusercontent.com',
        //   '104706451517-5l8k8f4krp1a8ab3b7c9cuedeb8uiudc.apps.googleusercontent.com',
        // ];
        // const client = new OAuth2Client();
        // const ticket = await client.verifyIdToken({
        //   idToken: request.idToken,
        //   audience: clientId,
        // });
        // const payload = ticket.getPayload();
        // if (payload?.sub != null) {
        //   console.log(payload);
        //   userPayload = {
        //     name: payload.name,
        //     email: payload.email,
        //     imageUrl: payload.picture,
        //   };

        //   validateToken = true;
        // }
        console.log("ID TOKEN", request.idToken);
        const decodedToken = await admin.auth().verifyIdToken(request.idToken);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        console.log(userRecord);
        if (userRecord.uid != null) {
          validateToken = true;
          userPayload = {
            email: userRecord.email,
            name: userRecord.displayName,
            imageUrl: userRecord.photoURL,
          };
        }

        // // if (payload?.sub != null) {
        //   // const userId = payload['sub'];
        //   validateToken = true
        // }
      } catch (e) {
        console.log(`ERROR VERIFID TOKEN : ${e}`);
      }

      //NEED VERIFY ID TOKEN
    } else {
      userPayload = null;
      try {
        const decodedToken = await admin.auth().verifyIdToken(request.idToken);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        console.log('User Info:', userRecord.toJSON());
        userPayload = {
          email: userRecord.email,
          name: userRecord.displayName,
          imageUrl: userRecord.photoURL,
        };
      } catch (error) {
        throw new Error('Invalid ID token');
      }
    }

    if (!validateToken) {
      throw new HttpErrors.NotFound('Invalid token.');
    }

    if (userPayload == null) {
      throw new HttpErrors.NotFound('User payload empty.');
    }
    var findOneUser = await this.usersRepository.findOne({
      where: {
        and: [{email: userPayload.email}, {status: 1}],
      },
    });
    var nameSplt = userPayload.name.split(' ');
    var lastName = nameSplt[1] != undefined ? nameSplt[1] : '';
    if (!findOneUser) {
      var password = await hash(
        userPayload.email + randomUUID + userPayload.name,
        await genSalt(),
      );
      var newUser = {
        firstName: nameSplt[0],
        lastName: lastName,
        password: password,
        email: userPayload.email,
        status: 1,
        imageUrl: userPayload.imageUrl,
        role: 'member',
        otp: '',
        statusDeleted: 0,
      };
      findOneUser = await this.usersRepository.create(newUser);
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
  ): Promise<{token: string; userData: Users}> {
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
            exclude: [
              'id',
              'statusDeleted',
              'imageUrl',
              'createdAt',
              'createdBy',
              'updatedAt',
              'updatedBy',
              'statusDeleted',
              'status',
            ],
          }),
        },
      },
    })
    user: Omit<Users, 'id'>,
  ): Promise<Users> {
    const existingUser = await this.usersRepository.findOne({
      where: {email: user.email},
    });

    if (existingUser) {
      throw new HttpErrors.Conflict(
        `User with email ${user.email} already exists`,
      );
    }

    user.status = 1;
    user.password = await hash(user.password, await genSalt());
    const savedUser = await this.usersRepository.create(user);

    return savedUser;
  }

  @authenticate('jwt')
  @post('/auth/edit-profile')
  @response(204, {
    description: 'User PUT success',
  })
  async editProfile(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    userData: Users,
  ): Promise<Users> {
    const uId: number = Number(currentUserProfile[securityId]);
    const findOneUser = await this.usersRepository.findById(uId);
    if (!findOneUser) {
      throw new HttpErrors.NotFound(`User not found`);
    }
    const emailValidationCheck = await this.usersRepository.findOne({
      where: {
        and: [{email: userData.email}, {id: {neq: uId}}],
      },
    });
    if (emailValidationCheck) {
      throw new HttpErrors.Conflict(
        `User with email ${userData.email} already exists`,
      );
    }

    if (userData.password != undefined && userData.password != '') {
      userData.password = await hash(userData.password, await genSalt());
    } else {
      userData.password = findOneUser.password;
    }
    if (userData.imageUrl == '') {
      userData.imageUrl = findOneUser.imageUrl;
    }
    await this.usersRepository.updateById(uId, userData);
    return this.usersRepository.findById(uId);
  }

  @post('/auth/forgot')
  @response(200, {
    description: 'Forgot password',
    content: {
      'application/json': {
        schema: {type: 'object', properties: {message: {type: 'string'}}},
      },
    },
  })
  async forgot(
    @requestBody({
      content: {
        'application/json': {
          schema: {type: 'object', properties: {email: {type: 'string'}}},
        },
      },
    })
    request: {
      email: string;
    },
  ): Promise<{message: string}> {
    const email = request.email;

    const existingUser = await this.usersRepository.findOne({
      where: {
        and: [{email: request.email}, {status: 1}],
      },
    });

    if (!existingUser) {
      throw new HttpErrors.NotFound(`User with email ${email} does not exist.`);
    }

    const buffer = randomBytes(5);
    const otp = buffer.toString('hex').substring(0, 5);
    existingUser.otp = otp;
    const newDateNow = new Date();
    const newDateExpired = new Date(newDateNow.getTime() + 3 * 60 * 60 * 1000); // 3 HOURS
    existingUser.otpExpired = newDateExpired.toString();

    await this.usersRepository.updateById(existingUser.id, existingUser);
    try {
      await this.emailService.sendEmail(
        existingUser.email,
        '[FANALYST APP] Forgot Password',
        `This is your otp for reset password : ${existingUser.otp}. Your otp will expired on 3 Hours.`,
      );
    } catch (e) {
      console.log(e);
      throw new HttpErrors.Conflict(`Your otp faile send email.`);
    }

    return {message: 'SUCCESS'};
  }

  @post('/auth/reset')
  @response(200, {
    description: 'Password reset',
    content: {
      'application/json': {
        schema: {type: 'object', properties: {message: {type: 'string'}}},
      },
    },
  })
  async reset(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {otp: {type: 'string'}, password: {type: 'string'}},
          },
        },
      },
    })
    request: {
      otp: string;
      password: string;
    },
  ): Promise<{message: string}> {
    const otpf = request.otp;
    const newDateNow = new Date();
    const existingUser = await this.usersRepository.findOne({
      where: {otp: otpf, otpExpired: {gt: newDateNow.toString()}},
    });

    if (!existingUser) {
      throw new HttpErrors.NotFound(`OTP IS NOT VALID.`);
    }

    existingUser.otp = '';
    existingUser.otpExpired = null;
    existingUser.password = await hash(request.password, await genSalt());
    await this.usersRepository.updateById(existingUser.id, existingUser);

    return {message: 'SUCCESS'};
  }

  @authenticate('jwt')
  @del('/auth/delete-account')
  @response(200, {
    description: 'delete account',
    content: {
      'application/json': {
        schema: {type: 'object', properties: {message: {type: 'string'}}},
      },
    },
  })
  async deleteAccount(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<{message: string}> {
    const uId: number = Number(currentUserProfile[securityId]);
    const existingUser = await this.usersRepository.findById(uId);

    existingUser.status = 0;
    existingUser.statusDeleted = 1;
    await this.usersRepository.updateById(existingUser.id, existingUser);

    return {message: 'SUCCESS'};
  }
}
