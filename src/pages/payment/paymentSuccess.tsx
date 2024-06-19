import { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './PaymentSuccess.module.scss';
import Lottie from 'react-lottie-player';
import check from '@/assets/images/check.json';
import { completePayment } from '@/apis/paymentApi';

export default function PaymentSuccess() {
  const router = useRouter();
  const { paymentKey, orderId, amount } = router.query;

  useEffect(() => {
    const deliveryMessage = sessionStorage.getItem('deliveryMessage') || '';
    const selectedProductIds = sessionStorage.getItem('selectedProductIds') || '';
    console.log(deliveryMessage);
    console.log(selectedProductIds);
    const amountValue: number = parseFloat(amount as string);

    const sendPaymentData = async () => {
      if (paymentKey && orderId && amount) {
        try {
          const postData = {
            deliveryMessage: deliveryMessage,
            orderId: orderId as string,
            paymentKey: paymentKey as string,
            amount: amountValue,
            selectedProductIds: selectedProductIds,
            groupBuyingId: 0,
            deliveryId: 1,
          };
          const response = await completePayment(postData);
          console.log('결제 완료: ', response);
        } catch (error) {
          console.error('Error completing payment:', error);
        }
      }
    };
    sendPaymentData();
  }, [paymentKey, orderId, amount]);

  // useEffect(() => {
  //   // function fetchData() {
  //   //   try {
  //   //     const postData = {
  //   //       selectedProductIds,
  //   //       amount,
  //   //       deliveryMessage,
  //   //       orderId,
  //   //       paymentKey,
  //   //     };
  //   //     await completePayment(postData);

  //   //   }
  //   // }
  //   // const isGroupBuying = !!postData.g

  //   const timer = setTimeout(() => {
  //     const { paymentKey, orderId, amount } = router.query;
  //     router.push({
  //       pathname: '/payment/paymentSuccessByCart',
  //       query: { paymentKey, orderId, amount },
  //     });
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [router]);
  return (
    <div className={styles.paymentSuccess}>
      <Lottie
        className={styles.successImg}
        loop={false}
        animationData={check}
        play
        style={{ width: 180, height: 180 }}
      />
      <div className={styles.finish}>결제 완료!</div>
    </div>
  );
}
