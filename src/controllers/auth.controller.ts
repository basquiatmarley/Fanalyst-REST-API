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
import {randomBytes} from 'crypto';
import {Users} from '../models';
import {UsersRepository} from '../repositories';
import {EMAIL_SERVICE, EmailService} from '../services/mailers.service';


export class AuthController {
  constructor(
    @inject(EMAIL_SERVICE) private emailService: EmailService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(JWTUserRepository) protected jwtUserRepository: JWTUserRepository,
    @repository(UsersRepository) protected usersRepository: UsersRepository,
  ) { }

  @post('/auth/login')
  @response(200, {
    description: 'Password reset',
    content: {'application/json': {schema: {type: 'object', properties: {token: {type: 'string'}, userData: {type: 'object'}}}}},
  })
  async login(
    @requestBody({
      content: {'application/json': {schema: {type: 'object', properties: {email: {type: 'string'}, password: {type: 'string'}, generatedPassword: {type: 'boolean'}}}}},
    })
    request: {email: string, password: string, generatedPassword: boolean | false},
  ): Promise<{token: string, userData: Users}> {

    const findOneUser = await this.usersRepository.findOne({
      where: {email: request.email},
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

    const existingUser = await this.usersRepository.findOne({where: {email: user.email}});

    if (existingUser) {
      throw new HttpErrors.Conflict(`User with email ${user.email} already exists`);
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
          schema: getModelSchemaRef(Users, {partial: true, }),
        },
      },
    }) userData: Users,
  ): Promise<Users> {
    const uId: number = Number(currentUserProfile[securityId]);
    const findOneUser = await this.usersRepository.findById(uId);
    if (!findOneUser) {
      throw new HttpErrors.NotFound(`User not found`);
    }
    const emailValidationCheck = await this.usersRepository.findOne({
      where: {
        and: [
          {email: userData.email},
          {id: {neq: uId}},
        ]
      }
    });
    if (emailValidationCheck) {
      throw new HttpErrors.Conflict(`User with email ${userData.email} already exists`);
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
    content: {'application/json': {schema: {type: 'object', properties: {message: {type: 'string'}}}}},
  })
  async forgot(
    @requestBody({
      content: {'application/json': {schema: {type: 'object', properties: {email: {type: 'string'}}}}},
    })
    request: {email: string},
  ): Promise<{"message": string}> {
    const email = request.email;

    const existingUser = await this.usersRepository.findOne({where: {email}});

    if (!existingUser) {
      throw new HttpErrors.NotFound(`User with email ${email} does not exist.`);
    }

    const buffer = randomBytes(5);
    const otp = buffer.toString('hex').substring(0, 5);
    existingUser.otp = otp;
    const newDateNow = new Date;
    const newDateExpired = new Date(newDateNow.getTime() + (3 * 60 * 60 * 1000)); // 3 HOURS
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


    return {message: "SUCCESS"};
  }

  @post('/auth/reset')
  @response(200, {
    description: 'Password reset',
    content: {'application/json': {schema: {type: 'object', properties: {message: {type: 'string'}}}}},
  })
  async reset(
    @requestBody({
      content: {'application/json': {schema: {type: 'object', properties: {otp: {type: 'string'}, password: {type: 'string'}}}}},
    })
    request: {otp: string, password: string},
  ): Promise<{"message": string}> {
    const otpf = request.otp;
    const newDateNow = new Date;
    const existingUser = await this.usersRepository.findOne({where: {otp: otpf, otpExpired: {gt: newDateNow.toString()}}});

    if (!existingUser) {
      throw new HttpErrors.NotFound(`OTP IS NOT VALID.`);
    }

    existingUser.otp = "";
    existingUser.otpExpired = null;
    existingUser.password = await hash(request.password, await genSalt());
    await this.usersRepository.updateById(existingUser.id, existingUser);

    return {message: "SUCCESS"};
  }


}



