import React, { useEffect, useState, useRef } from 'react';
import styles from './Payment.module.scss';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { nanoid } from 'nanoid';
import Button from '@/components/common/Button';
import PaymentAgree from '@/components/payment/PaymentAgree';
import TotalPay from '@/components/payment/TotalPay';
import Card from '@/components/payment/Card';
import Header from '@/components/common/Layout/Header';
import BottomModal from '@/components/common/Modal/Base/BottomModal';
import Input from '@/components/common/Input';
import BackButton from '@/components/common/Button/BackButton';
import { fetchCartProducts } from '@/apis/cartApi';
import { completePayment } from '@/apis/paymentApi';
import { Product } from '@/pages/cart';
import { useQuery } from '@tanstack/react-query';
import clock from '@/assets/images/clock.png';
import Image from 'next/image';
import { useRouter } from 'next/router';

const widgetClientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
const customerKey = '-YY27b1BN-PCQD_5Qwp9X';

export default function Payment() {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null);
  const [price, setPrice] = useState(0); // 기본 가격 설정
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [deliveryMessage, setIsDeliveryMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const cartData = sessionStorage.getItem('cartData');
    if (cartData) {
      const parsedProducts = JSON.parse(cartData) as Product[];
      setProducts(parsedProducts);
      const calculatedPrice = parsedProducts.reduce(
        (total, product) =>
          total + product.productCost * product.productNumber + product.combinationPrice * product.productNumber,
        0
      );
      setPrice(calculatedPrice);
    }
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1';
    script.async = true;
    script.onload = () => {
      const fetchPaymentWidget = async () => {
        try {
          const loadedWidget = await loadPaymentWidget(widgetClientKey, customerKey);
          setPaymentWidget(loadedWidget);
        } catch (error) {
          console.error('Error fetching payment widget:', error);
        }
      };

      fetchPaymentWidget();
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (paymentWidget == null) {
      return;
    }

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      '#payment-widget',
      { value: price },
      { variantKey: 'DEFAULT' }
    );

    paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });

    paymentMethodsWidgetRef.current = paymentMethodsWidget;
  }, [paymentWidget, price]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    if (paymentMethodsWidget == null) {
      return;
    }

    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  const handlePaymentRequest = async () => {
    try {
      const firstProductTitle = products?.[0]?.productTitle || '';
      const remainingProductCount = (products?.length || 0) - 1;
      const orderName =
        remainingProductCount > 0 ? `${firstProductTitle} 외 ${remainingProductCount}건` : firstProductTitle;
      console.log(orderName);
      const response = await paymentWidget?.requestPayment({
        orderId: nanoid(),
        orderName,
        successUrl: `${window.location.origin}/payment/paymentSuccess`,
        failUrl: `${window.location.origin}/payment/fail`,
      });

      if (response) {
        const { orderId, paymentKey } = response;
        const deliveryMessageValue = deliveryMessage;
        const postData = {
          deliveryMessage: deliveryMessageValue,
          orderId,
          paymentKey,
        };
        await completePayment(postData);
        console.log('결제 완료: ', postData);
      }
    } catch (error) {
      console.error('Error requesting payment:', error);
    }
  };

  function calculateTotalOriginalPrice() {
    return products ? products.reduce((total, product) => total + product.originalCost * product.productNumber, 0) : 0;
  }

  const totalOriginalPrice = calculateTotalOriginalPrice();
  const totalPrice = price;
  const productCount = products ? products.length : 0;

  return (
    <div className={styles.payment}>
      <Header.Root className={styles.headerRoot}>
        <Header.Box>
          <Header.Left>
            <BackButton />
          </Header.Left>
          <Header.Center className={styles.headerName}>결제</Header.Center>
        </Header.Box>
      </Header.Root>
      <div className={styles.deliveryMessage}>
        <Input
          id="recipient"
          type="text"
          size="large"
          label="배송메시지"
          labelStyle={'label'}
          placeholder="예) 부재시 집 앞에 놔주세요"
        />
      </div>
      <div className={styles.rectangle}></div>
      <div className={styles.orderProduct}>
        <div className={styles.orderTitle}>
          <div className={styles.howMany}>
            <div>주문 상품</div>
            <span className={styles.howManyCount}>{productCount}개</span>
          </div>
        </div>
        <div className={styles.line}></div>
      </div>
      {products?.map((product, index) => (
        <Card
          key={product.id}
          productTitle={product.productTitle}
          option={product.option}
          productCost={product.productCost}
          originalCost={product.originalCost}
          productNumber={product.productNumber}
          imageUrl={product.imageUrl}
          isLast={index === products.length - 1}
        />
      ))}
      <div className={styles.rectangle}></div>
      <TotalPay totalPrice={totalPrice} totalOriginalPrice={totalOriginalPrice} productCount={productCount} />
      <div className={styles.rectangle}></div>
      <div id="payment-widget"></div>
      <div id="agreement"></div>
      <div className={styles.paymentAgree}>
        <PaymentAgree onCheckboxChange={setCheckboxChecked} />
        <div className={styles.paymentButton}>
          <Button
            size="large"
            backgroundColor="$color-pink-main"
            onClick={handlePaymentRequest}
            disabled={!checkboxChecked}>
            {totalPrice}원 주문하기
          </Button>
        </div>
      </div>
      <BottomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalContent}>
          <Image className={styles.clockImg} src={clock} width={168} height={120} alt="clockImg" />
          <div className={styles.warning}>공동구매는 빨리 성사되지 않으면 취소될 수 있어요</div>
          <div className={styles.detailWarning}>
            24시간 내 공동구매 참여자가 없거나, 공동구매 성사 전에 품절되면 주문이 취소될 수 있어요.
          </div>
          <Button size="large" backgroundColor="$color-gray-800" onClick={() => setIsModalOpen(false)}>
            이해했어요
          </Button>
        </div>
      </BottomModal>
    </div>
  );
}
