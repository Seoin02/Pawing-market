import classNames from 'classnames/bind';
import Header from '@/components/common/Layout/Header';
import styles from './Delivery.module.scss';
import DeliveryCard from '@/components/common/DeliveryCard';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import DeliveryEmptyView from '@/components/delivery/EmptyView';
import Button from '@/components/common/Button';
import { DeliveryInfo } from '@/types/components/delivery';
import axios from '@/apis/axiosInstance';
import { isAxiosError } from 'axios';
import useToast from '@/hooks/useToast';
import { FETCH_ERROR_MESSAGE, SERVER_ERROR_MESSAGE } from '@/constants/errorMessage';
import CheckedButton from '@/assets/svgs/btn-radio-checked.svg';
import UncheckedButton from '@/assets/svgs/btn-radio.svg';
import { QueryClient, dehydrate, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import LeftArrow from '@/assets/svgs/left-arrow.svg';
import useAuth from '@/hooks/useAuth';
import { GetServerSidePropsContext } from 'next';
import { fetchMyData } from '@/apis/userApi';

const cx = classNames.bind(styles);

const BOTTOM_BOX_ID = 'bottomBox';

const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3MTg2OTIyMDAsImV4cCI6MTcxODY5OTQwMH0.0FbXlHrTeLloQAWOw4BDDQ5xln52l4UzSiI2WP4eskw';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  const accessToken = context.req.cookies['accessToken'];

  await queryClient.prefetchQuery({ queryKey: ['user', accessToken], queryFn: fetchMyData });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default function PaymentDeliveryPage() {
  const router = useRouter();
  const prevPath = router.query?.prevPath;
  const { isLogin } = useAuth();
  const { userData } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryInfo[]>([]);
  const [selectedOption, setSelectedOption] = useState<DeliveryInfo | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const topContentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // useEffect(() => {
  //   if (!isLogin) {
  //     router.push('/my');
  //   }
  // }, [isLogin, router]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios('/deliveries', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }); // 서버에서 옵션 데이터를 받아오는 API 엔드포인트
        const deliveries: DeliveryInfo[] = res.data;
        setDeliveries(deliveries);

        // isDefault 값이 true인 객체를 찾음
        const defaultOption = deliveries.find(option => option.isDefault === true);
        if (defaultOption) {
          setSelectedOption(defaultOption);
        }
      } catch (error) {
        if (!isAxiosError(error)) {
          // `AxiosError`가 아닌 경우
          showToast({
            status: 'error',
            message: FETCH_ERROR_MESSAGE.UNKNOWN,
          });
          return;
        }
        // `AxiosError`인 경우 에러 처리
        if (!error.response) {
          showToast({
            status: 'error',
            message: FETCH_ERROR_MESSAGE.REQUEST,
          });
          return;
        }
        const status = error.response?.status;
        switch (status) {
          case 404:
            showToast({
              status: 'error',
              message: SERVER_ERROR_MESSAGE.USER.NOT_FOUND,
            });
            return;
        }
      }
    };

    fetchOptions();
  }, [showToast]);

  const handleOptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = deliveries.find(option => option.id === parseInt(e.target.value));
    selected && setSelectedOption(selected);
  };

  const { mutate: updateAddress } = useMutation({
    mutationFn: async ({ selectedOption, updatedOption }: any) => {
      const res = await axios.put(`/deliveries/${selectedOption.id}`, JSON.stringify(updatedOption), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = res.data;
      console.log('Response:', data);
      return data;
    },
    onSuccess: () => {
      if (prevPath) {
        router.push(Array.isArray(prevPath) ? prevPath[0] : prevPath);
        return;
      }
      router.back();
    },

    onError: error => {
      if (!isAxiosError(error)) {
        // `AxiosError`가 아닌 경우
        showToast({
          status: 'error',
          message: FETCH_ERROR_MESSAGE.UNKNOWN,
        });
        return;
      }
      // `AxiosError`인 경우 에러 처리
      if (!error.response) {
        showToast({
          status: 'error',
          message: FETCH_ERROR_MESSAGE.REQUEST,
        });
        return;
      }
      const status = error.response?.status;
      switch (status) {
        case 400:
          showToast({
            status: 'error',
            message: SERVER_ERROR_MESSAGE.USER.NOT_FOUND,
          });
          return;
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('abc');
    e.preventDefault();
    if (!selectedOption) return;

    // 선택된 옵션 객체를 복사하고 isDefault 값을 true로 변경
    const updatedOption = { ...selectedOption, isDefault: true };

    updateAddress({ selectedOption, updatedOption });
  };

  const handleAddDeliveryCardButtonClick = () => {
    router.push('/ payment/delivery/add');
  };

  useEffect(() => {
    const adjustButtonPosition = () => {
      const button = buttonRef.current;
      const topContent = topContentRef.current;

      if (!button || !topContent) {
        return;
      }

      const topContentRect = topContent.offsetHeight;
      const buttonHeight = button.offsetHeight;

      if (topContentRect + buttonHeight > window.innerHeight) {
        button.style.position = 'absolute';
        button.style.bottom = `32px`;
        button.style.left = '50%';
        button.style.transform = 'translate(-50%, 0)';
      } else {
        button.style.position = 'fixed';
        button.style.bottom = '32px';
        button.style.left = '50%';
        button.style.transform = 'translate(-50%, 0)';
      }
    };

    adjustButtonPosition();
    window.addEventListener('resize', adjustButtonPosition);
    return () => {
      window.removeEventListener('resize', adjustButtonPosition);
    };
  }, [deliveries]);
  return (
    <div className={cx('delivery')} ref={topContentRef}>
      <form onSubmit={handleSubmit}>
        <Header.Root>
          <Header.Box>
            <Header.Left>
              <button className={cx('backButton')} type="submit">
                <LeftArrow width={24} height={24} alt="뒤로 가기 버튼" />
              </button>
            </Header.Left>
            <h1 className={cx('title')}>배송지 목록</h1>
          </Header.Box>
        </Header.Root>
        {deliveries.length !== 0 ? (
          <div className={cx('deliveries')}>
            {deliveries.map(deliveryInfo => {
              return (
                <label key={deliveryInfo.id} className={cx('label')}>
                  <input
                    type="radio"
                    value={deliveryInfo.id}
                    checked={selectedOption?.id === deliveryInfo.id}
                    onChange={handleOptionChange}
                    style={{ display: 'none' }}
                  />
                  {selectedOption?.id === deliveryInfo.id ? <CheckedButton /> : <UncheckedButton />}
                  <DeliveryCard
                    key={deliveryInfo.id}
                    deliveryInfo={deliveryInfo}
                    deliveries={deliveries}
                    setDeliveries={setDeliveries}
                    checked={selectedOption?.id === deliveryInfo.id}
                  />
                </label>
              );
            })}
          </div>
        ) : (
          <DeliveryEmptyView />
        )}
      </form>
      <div className={cx('button')} ref={buttonRef}>
        <Button size="large" backgroundColor="$color-pink-main" onClick={handleAddDeliveryCardButtonClick}>
          배송지 추가
        </Button>
      </div>
    </div>
  );
}
