import axios from "axios";
import axiosInstance from "@lib/api/axiosInstance";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
const baseURL2 = process.env.NEXT_PUBLIC_BASE_URL_V2;

export const sendCard = async (
	content: string,
	writerName: string,
	seasonId: number | null,
	image: string | null,
	memberId?: number | null,
) => {
	try {
		const formData = new FormData();

		formData.append(
			"req",
			new Blob(
				[
					JSON.stringify({
						content: content,
						writerName: writerName,
						...(seasonId !== null ? { seasonId: seasonId } : {}),
						...(memberId ? { memberId: memberId } : {}),
					}),
				],
				{
					type: "application/json",
				},
			),
		);

		if (image) {
			try {
				if (image.startsWith("data:image")) {
					if (!image.includes("base64,")) {
						throw new Error("Invalid base64 image format");
					}

					const base64Data = image.split(",")[1];
					let binaryString: string;

					try {
						binaryString = window.atob(base64Data);
					} catch (e) {
						console.error("Base64 디코딩 실패:", e);
						throw new Error("Invalid base64 encoding");
					}

					const bytes = new Uint8Array(binaryString.length);
					for (let i = 0; i < binaryString.length; i++) {
						bytes[i] = binaryString.charCodeAt(i);
					}

					const imageBlob = new Blob([bytes], { type: "image/png" });
					const imageFile = new File([imageBlob], "card-image.png", { type: "image/png" });

					formData.append("image", imageFile);
				} else {
					try {
						const response = await fetch(image);
						if (!response.ok) throw new Error("Failed to fetch image");
						const blob = await response.blob();
						const imageFile = new File([blob], "card-image.png", { type: blob.type });
						formData.append("image", imageFile);
					} catch (fetchError) {
						console.error("이미지 가져오기 실패:", fetchError);
						throw new Error("이미지 가져오기에 실패했습니다.");
					}
				}
			} catch (imageError) {
				console.error("이미지 처리 중 오류:", imageError);
				throw new Error("이미지 처리에 실패했습니다. 다시 시도해주세요.");
			}
		}

		const response = await axios.post(`${baseURL2}/cards`, formData, {
			// V2.1 수정
			headers: {
				"Content-Type": "multipart/form-data",
			},
			withCredentials: true,
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("요청 에러:", {
				status: error.response?.status,
				data: error.response?.data,
				headers: error.response?.headers,
			});
		}
		console.error("카드 전송 실패:", error);
		throw error;
	}
};

export const saveCard = async (cardId: number) => {
	try {
		const response = await axiosInstance.post(`/cards/${cardId}`);
		return response.data;
	} catch (error) {
		console.error("카드 보관 실패:", error);
		throw error;
	}
};

export const getCard = async (cardId: number) => {
	const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/cards/receive/${cardId}`;

	try {
		const response = await axios.get(apiUrl, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("API Error:", {
				message: error.message,
				code: error.code,
				status: error.response?.status,
				data: error.response?.data,
				url: error.config?.url,
			});
		}
		throw error;
	}
};
