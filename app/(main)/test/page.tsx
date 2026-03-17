// app/(main)/init-data/page.tsx
"use client";

import { initTelegramApp } from "@/app/utils/initializer";
import { initDataAuthDate } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBackButton } from "@/app/hooks/use-back-button";
import type { TelegramWebApp } from "@/app/types/telegram";

async function sendToBackend(initData: string | null) {
	if (!initData) {
		console.error("Cannot send data to backend: initData not available");
		return;
	}

	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
	const backendUrl = `${baseUrl}/auth/telegram`;
	console.log("Sending initData to backend at:", backendUrl);

	try {
		const response = await fetch(backendUrl, {
			method: "POST",
			headers: {
				Authorization: `tma ${initData}`,
				"Content-Type": "application/json",
			},
		});

		console.log("Backend response status:", response.status);
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Backend request failed with status ${response.status}: ${errorText}`);
		}

		const responseData = await response.json();
		console.log("Successfully sent initData to backend:", responseData);
	} catch (error) {
		const backendError = error instanceof Error ? error : new Error("Unknown backend error");
		console.error("Failed to send initData to backend:", backendError);
	}
}

export default function InitData() {
	const [telegramApp, setTelegramApp] = useState<TelegramWebApp | null>(null);
	const [authData, setAuthData] = useState<Date | null>(null);
	const router = useRouter();

	useEffect(() => {
		const app = initTelegramApp();
		if (app) {
			setTelegramApp(app);
			setAuthData(initDataAuthDate() || null);
		}
	}, []);

	const backButtonControls = useBackButton({
		onBack: () => {
			console.log("Navigating back...");
			router.back();
		},
		autoShow: true,
	});

	return (
		<div className="w-full min-h-screen flex flex-col">
			<header className="w-full py-6 bg-gray-50 border-b">
				<div className="flex items-center justify-between px-4">
					<h1 className="text-2xl font-bold text-center flex-1">INIT DATA</h1>
					<div className="flex space-x-2">
						<button
							onClick={backButtonControls.show}
							className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
						>
							Show
						</button>
						<button
							onClick={backButtonControls.hide}
							className="px-3 py-1 bg-red-500 text-white text-sm rounded"
						>
							Hide
						</button>
					</div>
				</div>
			</header>
			<div className="flex-1 w-full flex justify-center items-start p-4">
				<div className="w-full max-w-4xl space-y-4">
					<div className="bg-blue-50 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">Back Button Status</h3>
						<p className="text-sm">Visible: {backButtonControls.isVisible() ? "Yes" : "No"}</p>
						<p className="text-sm text-gray-600 mt-1">Press the Telegram back button to navigate back</p>
					</div>
					<div className="bg-gray-100 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">Telegram Init Data</h3>
						<div className="break-all text-sm font-mono">
							{telegramApp?.initData || "No init data available"}
						</div>
					</div>
				</div>
			</div>
			<div className="bg-green-100 p-4 rounded-lg">
				<p>Auth Date: {telegramApp?.initDataUnsafe.auth_date?.toString() || "N/A"}</p>
				<p>Your username is {telegramApp?.initDataUnsafe.user?.username || "N/A"}</p>
				<p>Auth Date (SDK): {authData?.toISOString() || "N/A"}</p>
				<button
					onClick={() => sendToBackend(telegramApp?.initData ?? null)}
					className="px-4 py-2 bg-blue-500 text-white rounded"
				>
					Send to Backend
				</button>
			</div>
		</div>
	);
}
