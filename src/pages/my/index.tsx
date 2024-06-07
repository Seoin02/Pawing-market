import Link from 'next/link';
import classNames from 'classnames/bind';
import styles from './My.module.scss';
import LoginButton from '@/components/auth/LoginButton';
import ImageBox from '@/components/common/ImageBox';
import Sample from '@/assets/exampleProductImg.jpg';

const cx = classNames.bind(styles);

export default function MyPage() {
  return (
    <div className={cx('myPageLayout')}>
      <span className={cx('myTitle')}>
        공동구매로 최저가 도전!
        <br />
        친구와 함께 할인받으세요
      </span>
      <ImageBox size="myPageFirstPhoto" src={Sample} alt="강아지와 고양이가 환영해주는 사진" />
      <LoginButton />
      <Link href="/">
        <div className={cx('notRegister')}>일단 둘러볼게요</div>
      </Link>
    </div>
  );
}
