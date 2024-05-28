import { useEffect, useRef, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import classNames from 'classnames/bind';

import Tag from '../Tag';
import StarIcon from '@/assets/svgs/star.svg';
import styles from './Card.module.scss';

type ProductInfo = {
  id: number;
  title: string;
  thumbNailImage: string;
  originalPrice: number;
  discountRate: number;
  price: number;
  starRating?: number;
  reviewCount?: number;
  stock?: number;
  option?: string;
  quantity?: number;
};

type CardProps = {
  productInfo: ProductInfo;
  wishList?: boolean;
  direction?: 'column' | 'row';
  size: 'big' | 'small';
};

const cx = classNames.bind(styles);

// direction="row"는 꼭 size="small"과 함께 사용
// option은 string으로 받는 것으로 생각 ex) 닭고기/ 가슴살

export default function Card({ productInfo, wishList = false, direction = 'column', size = 'big' }: CardProps) {
  const {
    title,
    thumbNailImage,
    originalPrice,
    discountRate,
    price,
    starRating,
    reviewCount,
    stock,
    option,
    quantity,
  } = productInfo;

  // title 길이에 따라 흐르게 할지말지 정한다.
  const titleRef = useRef<HTMLDivElement | null>(null);
  const [titleInnerBoxClassName, setTitleInnerBoxClassName] = useState('');
  const [titleWidth, setTitleWidth] = useState(0);

  useEffect(() => {
    const titleElement = titleRef.current;
    if (titleElement) {
      const titleWidth = titleElement.offsetWidth;
      if (size === 'big' && titleWidth > 140 && direction === 'column') {
        setTitleInnerBoxClassName('titleInnerBox');
        setTitleWidth(titleWidth);
      }
      if (size === 'small' && titleWidth > 100 && direction === 'column') {
        setTitleInnerBoxClassName('titleInnerBox');
        setTitleWidth(titleWidth);
      }
    }
  }, [direction, size]);

  const animationDuration = titleWidth / 50;

  return (
    <Link
      href={`/product/${title}`}
      className={cx('card')}
      as="image"
      style={
        {
          '--title-width': `${titleWidth}px`,
          '--animation-duration': `${animationDuration}s`,
          flexDirection: direction === 'column' ? 'column' : 'row',
          gap: direction === 'column' ? '0' : '12px',
          width: size === 'big' ? '140px' : direction === 'row' ? '100%' : '100px',
        } as React.CSSProperties
      }>
      <div
        className={cx('cardImage')}
        style={{
          width: size === 'big' ? '140px' : '100px',
          height: size === 'big' ? '140px' : '100px',
          flexShrink: '0',
        }}>
        <Image
          src={thumbNailImage}
          alt={title}
          fill
          blurDataURL={'@/assets/svgs/rectangle.svg'}
          placeholder="blur"
          sizes={size === 'big' ? '(max-width: 140px) 100vw, 140px' : '(max-width: 100px) 100vw, 100px'}
        />
        {/* 찜하기 버튼 */}
      </div>
      <div
        className={cx('cardContent')}
        style={{ margin: direction === 'column' ? (size === 'big' ? '12px 0' : '4px 0') : '12px 0 4px' }}>
        <div
          className={cx('titleBox')}
          style={{
            height: size === 'big' || direction === 'row' ? '20px' : '12px',
          }}>
          <div className={cx(titleInnerBoxClassName)}>
            <div
              className={cx('title')}
              ref={titleRef}
              style={{
                fontSize: size === 'big' || direction === 'row' ? '14px' : '10px',
                textOverflow: direction === 'column' ? 'none' : 'ellipsis',
                overflow: direction === 'column' ? 'none' : 'hidden',
                width: direction === 'column' ? 'none' : '100%',
              }}>
              {title}
            </div>
            {titleInnerBoxClassName && direction === 'column' && (
              <h3
                className={cx('title')}
                style={{
                  fontSize: size === 'big' ? '14px' : '10px',
                  whiteSpace: direction === 'column' ? 'nowrap' : '',
                }}>
                {title}
              </h3>
            )}
          </div>
        </div>
        {option && quantity && (
          <p className={cx('option')}>
            {option}|{quantity}개
          </p>
        )}
        <p className={cx('originalPrice')} style={{ fontSize: size === 'big' || direction === 'row' ? '12px' : '8px' }}>
          {originalPrice}원
        </p>
        <div className={cx('discountedPrice')}>
          <p
            className={cx('discountRate')}
            style={{ fontSize: size === 'big' || direction === 'row' ? '16px' : '12px' }}>
            {discountRate}%
          </p>
          <p className={cx('price')} style={{ fontSize: size === 'big' || direction === 'row' ? '16px' : '12px' }}>
            {price}원
          </p>
        </div>
        {direction === 'column' && starRating !== null && starRating !== undefined && (
          <div className={cx('star')}>
            <StarIcon alt="별" width={9.5} height={9.5} />
            <p className={cx('starRating')} style={{ fontSize: size === 'big' ? '10px' : '8px' }}>
              {starRating}
            </p>
          </div>
        )}
        {direction === 'column' &&
          stock !== null &&
          stock !== undefined &&
          reviewCount !== null &&
          reviewCount !== undefined && (
            <div className={cx('tags')}>
              {stock <= 10 && (
                <Tag size={size === 'big' ? 'big' : 'small'} type="stock">
                  10개 미만
                </Tag>
              )}
              {reviewCount >= 100 && (
                <Tag size={size === 'big' ? 'big' : 'small'} type="thumbsUp">
                  리뷰 100+
                </Tag>
              )}
            </div>
          )}
      </div>
    </Link>
  );
}
