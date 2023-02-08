import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
  ) {

  }
  
  async runSeed() {
    await this.insertNewProducts();
    return `SEED execute`;
  }

  private async insertNewProducts() {
    await this.productService.deteAllProducts();

    const products = initialData.products;

    const insertPromisses = [];

    products.forEach( product => {
      insertPromisses.push(this.productService.create( product ))
    });

    await Promise.all(insertPromisses);


    return true;
  }

}
