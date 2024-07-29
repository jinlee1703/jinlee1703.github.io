---
layout: post
title: TypeORM - 'parent_id' cannot be null 이슈
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## Background

&nbsp; 필자가 NestJS를 통한 TypeORM을 사용하면서 겪었던 흥미로운 문제를 겪게 되었다. `'parent_id' cannot be null` 이슈였는데, 이를 어떻게 해결했는지와 그 해결 과정을 공유하고자 한다.

---

## Problem

&nbsp; 필자의 소스 코드보다 간단한 예제를 준비하여 설명하도록 하겠다. 이 시스템에서는 Product와 Review 두 개의 주요 엔티티가 있다. 각 엔티티의 구조는 다음과 같다.

### Product Table

| 컬럼명      | 데이터 타입 | 설명      |
| ----------- | ----------- | --------- |
| id          | INTEGER     | 기본 키   |
| name        | VARCHAR     | 상품명    |
| price       | DECIMAL     | 가격      |
| description | TEXT        | 상품 설명 |

### Review Table

| 컬럼명     | 데이터 타입 | 설명                               |
| ---------- | ----------- | ---------------------------------- |
| id         | INTEGER     | 기본 키                            |
| content    | TEXT        | 리뷰 내용                          |
| rating     | INTEGER     | 평점                               |
| product_id | INTEGER     | 외래 키 (Product 테이블의 id 참조) |

&nbsp; 이 구조에서 Product와 Review는 일대다(1:N) 관계를 가진다. 즉, 하나의 Product는 여러 개의 Review를 가질 수 있다.<br>

&nbsp; TypeORM에서 이러한 관계는 다음과 같이 정의될 수 있다.

### Entities

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("decimal")
  price: number;

  @Column("text")
  description: string;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  content: string;

  @Column()
  rating: number;

  @ManyToOne(() => Product, (product) => product.reviews)
  product: Product;
}
```

### Service Logic

```typescript
async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<ProductDto> {
  const product = await this.productRepository.findOne({ where: { id }, relations: ['reviews'] })

  if (!product) {
    throw new NotFoundException(`Product ID: ${id} not found`)
  }

  const updatedProduct = {
    ...product,
    ...updateProductDto,
    id: product.id,
  }

  const savedProduct = await this.productRepository.save(updatedProduct)

  return plainToInstance(ProductDto, savedProduct)
}
```

&nbsp; TypeORM을 사용해 데이터베이스와 상호작용하고 있었는데, 상품 정보를 업데이트하는 과정에서 예상치 못한 오류가 발생했다.

```
[ShopingMall] Error 7/29/2024, 5:49:36 AM [ProductService] Error occurred: Column 'product_id' cannot be null - { stack: [ null ] } +10s
```

## Error Cause

&nbsp; 이 이슈의 근본적인 원인은 TypeORM의 save 메서드의 동작 방식과 관련이 있다.

1. TypeORM의 save 메서드는 전체 객체를 저장하려고 시도한다. 이 과정에서 관련된 모든 엔티티(이 경우 reviews)도 함께 처리하려고 한다.
2. updatedProduct 객체를 생성할 때, reviews 관계가 제대로 처리되지 않았다.
3. 결과적으로 save 메서드는 reviews 배열의 각 항목에 대해 새로운 레코드를 생성하려고 시도한다.
4. 이 때 새로 생성되는 review 항목들에 parent_id(즉, product_id)가 설정되지 않아 오류가 발생한 것이다.

## Solution

&nbsp; 필자는 이 문제를 해결하기 위해 TypeORM의 merge 메서드를 사용하는 방법을 택했다. merge 메서드를 사용하면 기존 엔티티와 새로운 데이터를 안전하게 병합해준다. 수정된 코드는 아래와 같다.

```typescript
async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<ProductDto> {
  const product = await this.productRepository.findOne({ where: { id }, relations: ['reviews'] })

  if (!product) {
    throw new NotFoundException(`Product ID: ${id} not found`)
  }

  // reviews를 제외한 나머지 필드만 업데이트
  const updatedProduct = this.productRepository.merge(product, updateProductDto);

  const savedProduct = await this.productRepository.save(updatedProduct)

  return plainToInstance(ProductDto, savedProduct)
}
```

&nbsp; 위와 같이 merge 메서드를 사용할 경우 얻는 이점은 다음과 같다.

1. merge 메서드는 기존 엔티티의 관계(이 경우 reviews)를 유지하면서 다른 필드들을 안전하게 업데이트한다.
2. 엔티티의 기본 관계를 유지하면서 새로운 데이터로 엔티티를 업데이트하므로, `'parent_id' cannot be null` 이슈를 방지할 수 있다.

### ETC.

&nbsp; 이 해결책을 적용할 때 몇 가지 추가로 고려해야 할 사항이 있다.<br>

&nbsp; reviews도 업데이트해야 한다면, 별도의 로직으로 처리해야 한다. 예를 들어, 기존 리뷰를 삭제하고 새로운 리뷰를 추가하는 방식으로 구현할 수 있다.<br>

&nbsp; cascade 옵션이 설정되어 있다면, 관련된 reviews에 대한 변경사항도 자동으로 저장될 수 있으므로 주의가 필요하다.

---

## Summary

&nbsp; 이 `'parent_id' cannot be null` 이슈는 TypeORM의 save 메서드 사용 시 관계 엔티티 처리 방식 때문에 발생하였고, merge 메서드를 사용하여 위와 같은 문제를 해결할 수 있었다.<br>

&nbsp; ORM의 메서드들이 어떻게 동작하는지 내부 동작을 이해할 필요가 있다는 것을 느끼게 되었고, 관계 엔티티를 다룰 때는 주의할 필요가 있다는 생각을 하게 되었다. 만약 TC를 작성할 수 있었다면 보다 쉽게 해결할 수 있었던 이슈였던 것 같고, 이를 통해 또 한번 TC의 소중함을 느끼게 되었다.
