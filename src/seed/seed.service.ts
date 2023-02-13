import { Injectable, ExecutionContext } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {

  }

  private async deleteTables() {

    await this.productService.deteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();

  } 
  
  async runSeed() {
    await this.deleteTables();
    const firstUser = await this.insertUsers();
    await this.insertNewProducts(firstUser);
    return `SEED execute`;
  }

  private async insertUsers() {
    // await this.productService.deteAllProducts();
    const seedUsers = initialData.users;

    const users: User[] = [];
    
    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user));
    })

    await this.userRepository.save(users);


    return users[0];
  }

  private async insertNewProducts(user: User) {
    await this.productService.deteAllProducts();

    const products = initialData.products;

    const insertPromisses = [];

    products.forEach( product => {
      insertPromisses.push(this.productService.create( product, user ));
    });

    await Promise.all(insertPromisses);


    return true;
  }

}
