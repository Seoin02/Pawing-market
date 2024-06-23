import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames/bind';
import purchaseApi from '@/apis/purchase/api';
import { getReviewableData, getWroteReviewList } from '@/apis/myReviewAPI';
import BackButton from '@/components/common/Button/BackButton';
import ReviewCard from '@/components/review/ReviewCard';
import { ProductInfo } from '@/components/common/Card';
import Header from '@/components/common/Layout/Header';
import WroteReviewCard from '@/components/review/WroteReviewCard';

import styles from './Review.module.scss';

const cx = classNames.bind(styles);

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
  const { reviewId } = router.query;

  const { data: purchaseData } = useQuery({ queryKey: ['purchase'], queryFn: purchaseApi.getPurchase });

  //TODO: 배송 완료 상품 데이터 추가 후 적용
  const { data: reviewableData } = useQuery({
    queryKey: ['reviewable'],
    queryFn: getReviewableData,
  });

  const { data: wroteReviews } = useQuery({
    queryKey: ['wroteReviews'],
    queryFn: getWroteReviewList,
  });

  const reviewableList =
    purchaseData &&
    purchaseData.data.map((item: PurchaseDataProps) =>
      item.purchaseProducts.map((product: ProductInfo) => ({
        productId: product.productId,
        title: product.title,
        thumbNailImage: product.thumbNailImage,
        originalPrice: product.originalPrice,
        price: product.price,
        option: product.combinationName,
        quantity: product.quantity,
        stock: 1,
      }))
    );

  console.log(reviewableData?.data);
  console.log(wroteReviews);
  console.log(purchaseData);

  //TODO: 리뷰 작성 후 테스트 때 적용
  const myReviewList =
    wroteReviews &&
    wroteReviews.data.map((item: PurchaseDataProps) =>
      item.purchaseProducts.map((product: ProductInfo) => ({
        productId: product.productId,
        title: product.title,
        thumbNailImage: product.thumbNailImage,
        originalPrice: product.originalPrice,
        price: product.price,
        option: product.combinationName,
        quantity: product.quantity,
        stock: 1,
      }))
    );

  const purchaseProductId = purchaseData?.data.map((item: PurchaseDataProps) => {
    return item.id;
  });

  function handleClickWriteReview() {
    router.push({
      pathname: `/my/review/write`,
      query: {
        reviewableData: reviewableData && reviewableData.data,
        purchaseData: purchaseData && purchaseData.data,
        productId: purchaseData && purchaseData.data[0].id,
        purchaseProductId: purchaseData && purchaseData.data[0].purchaseProducts[0].productId,
      },
    });
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
            <BackButton />
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
                  productInfo={{ ...purchase, stock: 3, option: purchase.combinationName }}
                  onClick={handleClickWriteReview}
                />
              ))}
            </div>
          ) : (
            <div className={styles.noReview}>지금은 리뷰를 작성해야 할 상품이 없어요.</div>
          )
        ) : wroteReviews && wroteReviews.data.length > 0 ? (
          <div className={styles.reviewCardList}>
            {wroteReviews.data?.map((review: ProductInfo) => (
              <WroteReviewCard
                href={`/my/review/${reviewId || purchaseProductId}`}
                key={review.productId}
                productInfo={review}
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
