import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {
    @ApiProperty({
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        description: '',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt teslo',
        description: 'Product title',
        uniqueItems: true,
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 22.99,
        description: 'Product price',
        default: 0
    })
    @Column('float', {
        default: 0,
    })
    price: number;

    @ApiProperty({
        example: 'Non aliquam nemo et repellendus voluptas non ullam earum et consequatur aperiam eum molestias fugit ea eveniet maiores.',
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product slug',
        default: null
    })
    @Column('text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 22,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0 
    })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'L'],
        description: 'Product sizes',
        default: null
    })
    @Column('text', {
        array: true,
    })
    sizes: string[];

    @ApiProperty({
        example: 'man',
        description: 'Product gender',
        default: null
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['shirt', 't-shirt'],
        description: 'Product tags',
        default: null
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty({
        example: ['shirt', 't-shirt'],
        description: 'Product tags',
        default: null
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {

        if(!this.slug) {
            this.slug = this.title 
        }
        
        this.slug = this.slug.toLowerCase()
                .replaceAll(' ', '_')
                .replaceAll('\'', '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug.toLowerCase()
                .replaceAll(' ', '_')
                .replaceAll('\'', '')
    }

}
