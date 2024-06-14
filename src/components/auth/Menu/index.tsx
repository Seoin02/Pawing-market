import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import useAuth from '@/hooks/useAuth';
import ProfileImgBadge from '@/components/common/Badge/ProfileImgBadge';
import NextButton from '@/components/common/Button/NextButton';
import NavBottom from '@/components/common/Nav/Bottom';
import FloatingBox from '@/components/common/Layout/Footer/FloatingBox';

import styles from './Menu.module.scss';

export default function Menu() {
  const [cookies, setCookie, removeCookie] = useCookies(['accessToken', 'refreshToken']);
  const router = useRouter();
  const { userData } = useAuth();

  function handleLogout() {
    removeCookie('accessToken', { path: '/' });
    removeCookie('refreshToken', { path: '/' });
  }

  return (
    <div className={styles.menuLayout}>
      <h1>마이페이지</h1>
      <div className={styles.profileArea}>
        <ProfileImgBadge size="large" />
        <h2>{userData.nickname}</h2>
      </div>
      <div className={styles.centerBorder} />
      <div className={styles.menuList}>
        <NextButton href="/my/order">주문내역</NextButton>
        <NextButton href="">내 리뷰</NextButton>
        <hr />
        <NextButton href="/my/info">회원정보</NextButton>
        <NextButton href="/my/profile">프로필 수정</NextButton>
        <NextButton href="">배송지 목록</NextButton>
        <hr />
        <NextButton href="/" onClick={handleLogout}>
          로그아웃
        </NextButton>
      </div>
      <FloatingBox id={'bottomBox'}>
        <NavBottom />
      </FloatingBox>
    </div>
  );
}
