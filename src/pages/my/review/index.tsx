import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames/bind';
import { purchaseQueries } from '@/apis/purchase/queries';
import { getReviewableData, getWroteReviewList } from '@/apis/myReviewAPI';
import BackButton from '@/components/common/Button/BackButton';
import ReviewCard from '@/components/review/ReviewCard';
import { ProductInfo } from '@/components/common/Card';
import Header from '@/components/common/Layout/Header';
import WroteReviewCard from '@/components/review/WroteReviewCard';
import { WroteReview } from '@/types/review';

import styles from './Review.module.scss';

const cx = classNames.bind(styles);

export interface PurchaseData {
  status?: number;
  id?: number;
  createdAt?: string;
  title?: string;
  combinationName?: string;
  quantity?: number;
  originalPrice?: number;
  price?: number;
  combinationPrice?: number;
  thumbNailImage?: string;
  deliveryCompany?: string;
  trackingNumber?: string;
  productId: string | number;
  review?: null | any;
}

export interface PurchaseDataProps {
  id: number;
  createdAt: string;
  paymentStatus: number;
  purchaseProducts: ProductInfo[];
}

export default function Review() {
  const [reviewWrite, setReviewWrite] = useState(true);
  const [myReview, setMyReview] = useState(false);

  const router = useRouter();

  const { data: purchaseData } = useQuery(purchaseQueries.queryOptions());

  const { data: reviewableData } = useQuery({
    queryKey: ['reviewable'],
    queryFn: getReviewableData,
  });

  const { data: wroteReviews } = useQuery({
    queryKey: ['wroteReviews'],
    queryFn: getWroteReviewList,
  });
  console.log(wroteReviews);
  const purchaseId = purchaseData?.data.flatMap((item: PurchaseDataProps) =>
    item.purchaseProducts.map((item: ProductInfo) => {
      return item.productId;
    })
  );

  const purchaseProductId = purchaseData?.data.flatMap((item: PurchaseDataProps) => {
    return item.id;
  });

  function handleClickWriteReview(purchase: PurchaseData) {
    console.log(purchase);
    return () => {
      router.push({
        pathname: `/my/review/write`,
        query: {
          id: purchase.id,
          title: purchase.title,
          combinationName: purchase.combinationName,
          quantity: purchase.quantity,
          thumbNailImage: purchase.thumbNailImage,
          productId: purchase.productId,
        },
      });
    };
  }

  function handleClickReviewDetail(review: WroteReview) {
    return () => {
      router.push(
        {
          pathname: `/my/review/[reviewId]`,
          query: {
            id: review.id,
          },
        },
        `/my/review/${review.id}`
      );
    };
  }

  function handleClickWrite() {
    setReviewWrite(true);
    setMyReview(false);
  }

  function handleClickMyReview() {
    setMyReview(true);
    setReviewWrite(false);
  }

  return (
    <div className={styles.reviewLayout}>
      <Header.Root>
        <Header.Box>
          <Header.Left>
            <BackButton href="/my" />
          </Header.Left>
          <h1>내 리뷰</h1>
        </Header.Box>
      </Header.Root>
      <div className={styles.reviewSelector}>
        <button className={cx('reviewSelectButton', { clickButton: reviewWrite })} onClick={handleClickWrite}>
          리뷰 쓰기
        </button>
        <button className={cx('reviewSelectButton', { clickButton: myReview })} onClick={handleClickMyReview}>
          내가 쓴 리뷰
        </button>
      </div>
      <>
        {reviewWrite ? (
          reviewableData && reviewableData.data.length > 0 ? (
            <div className={styles.reviewCardList}>
              {reviewableData.data.map((purchase: ProductInfo) => (
                <ReviewCard
                  key={purchase.productId}
                  productInfo={{
                    ...purchase,
                    stock: 3,
                    option: purchase.combinationName,
                    originalPrice: purchase.originalPrice * (purchase?.quantity || 0),
                    price: purchase.price * (purchase?.quantity || 0),
                  }}
                  onClick={handleClickWriteReview(purchase)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.noReview}>지금은 리뷰를 작성해야 할 상품이 없어요.</div>
          )
        ) : wroteReviews && wroteReviews.data.length > 0 ? (
          <div className={styles.reviewCardList}>
            {wroteReviews.data?.map((review: any) => (
              <WroteReviewCard
                href={`/my/review/${review.review.id}`}
                key={review.productId}
                productInfo={{
                  ...review,
                  stock: 3,
                  option: review.combinationName,
                  originalPrice: review.originalPrice * (review?.quantity || 0),
                  price: review.price * (review?.quantity || 0),
                }}
                onClick={handleClickReviewDetail(review.review)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.noReview}>아직 내가 쓴 리뷰가 없어요.</div>
        )}
      </>
    </div>
  );
}
