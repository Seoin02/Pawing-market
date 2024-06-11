import Image from 'next/image';
import classNames from 'classnames/bind';

import Stock from '@/assets/svgs/stock.svg';
import ThumbsUp from '@/assets/svgs/thumbs-up.svg';
import styles from './Tag.module.scss';

type TagProps = {
  children: React.ReactNode;
  color?: string;
  fontColor?: string;
  size: 'small' | 'medium' | 'big' | 'huge';
  type?: 'stock' | 'thumbsUp';
  className?: string;
};

const cx = classNames.bind(styles);

function Tag({ children, color = '#000000', fontColor = '#000000', size, type, className }: TagProps) {
  const iconSize = size === 'huge' ? 13 : size === 'big' ? 8 : 6;
  return (
    <div
      className={cx('tag', className)}
      data-size={size}
      data-type={type}
      style={{
        background: `${color}`,
        color: `${fontColor}`,
      }}>
      {type === 'stock' && <Stock alt={type} width={iconSize} height={iconSize} viewBox="0 0 12 12" />}
      {type === 'thumbsUp' && <ThumbsUp alt={type} width={iconSize} height={iconSize} viewBox="0 0 10 10" />}
      {children}
    </div>
  );
}

export default Tag;
