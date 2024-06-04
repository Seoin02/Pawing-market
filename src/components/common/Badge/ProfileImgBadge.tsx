import Image from 'next/image';
import classNames from 'classnames/bind';
import ProfileIcon from '@/assets/svgs/profile-icon.svg';
import styles from './ProfileImgBadge.module.scss';

interface ProfileImaBadgeProps {
  profileImage?: string;
  className?: string;
  size: 'small' | 'large';
}

const cx = classNames.bind(styles);

export default function ProfileImgBadge({ profileImage = '', className, size }: ProfileImaBadgeProps) {
  return (
    <>
      {profileImage.length > 0 ? (
        <div className={cx(size, className)}>
          <Image src={profileImage} alt="프로필 이미지" layout="fill" objectFit="cover" />
        </div>
      ) : (
        <div className={cx(size, className)}>
          <ProfileIcon />
        </div>
      )}
    </>
  );
}
