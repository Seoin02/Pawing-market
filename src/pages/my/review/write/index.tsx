import { ChangeEvent, useState } from 'react';
import Header from '@/components/common/Layout/Header';
import BackButton from '@/components/common/Button/BackButton';
import ReviewProductDataCard from '@/components/common/review/ReviewProductDataCard';
import StarRating from '@/components/common/review/StarRating';
import Textarea from '@/components/common/review/Textarea';
import styles from './WritePage.module.scss';
import { postReview } from './reviewWriteAPI';
import useToast from '@/hooks/useToast';

const BOTTOM_BOX_ID = 'bottomBox';

export default function WritePage() {
  const [rating, setRating] = useState(0);
  const [description, setDescriprion] = useState('');
  const { showToast, setPortalId } = useToast(BOTTOM_BOX_ID);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescriprion(event.target.value);
  };

  const handleSaveReview = async () => {
    const reviewData = {
      rating,
      description,
    };

    try {
      const response = await postReview(reviewData);
      console.log(response);
      window.location.href = '/my/review/reviewId';
    } catch (error) {
      console.log(error);
      if (error.status === 401) {
        showToast({
          status: 'error',
          message: '리뷰 작성 실패',
          linkMessage: '다시 로그인하기',
          linkProps: {
            href: '/auth',
          },
        });
      } else {
        showToast({
          status: 'error',
          message: '리뷰 작성 실패',
        });
      }
    }
  };

  const isBtnDisabled = rating === 0 || description.trim() === '';

  return (
    <div className={styles.writePageLayout}>
      <Header.Root>
        <Header.Box>
          <Header.Left>
            <BackButton />
          </Header.Left>
          <Header.Center className={styles.pageTitle}>리뷰 작성</Header.Center>
        </Header.Box>
      </Header.Root>
      <div>
        <ReviewProductDataCard />
        <div className={styles.ratingBox}>
          <p className={styles.ratingQuestion}>전반적으로 어떠셨나요?</p>
          <StarRating editable rating={rating} onRate={setRating} />
        </div>
        <div className={styles.textareaBox}>
          <p className={styles.descriptionQuestion}>
            구체적으로 어떤 점이 좋았는지, 또는 어떤 점이 아쉬웠는지 작성해 주세요.
          </p>
          <Textarea
            className={styles.textareaStyle}
            placeholder={'리뷰를 작성해 주세요.'}
            value={description}
            onChange={handleChange}
          />
        </div>
        <button className={styles.reviewSaveBtn} disabled={isBtnDisabled} onClick={handleSaveReview}>
          저장
        </button>
      </div>
    </div>
  );
}
