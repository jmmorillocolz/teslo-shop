import { Injectable, BadRequestException, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');

  /**
   * 
   * @param userRepository 
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {

  }


  /**
   * 
   * @param createUserDto 
   * @returns 
   */
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user)

      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    } catch(error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * 
   * @param loginUserDto 
   * @returns 
   */
  async login (loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
     });

     if(!user)
        throw new UnauthorizedException(`Credentials are not valid`);

      if(!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException(`Credentials are not valid`);

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  /**
   * 
   * @param userId 
   * @returns 
   */
  async checkAuthStatus(user: User) {
    const { id, ...userData } = user;

    return {
      ...userData,
      id,
      token: this.getJwtToken({ id })
    }
  }

  /**
   * 
   * @param payload 
   */
  private getJwtToken (payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  /**
   * 
   * @param error 
   */
  private handleDBExceptions(error: any): never {
    if(error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

}
