// hooks/use-back-button.ts
"use client";

import { useEffect, useCallback } from 'react';
import { backButton } from '@telegram-apps/sdk-react';

interface UseBackButtonOptions {
	onBack?: () => void;
	autoShow?: boolean;
}

export const useBackButton = ({ onBack, autoShow = true }: UseBackButtonOptions = {}) => {
	// Инициализация и монтирование кнопки
	useEffect(() => {
		const initializeBackButton = async () => {
			try {
				// Avoid initializing outside Telegram WebApp
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if (typeof window === "undefined" || !(window as any).Telegram?.WebApp) {
					return;
				}

				// Монтируем Back Button если еще не смонтирован
				if (!backButton.isMounted()) {
					backButton.mount();
					console.log('Back Button mounted');
				}

				// Показываем кнопку если autoShow включен
				if (autoShow) {
					backButton.show();
					console.log('Back Button shown');
				}
			} catch (error) {
				console.error('Failed to initialize back button:', error);
			}
		};

		 initializeBackButton();
	}, [autoShow]);

	// Обработчик клика
	useEffect(() => {
		if (!onBack) return;

		const handleBackClick = () => {
			console.log('Back button clicked');
			onBack();
		};

		// Подписываемся на событие клика
		const unsubscribe = backButton.onClick(handleBackClick);

		return () => {
			// Отписываемся при размонтировании
			unsubscribe();
		};
	}, [onBack]);

	// Методы для управления кнопкой
	const showBackButton = useCallback(() => {
		if (backButton.isMounted()) {
			backButton.show();
		}
	}, []);

	const hideBackButton = useCallback(() => {
		if (backButton.isMounted()) {
			backButton.hide();
		}
	}, []);

	const isVisible = useCallback(() => {
		return backButton.isMounted() && backButton.isVisible();
	}, []);

	// Cleanup при размонтировании компонента
	useEffect(() => {
		return () => {
			if (backButton.isMounted()) {
				backButton.hide();
				console.log('Back Button hidden on cleanup');
			}
		};
	}, []);

	return {
		show: showBackButton,
		hide: hideBackButton,
		isVisible,
	};
};
